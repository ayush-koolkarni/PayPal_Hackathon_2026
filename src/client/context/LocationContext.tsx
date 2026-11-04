import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserLocation } from '../types/index.js';
import { detectClientLocation, SUPPORTED_COUNTRIES } from '../utils/geo.js';
import { useSettings } from './SettingsContext.js';

interface LocationContextType {
  currentLocation: UserLocation;
  setCurrentLocation: (loc: UserLocation) => void;
  selectCountry: (countryCode: string) => void;
  isRegionSelectorOpen: boolean;
  setIsRegionSelectorOpen: (open: boolean) => void;
  isLoadingLocation: boolean;
}

const DEFAULT_LOCATION: UserLocation = {
  countryName: 'India',
  countryCode: 'IN',
  currencyCode: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata',
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initLocation() {
      // Check if user manually locked a region in settings
      if (!settings.autoDetectLocation && settings.overrideRegion) {
        if (isMounted) {
          setCurrentLocation(settings.overrideRegion);
          setIsLoadingLocation(false);
        }
        return;
      }

      // Check localStorage cached manual override
      try {
        const cached = localStorage.getItem('nexus_user_location');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.countryCode && SUPPORTED_COUNTRIES[parsed.countryCode]) {
            if (isMounted) {
              setCurrentLocation(parsed);
              setIsLoadingLocation(false);
            }
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      // Auto-detect client location
      try {
        const detected = await detectClientLocation();
        if (isMounted) {
          setCurrentLocation(detected);
          localStorage.setItem('nexus_user_location', JSON.stringify(detected));
        }
      } catch (err) {
        console.error('Geo-location error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingLocation(false);
        }
      }
    }

    initLocation();

    return () => {
      isMounted = false;
    };
  }, [settings.autoDetectLocation, settings.overrideRegion]);

  const selectCountry = (countryCode: string) => {
    const country = SUPPORTED_COUNTRIES[countryCode.toUpperCase()] || SUPPORTED_COUNTRIES['IN'];
    const newLoc: UserLocation = {
      countryName: country.countryName,
      countryCode: country.countryCode,
      currencyCode: country.currencyCode,
      currencySymbol: country.currencySymbol,
      timezone: currentLocation.timezone,
    };
    setCurrentLocation(newLoc);
    try {
      localStorage.setItem('nexus_user_location', JSON.stringify(newLoc));
    } catch (e) {
      // ignore
    }
    setIsRegionSelectorOpen(false);
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        selectCountry,
        isRegionSelectorOpen,
        setIsRegionSelectorOpen,
        isLoadingLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
