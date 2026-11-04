export interface UserLocation {
  countryName: string;
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
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
  rating: number;
  ratingScale: number;
  reviewCount: string;
  pros: string[];
  cons: string[];
  consensusVerdict: string;
  reliabilitySentiment: string;
}

export interface LifespanAssessment {
  estimatedLifespanYears: string;
  durabilityScore: number;
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
  matchScore: number;
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

export interface ScrapedProductMeta {
  url: string;
  domain: string;
  title?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  inStock?: boolean;
  rating?: number;
  specs?: Record<string, string>;
}

export interface IntentDecision {
  action: 'CLARIFY' | 'SEARCH';
  clarification?: {
    question: string;
    suggestionPills: string[];
  };
  searchPlan?: {
    searchQueries: string[];
    targetStores: string[];
    category: string;
    priceRangeIntent: string;
    productTypes: string[];
  };
}
