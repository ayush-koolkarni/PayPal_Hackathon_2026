import { Router, Request, Response } from 'express';
import { resolveLocationFromTimezone, getLocationByCountryCode, COUNTRY_REGISTRY } from '../services/geo.js';

const router = Router();

router.get('/location', (req: Request, res: Response) => {
  const queryTimezone = req.query.timezone as string | undefined;
  const queryCountry = req.query.country as string | undefined;

  let location;
  if (queryCountry && COUNTRY_REGISTRY[queryCountry.toUpperCase()]) {
    location = getLocationByCountryCode(queryCountry);
  } else if (queryTimezone) {
    location = resolveLocationFromTimezone(queryTimezone);
  } else {
    // Default fallback to India (or US if client is unknown)
    location = getLocationByCountryCode('IN');
  }

  const regions = Object.values(COUNTRY_REGISTRY).map(r => ({
    countryName: r.countryName,
    countryCode: r.countryCode,
    currencyCode: r.currencyCode,
    currencySymbol: r.currencySymbol,
    majorRetailers: r.majorRetailers,
  }));

  res.json({
    location,
    regions,
  });
});

router.get('/location/regions', (_req: Request, res: Response) => {
  const regions = Object.values(COUNTRY_REGISTRY).map(r => ({
    countryName: r.countryName,
    countryCode: r.countryCode,
    currencyCode: r.currencyCode,
    currencySymbol: r.currencySymbol,
    majorRetailers: r.majorRetailers,
  }));

  res.json({ regions });
});

export default router;
