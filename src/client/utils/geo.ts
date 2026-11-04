import type { UserLocation } from '../types/index.js';

export interface CountryData {
  countryName: string;
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
  flag: string;
  majorRetailers: string[];
}

export const SUPPORTED_COUNTRIES: Record<string, CountryData> = {
  IN: {
    countryName: 'India',
    countryCode: 'IN',
    currencyCode: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    majorRetailers: ['Amazon.in', 'Flipkart', 'Croma', 'Reliance Digital', 'Tata CLiQ', 'Myntra'],
  },
  US: {
    countryName: 'United States',
    countryCode: 'US',
    currencyCode: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    majorRetailers: ['Amazon.com', 'Best Buy', 'Walmart', 'Target', 'B&H Photo', 'Newegg'],
  },
  GB: {
    countryName: 'United Kingdom',
    countryCode: 'GB',
    currencyCode: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    majorRetailers: ['Amazon.co.uk', 'Currys', 'Argos', 'John Lewis', 'AO.com'],
  },
  CA: {
    countryName: 'Canada',
    countryCode: 'CA',
    currencyCode: 'CAD',
    currencySymbol: 'CA$',
    flag: '🇨🇦',
    majorRetailers: ['Amazon.ca', 'Best Buy Canada', 'Canadian Tire', 'Walmart Canada'],
  },
  DE: {
    countryName: 'Germany & EU',
    countryCode: 'DE',
    currencyCode: 'EUR',
    currencySymbol: '€',
    flag: '🇩🇪',
    majorRetailers: ['Amazon.de', 'MediaMarkt', 'Saturn', 'Otto', 'Cyberport'],
  },
  JP: {
    countryName: 'Japan',
    countryCode: 'JP',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    flag: '🇯🇵',
    majorRetailers: ['Amazon.co.jp', 'Rakuten', 'Yodobashi Camera', 'Bic Camera'],
  },
  AU: {
    countryName: 'Australia',
    countryCode: 'AU',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
    majorRetailers: ['Amazon.com.au', 'JB Hi-Fi', 'The Good Guys', 'Harvey Norman'],
  },
  AE: {
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    currencyCode: 'AED',
    currencySymbol: 'AED',
    flag: '🇦🇪',
    majorRetailers: ['Amazon.ae', 'Noon', 'Sharaf DG', 'Virgin Megastore'],
  },
  SG: {
    countryName: 'Singapore',
    countryCode: 'SG',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    flag: '🇸🇬',
    majorRetailers: ['Amazon.sg', 'Shopee SG', 'Lazada SG', 'Courts SG'],
  },
};

const TIMEZONE_MAP: Record<string, string> = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'America/New_York': 'US',
  'America/Detroit': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'Pacific/Honolulu': 'US',
  'Europe/London': 'GB',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'DE',
  'Europe/Rome': 'DE',
  'Asia/Tokyo': 'JP',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Asia/Dubai': 'AE',
  'Asia/Singapore': 'SG',
};

export async function detectClientLocation(): Promise<UserLocation> {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  // 1. Check browser timezone first
  let detectedCode = TIMEZONE_MAP[tz];

  // 2. Try fast client-side cross-check via ipapi.co (with 2.5s timeout)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.country_code && SUPPORTED_COUNTRIES[data.country_code]) {
        detectedCode = data.country_code;
      }
    }
  } catch (e) {
    // Graceful fallback to timezone detection
  }

  // Fallback to IN if still unresolved
  if (!detectedCode || !SUPPORTED_COUNTRIES[detectedCode]) {
    detectedCode = 'IN';
  }

  const country = SUPPORTED_COUNTRIES[detectedCode];
  return {
    countryName: country.countryName,
    countryCode: country.countryCode,
    currencyCode: country.currencyCode,
    currencySymbol: country.currencySymbol,
    timezone: tz,
  };
}

export function formatCurrencyAmount(amount: number, currencyCode: string, currencySymbol: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `${currencySymbol} ${amount.toLocaleString()}`;
  }
}
