import React from 'react';
import { X, Globe, Check, Store } from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';
import { SUPPORTED_COUNTRIES } from '../utils/geo.js';

export const RegionSelectorModal: React.FC = () => {
  const { currentLocation, selectCountry, isRegionSelectorOpen, setIsRegionSelectorOpen } = useLocation();

  if (!isRegionSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-obsidian-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel-elevated">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Select Shopping Region & Currency
              </h2>
              <p className="text-xs text-slate-400">
                Nexus queries live local retailers and evaluates durability/pricing in your selected country.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRegionSelectorOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countries Grid */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(SUPPORTED_COUNTRIES).map((country) => {
            const isSelected = currentLocation.countryCode === country.countryCode;

            return (
              <button
                key={country.countryCode}
                onClick={() => selectCountry(country.countryCode)}
                className={`relative flex flex-col p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/70 to-obsidian-850 border-cyan-500/60 shadow-glow-cyan/20 ring-1 ring-cyan-500/30'
                    : 'bg-obsidian-850/60 hover:bg-obsidian-800 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {country.countryName}
                      </h3>
                      <span className="text-xs font-mono text-cyan-400 font-medium">
                        {country.currencyCode} ({country.currencySymbol})
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 text-obsidian-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Major Retailers List */}
                <div className="mt-1 pt-2 border-t border-white/5 w-full">
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 mb-1">
                    <Store className="w-3 h-3 text-cyan-400/80" />
                    <span>Prioritized Stores:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {country.majorRetailers.slice(0, 4).map((store) => (
                      <span
                        key={store}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-obsidian-950/80 text-slate-300 border border-white/5"
                      >
                        {store}
                      </span>
                    ))}
                    {country.majorRetailers.length > 4 && (
                      <span className="text-[10px] text-slate-500 py-0.5 px-1 font-mono">
                        +{country.majorRetailers.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-white/10 bg-obsidian-950 text-xs text-slate-400 flex items-center justify-between">
          <span>Targeting regional retailers avoids irrelevant foreign stores and duty confusion.</span>
          <button
            onClick={() => setIsRegionSelectorOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
