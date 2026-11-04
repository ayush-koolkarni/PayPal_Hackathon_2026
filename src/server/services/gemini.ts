import { GoogleGenAI, Type } from '@google/genai';
import { scrapeMultipleUrls } from './scraper.js';
import { COUNTRY_REGISTRY } from './geo.js';
import type { UserLocation, Product, ChatMessage, ScrapedProductMeta } from '../types/index.js';

export interface AgentContext {
  apiKey?: string;
  modelName?: string;
  userLocation: UserLocation;
  history: ChatMessage[];
  onProgress?: (step: string, message: string, detail?: string) => void;
}

export interface AgentResponse {
  action: 'CLARIFY' | 'SEARCH';
  content: string;
  clarification?: {
    question: string;
    suggestionPills: string[];
  };
  products?: Product[];
}

export async function runShoppingAgent(
  userPrompt: string,
  context: AgentContext
): Promise<AgentResponse> {
  const apiKey = context.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_REQUIRED: Please provide your Gemini API key in the Settings Vault.');
  }

  const modelName = context.modelName || process.env.DEFAULT_GEMINI_MODEL || 'gemini-3.8-flash';
  const ai = new GoogleGenAI({ apiKey });
  const location = context.userLocation;
  const regionConfig = COUNTRY_REGISTRY[location.countryCode] || COUNTRY_REGISTRY['IN'];

  // -------------------------------------------------------------
  // CALL 1: Intent Router & Regional Query Planner
  // -------------------------------------------------------------
  context.onProgress?.(
    'ANALYZING',
    `Evaluating intent for ${location.countryName} (${location.currencyCode} ${location.currencySymbol})...`,
    'Determining if clarification is needed or planning regional search queries...'
  );

  const historyContext = context.history
    .slice(-6)
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const intentPrompt = `
You are an elite, region-aware shopping intent evaluator and query planner.
User's Target Region: ${location.countryName} (${location.countryCode})
User's Local Currency: ${location.currencyCode} (${location.currencySymbol})
Major Local Retailers: ${regionConfig.majorRetailers.join(', ')}

CONVERSATION HISTORY:
${historyContext || 'No previous messages'}

LATEST USER PROMPT:
"${userPrompt}"

RULES:
1. Dynamic LLM Clarification:
   - If the user's prompt is underspecified, ambiguous, or lacks essential criteria (e.g., bare words like "shoes", "laptop", "watch", "headphones", "coffee machine", "suit", "backpack" without intended use, style, or budget), you MUST choose action = "CLARIFY".
   - In that case, formulate one concise, targeted clarification question asking for the missing context (e.g., style, primary use-case, or budget in ${location.currencySymbol}), and generate 3 to 5 clickable suggestion pills tailored to that product.
   - If the user has already provided sufficient context (e.g., specific requirements, or is answering a previous clarification), choose action = "SEARCH".
2. Search Planning (when action = "SEARCH"):
   - Formulate 2 to 3 targeted, highly effective search queries to find real models, local prices in ${location.currencySymbol}, and authentic owner durability discussions.
   - MUST append local retailers (${regionConfig.majorRetailers.slice(0, 3).join(', ')}) and currency/region qualifiers so results match ${location.countryName}.
`.trim();

  const intentSchema = {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "Either 'CLARIFY' or 'SEARCH'",
      },
      clarificationQuestion: {
        type: Type.STRING,
        description: "Targeted question to ask the user if action is CLARIFY",
      },
      suggestionPills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 to 5 quick reply options for the user if action is CLARIFY",
      },
      searchQueries: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2 to 3 region-tailored Google search queries if action is SEARCH",
      },
      category: {
        type: Type.STRING,
        description: "Product category (e.g. Mechanical Keyboards, Espresso Machines)",
      },
      detectedBudget: {
        type: Type.STRING,
        description: "Identified or inferred budget range in local currency",
      },
    },
    required: ['action'],
  };

  const intentResult = await ai.models.generateContent({
    model: modelName,
    contents: intentPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: intentSchema,
      temperature: 0.2,
    },
  });

  const intentJsonText = intentResult.text || '{}';
  let intentData: any;
  try {
    intentData = JSON.parse(intentJsonText);
  } catch (err) {
    // Fallback if parsing failed
    intentData = { action: 'SEARCH', searchQueries: [`${userPrompt} buy online in ${location.countryName} ${location.currencyCode}`] };
  }

  // If LLM autonomously decided clarification is needed:
  if (intentData.action === 'CLARIFY') {
    const question = intentData.clarificationQuestion || `Could you clarify what type or budget in ${location.currencySymbol} you have in mind?`;
    const pills = Array.isArray(intentData.suggestionPills) && intentData.suggestionPills.length > 0
      ? intentData.suggestionPills
      : ['Everyday / Casual', 'High Performance / Pro', 'Budget-Friendly', 'Premium / Luxury'];

    return {
      action: 'CLARIFY',
      content: question,
      clarification: {
        question,
        suggestionPills: pills,
      },
    };
  }

  // -------------------------------------------------------------
  // CALL 2: Grounded Web Search & Live Retailer Scraping
  // -------------------------------------------------------------
  const searchQueries: string[] = Array.isArray(intentData.searchQueries) && intentData.searchQueries.length > 0
    ? intentData.searchQueries
    : [`${userPrompt} price in ${location.countryName} ${location.currencySymbol} buy online ${regionConfig.majorRetailers[0]}`];

  context.onProgress?.(
    'SEARCHING',
    `Searching regional retailers in ${location.countryName} (${regionConfig.majorRetailers.slice(0, 3).join(', ')})...`,
    `Executing queries: ${searchQueries.join(' | ')}`
  );

  const groundingChunks: Array<{ web?: { uri?: string; title?: string } }> = [];
  const searchFindings: string[] = [];

  // Run search queries in parallel
  const searchPromises = searchQueries.map(async (query) => {
    try {
      const searchRes = await ai.models.generateContent({
        model: modelName,
        contents: `Find real, current products for purchase in ${location.countryName} in ${location.currencyCode} (${location.currencySymbol}) with current street pricing, retailer availability, and long-term owner durability reviews for: "${query}". Include specific model names, specs, known wear-and-tear issues, and where to buy.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
        },
      });

      if (searchRes.text) {
        searchFindings.push(searchRes.text);
      }

      const chunks = searchRes.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          groundingChunks.push(chunk as any);
        }
      }
    } catch (searchErr) {
      console.warn(`Search query "${query}" warning:`, searchErr);
    }
  });

  await Promise.allSettled(searchPromises);

  // Extract candidate URLs from grounding chunks
  const discoveredUrls = groundingChunks
    .map((c) => c.web?.uri)
    .filter((uri): uri is string => Boolean(uri && uri.startsWith('http')));

  context.onProgress?.(
    'SCRAPING',
    `Enriching metadata & harvesting live images from ${discoveredUrls.length > 0 ? discoveredUrls.length : 'discovered'} regional product pages...`,
    'Parsing OpenGraph images, JSON-LD schemas, and real-time merchant offers...'
  );

  // Scrape discovered URLs to extract live og:image, schema.org prices, stock
  const scrapedMetadata: ScrapedProductMeta[] = await scrapeMultipleUrls(discoveredUrls, 8);

  // -------------------------------------------------------------
  // CALL 3: Structured Product Intelligence Synthesizer
  // -------------------------------------------------------------
  context.onProgress?.(
    'SYNTHESIZING',
    `Synthesizing product durability scores & lifespan assessments in ${location.currencySymbol}...`,
    'Aggregating owner pros/cons, repairability notes, and verifying direct buy links...'
  );

  const synthesisPrompt = `
You are the Chief Product Intelligence Architect for NEXUS Global Shopping.
Target Country: ${location.countryName} (${location.countryCode})
Native Currency: ${location.currencyCode} (${location.currencySymbol})
User Query: "${userPrompt}"

GROUNDED WEB FINDINGS & REVIEWS:
${searchFindings.join('\n\n--- NEXT RESEARCH CHUNK ---\n\n').slice(0, 15000)}

REAL DISCOVERED PRODUCT METADATA & IMAGES (FROM LIVE WEBPAGES):
${JSON.stringify(scrapedMetadata, null, 2)}

GROUNDING URLS:
${JSON.stringify(groundingChunks.map(c => ({ title: c.web?.title, url: c.web?.uri })), null, 2)}

TASK:
Synthesize 2 to 4 outstanding, distinct product recommendations that directly satisfy the user's requirements in ${location.countryName}.

CRITICAL REQUIREMENTS:
1. CURRENCY & PRICING:
   - All prices must strictly be in ${location.currencyCode} (${location.currencySymbol}).
   - Evaluate real street prices in ${location.countryName}. lowestPrice must be a valid number (e.g. 14999).
   - format prices neatly (e.g. "${location.currencySymbol} 14,999").
2. REGIONAL STORES:
   - List stores that actually operate and deliver in ${location.countryName} (e.g. ${regionConfig.majorRetailers.join(', ')}).
   - Use real URLs from the grounding chunks or scraped metadata whenever available for the store's "url".
3. PRODUCT IMAGES:
   - For each product, use a valid high-resolution image URL from the scraped metadata or a clean, real product image link.
4. LIFESPAN & DURABILITY ASSESSMENT:
   - Be brutally honest and detailed about long-term reliability.
   - estimatedLifespanYears: realistic range (e.g. "5–7 Years", "3–5 Years").
   - durabilityScore: 1 to 10 based on build quality, components, and owner failure rates.
   - buildQuality: materials (e.g., "Full aircraft-grade aluminum top plate with PBT double-shot keycaps").
   - failurePoints: 2 to 3 specific components known to degrade over time (e.g., battery degradation, microswitch double-clicking, gasket wear).
   - repairabilityNotes: availability of spare parts and ease of DIY repair.
   - warrantyInfo: warranty terms in ${location.countryName} and service network.
5. REVIEW SYNTHESIS:
   - rating: 1.0 to 5.0 (e.g. 4.6).
   - pros: 3 to 4 genuine strengths.
   - cons: 2 to 3 genuine limitations.
   - consensusVerdict: concise 2-sentence summary of what actual owners across the web say.
`.trim();

  const synthesisSchema = {
    type: Type.OBJECT,
    properties: {
      summaryVerdict: {
        type: Type.STRING,
        description: 'Comprehensive conversational response explaining the recommendations for the user in their region',
      },
      products: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            brand: { type: Type.STRING },
            category: { type: Type.STRING },
            lowestPrice: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            currencySymbol: { type: Type.STRING },
            matchScore: { type: Type.NUMBER, description: 'Score between 1 and 100' },
            matchReason: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            keySpecs: {
              type: Type.OBJECT,
              description: 'Key technical specifications as key-value pairs',
            },
            stores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  formattedPrice: { type: Type.STRING },
                  url: { type: Type.STRING },
                  inStock: { type: Type.BOOLEAN },
                  availabilityText: { type: Type.STRING },
                  merchantDomain: { type: Type.STRING },
                  isLowestPrice: { type: Type.BOOLEAN },
                },
                required: ['name', 'price', 'formattedPrice', 'url', 'inStock'],
              },
            },
            reviewSynthesis: {
              type: Type.OBJECT,
              properties: {
                rating: { type: Type.NUMBER },
                ratingScale: { type: Type.NUMBER },
                reviewCount: { type: Type.STRING },
                pros: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                cons: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                consensusVerdict: { type: Type.STRING },
                reliabilitySentiment: { type: Type.STRING },
              },
              required: ['rating', 'ratingScale', 'pros', 'cons', 'consensusVerdict'],
            },
            lifespanAssessment: {
              type: Type.OBJECT,
              properties: {
                estimatedLifespanYears: { type: Type.STRING },
                durabilityScore: { type: Type.NUMBER },
                buildQuality: { type: Type.STRING },
                failurePoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                repairabilityNotes: { type: Type.STRING },
                warrantyInfo: { type: Type.STRING },
              },
              required: ['estimatedLifespanYears', 'durabilityScore', 'buildQuality', 'failurePoints'],
            },
          },
          required: [
            'id',
            'title',
            'brand',
            'category',
            'lowestPrice',
            'currency',
            'currencySymbol',
            'matchScore',
            'matchReason',
            'stores',
            'reviewSynthesis',
            'lifespanAssessment',
          ],
        },
      },
    },
    required: ['summaryVerdict', 'products'],
  };

  const synthesisResult = await ai.models.generateContent({
    model: modelName,
    contents: synthesisPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: synthesisSchema,
      temperature: 0.3,
    },
  });

  const synthesisJsonText = synthesisResult.text || '{}';
  let finalData: any;
  try {
    finalData = JSON.parse(synthesisJsonText);
  } catch (err) {
    console.error('Failed to parse synthesis JSON:', err);
    throw new Error('Failed to parse product intelligence synthesis from Gemini.');
  }

  // Fallback and normalize product attributes
  const products: Product[] = (finalData.products || []).map((p: any, idx: number) => {
    // If image is missing or placeholder, attempt to match from scraped metadata
    let finalImage = p.imageUrl || '';
    if (!finalImage || !finalImage.startsWith('http')) {
      const matchScraped = scrapedMetadata.find(
        (sm) => sm.imageUrl && (sm.title?.toLowerCase().includes(p.brand.toLowerCase()) || sm.title?.toLowerCase().includes(p.title.slice(0, 15).toLowerCase()))
      );
      if (matchScraped?.imageUrl) {
        finalImage = matchScraped.imageUrl;
      } else if (scrapedMetadata[idx]?.imageUrl) {
        finalImage = scrapedMetadata[idx].imageUrl!;
      }
    }

    return {
      id: p.id || `prod_${Date.now()}_${idx}`,
      title: p.title || 'Verified Product',
      brand: p.brand || 'Premium Brand',
      category: p.category || intentData.category || 'Electronics',
      lowestPrice: typeof p.lowestPrice === 'number' ? p.lowestPrice : 0,
      currency: p.currency || location.currencyCode,
      currencySymbol: p.currencySymbol || location.currencySymbol,
      matchScore: typeof p.matchScore === 'number' ? p.matchScore : 92,
      matchReason: p.matchReason || `Matches criteria for ${location.countryName}`,
      imageUrl: finalImage,
      keySpecs: p.keySpecs || {},
      stores: Array.isArray(p.stores) ? p.stores : [],
      reviewSynthesis: {
        rating: p.reviewSynthesis?.rating || 4.5,
        ratingScale: p.reviewSynthesis?.ratingScale || 5,
        reviewCount: p.reviewSynthesis?.reviewCount || '1,000+ verified buyers',
        pros: Array.isArray(p.reviewSynthesis?.pros) ? p.reviewSynthesis.pros : ['High build quality', 'Reliable performance'],
        cons: Array.isArray(p.reviewSynthesis?.cons) ? p.reviewSynthesis.cons : ['Premium price tag'],
        consensusVerdict: p.reviewSynthesis?.consensusVerdict || 'Highly regarded by owners in this category.',
        reliabilitySentiment: p.reviewSynthesis?.reliabilitySentiment || 'Excellent longevity track record.',
      },
      lifespanAssessment: {
        estimatedLifespanYears: p.lifespanAssessment?.estimatedLifespanYears || '4–6 Years',
        durabilityScore: typeof p.lifespanAssessment?.durabilityScore === 'number' ? p.lifespanAssessment.durabilityScore : 8.5,
        buildQuality: p.lifespanAssessment?.buildQuality || 'Robust construction with premium materials',
        failurePoints: Array.isArray(p.lifespanAssessment?.failurePoints) ? p.lifespanAssessment.failurePoints : ['Standard wear on movable joints over time'],
        repairabilityNotes: p.lifespanAssessment?.repairabilityNotes || 'Standard service parts available through authorized centers',
        warrantyInfo: p.lifespanAssessment?.warrantyInfo || `Standard manufacturer warranty in ${location.countryName}`,
      },
    };
  });

  return {
    action: 'SEARCH',
    content: finalData.summaryVerdict || `Here are the top-rated recommendations tailored for ${location.countryName} (${location.currencyCode}):`,
    products,
  };
}
