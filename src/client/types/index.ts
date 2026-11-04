export interface UserLocation {
  countryName: string;
  countryCode: string; // e.g., "IN", "US", "GB"
  currencyCode: string; // e.g., "INR", "USD", "GBP"
  currencySymbol: string; // e.g., "₹", "$", "£"
  timezone: string;
  city?: string;
  regionName?: string;
}

export interface RetailerStore {
  name: string;
  price: number;
  formattedPrice: string;
  url: string;
  inStock: boolean;
  availabilityText?: string;
  merchantDomain?: string;
  isLowestPrice?: boolean;
}

export interface ReviewSynthesis {
  rating: number; // e.g., 4.7
  ratingScale: number; // e.g., 5
  reviewCount: string; // e.g., "8,400+ reviews"
  pros: string[];
  cons: string[];
  consensusVerdict: string;
  reliabilitySentiment: string;
}

export interface LifespanAssessment {
  estimatedLifespanYears: string; // e.g., "5–7 Years"
  durabilityScore: number; // 1 to 10
  buildQuality: string;
  failurePoints: string[];
  repairabilityNotes: string;
  warrantyInfo: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  lowestPrice: number;
  currency: string;
  currencySymbol: string;
  matchScore: number; // e.g., 95
  matchReason: string;
  imageUrl: string;
  keySpecs: Record<string, string>;
  stores: RetailerStore[];
  reviewSynthesis: ReviewSynthesis;
  lifespanAssessment: LifespanAssessment;
}

export interface ClarificationData {
  question: string;
  suggestionPills: string[];
  contextHint?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  action?: 'CLARIFY' | 'SEARCH' | 'INFO';
  clarification?: ClarificationData;
  products?: Product[];
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  countryCode: string;
  currencyCode: string;
}

export interface StreamingProgress {
  step: 'ANALYZING' | 'SEARCHING' | 'SCRAPING' | 'SYNTHESIZING' | 'DONE' | 'ERROR';
  message: string;
  detail?: string;
}

export interface ApiSettings {
  geminiApiKey: string;
  geminiModel: string;
  serpApiKey?: string;
  tavilyApiKey?: string;
  firecrawlApiKey?: string;
  overrideRegion?: UserLocation | null;
  autoDetectLocation: boolean;
}
