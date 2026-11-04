import type { UserLocation } from '../types/index.js';

export interface CountryConfig {
  countryName: string;
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
  defaultTimezone: string;
  majorRetailers: string[];
  searchDomainHints: string[];
}

export const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  IN: {
    countryName: 'India',
    countryCode: 'IN',
    currencyCode: 'INR',
    currencySymbol: '₹',
    defaultTimezone: 'Asia/Kolkata',
    majorRetailers: [
      'Amazon.in',
      'Flipkart',
      'Croma',
      'Reliance Digital',
      'Tata CLiQ',
      'Myntra',
      'Ajio',
      'Vijay Sales',
      'MDComputers',
      'Vedant Computers',
      'Nykaa'
    ],
    searchDomainHints: ['amazon.in', 'flipkart.com', 'croma.com', 'reliancedigital.in', 'tatacliq.com', 'myntra.com']
  },
  US: {
    countryName: 'United States',
    countryCode: 'US',
    currencyCode: 'USD',
    currencySymbol: '$',
    defaultTimezone: 'America/New_York',
    majorRetailers: [
      'Amazon.com',
      'Best Buy',
      'Walmart',
      'Target',
      'B&H Photo Video',
      'Newegg',
      'REI',
      'Home Depot',
      'Costco'
    ],
    searchDomainHints: ['amazon.com', 'bestbuy.com', 'walmart.com', 'target.com', 'bhphotovideo.com', 'newegg.com']
  },
  GB: {
    countryName: 'United Kingdom',
    countryCode: 'GB',
    currencyCode: 'GBP',
    currencySymbol: '£',
    defaultTimezone: 'Europe/London',
    majorRetailers: [
      'Amazon.co.uk',
      'Currys',
      'Argos',
      'John Lewis',
      'AO.com',
      'Very.co.uk',
      'ASOS'
    ],
    searchDomainHints: ['amazon.co.uk', 'currys.co.uk', 'argos.co.uk', 'johnlewis.com', 'ao.com']
  },
  CA: {
    countryName: 'Canada',
    countryCode: 'CA',
    currencyCode: 'CAD',
    currencySymbol: 'CA$',
    defaultTimezone: 'America/Toronto',
    majorRetailers: [
      'Amazon.ca',
      'Best Buy Canada',
      'Canadian Tire',
      'Walmart Canada',
      'Memory Express',
      'Costco Canada'
    ],
    searchDomainHints: ['amazon.ca', 'bestbuy.ca', 'canadiantire.ca', 'walmart.ca']
  },
  DE: {
    countryName: 'Germany & EU',
    countryCode: 'DE',
    currencyCode: 'EUR',
    currencySymbol: '€',
    defaultTimezone: 'Europe/Berlin',
    majorRetailers: [
      'Amazon.de',
      'MediaMarkt',
      'Saturn',
      'Otto',
      'Alternate.de',
      'Cyberport'
    ],
    searchDomainHints: ['amazon.de', 'mediamarkt.de', 'saturn.de', 'otto.de']
  },
  JP: {
    countryName: 'Japan',
    countryCode: 'JP',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    defaultTimezone: 'Asia/Tokyo',
    majorRetailers: [
      'Amazon.co.jp',
      'Rakuten Ichiba',
      'Yodobashi Camera',
      'Bic Camera',
      'Yahoo! Shopping Japan'
    ],
    searchDomainHints: ['amazon.co.jp', 'rakuten.co.jp', 'yodobashi.com', 'biccamera.com']
  },
  AU: {
    countryName: 'Australia',
    countryCode: 'AU',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    defaultTimezone: 'Australia/Sydney',
    majorRetailers: [
      'Amazon.com.au',
      'JB Hi-Fi',
      'The Good Guys',
      'Harvey Norman',
      'Kogan',
      'Officeworks'
    ],
    searchDomainHints: ['amazon.com.au', 'jbhifi.com.au', 'thegoodguys.com.au', 'harveynorman.com.au']
  },
  AE: {
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    currencyCode: 'AED',
    currencySymbol: 'AED',
    defaultTimezone: 'Asia/Dubai',
    majorRetailers: [
      'Amazon.ae',
      'Noon.com',
      'Sharaf DG',
      'Virgin Megastore UAE',
      'Carrefour UAE'
    ],
    searchDomainHints: ['amazon.ae', 'noon.com', 'sharafdg.com']
  },
  SG: {
    countryName: 'Singapore',
    countryCode: 'SG',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    defaultTimezone: 'Asia/Singapore',
    majorRetailers: [
      'Amazon.sg',
      'Shopee Singapore',
      'Lazada Singapore',
      'Courts SG',
      'Challenger Singapore'
    ],
    searchDomainHints: ['amazon.sg', 'shopee.sg', 'lazada.sg']
  }
};

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'America/New_York': 'US',
  'America/Detroit': 'US',
  'America/Kentucky/Louisville': 'US',
  'America/Chicago': 'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'Europe/London': 'GB',
  'Europe/Belfast': 'GB',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'DE',
  'Europe/Rome': 'DE',
  'Europe/Madrid': 'DE',
  'Europe/Amsterdam': 'DE',
  'Europe/Brussels': 'DE',
  'Europe/Vienna': 'DE',
  'Asia/Tokyo': 'JP',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Asia/Dubai': 'AE',
  'Asia/Singapore': 'SG',
};

export function resolveLocationFromTimezone(timezone: string): UserLocation {
  const countryCode = TIMEZONE_TO_COUNTRY[timezone] || 'IN'; // Default to India if unresolved
  const config = COUNTRY_REGISTRY[countryCode] || COUNTRY_REGISTRY['IN'];
  return {
    countryName: config.countryName,
    countryCode: config.countryCode,
    currencyCode: config.currencyCode,
    currencySymbol: config.currencySymbol,
    timezone: timezone || config.defaultTimezone
  };
}

export function getLocationByCountryCode(code: string): UserLocation {
  const normalized = (code || 'IN').toUpperCase();
  const config = COUNTRY_REGISTRY[normalized] || COUNTRY_REGISTRY['IN'];
  return {
    countryName: config.countryName,
    countryCode: config.countryCode,
    currencyCode: config.currencyCode,
    currencySymbol: config.currencySymbol,
    timezone: config.defaultTimezone
  };
}
