import * as cheerio from 'cheerio';
import type { ScrapedProductMeta } from '../types/index.js';

export interface ScraperOptions {
  serpApiKey?: string;
  tavilyApiKey?: string;
  firecrawlApiKey?: string;
}

const BROWSER_USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

export async function scrapeUrlMetadata(targetUrl: string): Promise<ScrapedProductMeta | null> {
  try {
    const parsed = new URL(targetUrl);
    const domain = parsed.hostname.replace(/^www\./, '');

    // Skip non-product or useless domains
    if (domain.includes('youtube.com') || domain.includes('wikipedia.org') || domain.includes('google.com')) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const ua = BROWSER_USER_AGENTS[Math.floor(Math.random() * BROWSER_USER_AGENTS.length)];
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Try Extracting JSON-LD Product Data
    let jsonLdImage: string | undefined;
    let jsonLdPrice: number | undefined;
    let jsonLdCurrency: string | undefined;
    let jsonLdInStock: boolean | undefined;
    let jsonLdRating: number | undefined;
    let jsonLdTitle: string | undefined;

    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const text = $(elem).html();
        if (!text) return;
        const data = JSON.parse(text);

        const checkItem = (item: any) => {
          if (!item || typeof item !== 'object') return;
          const type = item['@type'];
          if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
            if (item.name && !jsonLdTitle) jsonLdTitle = item.name;

            // Image
            if (item.image) {
              if (typeof item.image === 'string') jsonLdImage = item.image;
              else if (Array.isArray(item.image) && item.image[0]) {
                jsonLdImage = typeof item.image[0] === 'string' ? item.image[0] : item.image[0].url;
              } else if (item.image.url) {
                jsonLdImage = item.image.url;
              }
            }

            // Offers
            if (item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offer) {
                if (offer.price) {
                  const num = parseFloat(offer.price.toString().replace(/[^0-9.]/g, ''));
                  if (!isNaN(num)) jsonLdPrice = num;
                }
                if (offer.priceCurrency) jsonLdCurrency = offer.priceCurrency;
                if (offer.availability) {
                  jsonLdInStock = offer.availability.toLowerCase().includes('instock');
                }
              }
            }

            // Rating
            if (item.aggregateRating && item.aggregateRating.ratingValue) {
              const r = parseFloat(item.aggregateRating.ratingValue);
              if (!isNaN(r)) jsonLdRating = r;
            }
          }
        };

        if (Array.isArray(data)) {
          data.forEach(checkItem);
        } else if (data['@graph'] && Array.isArray(data['@graph'])) {
          data['@graph'].forEach(checkItem);
        } else {
          checkItem(data);
        }
      } catch (e) {
        // ignore JSON-LD parse errors
      }
    });

    // 2. Extract OpenGraph & Twitter Meta Tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('link[rel="image_src"]').attr('href');

    const metaPriceStr =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content');
    const metaCurrency =
      $('meta[property="product:price:currency"]').attr('content') ||
      $('meta[property="og:price:currency"]').attr('content');

    let metaPrice: number | undefined;
    if (metaPriceStr) {
      const parsed = parseFloat(metaPriceStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed)) metaPrice = parsed;
    }

    // Resolve Best Candidate Values
    const resolvedTitle = jsonLdTitle || ogTitle || '';
    let resolvedImage = jsonLdImage || ogImage;

    // Normalize relative image URLs
    if (resolvedImage && !resolvedImage.startsWith('http')) {
      try {
        resolvedImage = new URL(resolvedImage, targetUrl).toString();
      } catch {
        // ignore
      }
    }

    const resolvedPrice = jsonLdPrice || metaPrice;
    const resolvedCurrency = jsonLdCurrency || metaCurrency;

    return {
      url: targetUrl,
      domain,
      title: resolvedTitle.slice(0, 160),
      imageUrl: resolvedImage,
      price: resolvedPrice,
      currency: resolvedCurrency,
      inStock: jsonLdInStock ?? true,
      rating: jsonLdRating,
    };
  } catch (error) {
    return null;
  }
}

export async function scrapeMultipleUrls(urls: string[], limit: number = 8): Promise<ScrapedProductMeta[]> {
  const uniqueUrls = Array.from(new Set(urls)).slice(0, limit);
  const promises = uniqueUrls.map(url => scrapeUrlMetadata(url));
  const results = await Promise.allSettled(promises);

  const valid: ScrapedProductMeta[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      valid.push(r.value);
    }
  }
  return valid;
}
