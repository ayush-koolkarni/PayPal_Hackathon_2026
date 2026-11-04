import React from 'react';
import { Globe, Settings, Menu, Sparkles, ShieldCheck, Key } from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { SUPPORTED_COUNTRIES } from '../utils/geo.js';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentLocation, setIsRegionSelectorOpen } = useLocation();
  const { hasGeminiKey, setIsSettingsOpen } = useSettings();

  const currentCountryData = SUPPORTED_COUNTRIES[currentLocation.countryCode] || {
    flag: '🌐',
    countryName: currentLocation.countryName,
    currencySymbol: currentLocation.currencySymbol,
  };

  return (
    <header className="h-16 px-4 md:px-6 border-b border-white/10 glass-panel flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-obsidian-900 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-violet-600/20 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan/20">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-wider text-base md:text-lg gradient-text-cyan font-mono">
                NEXUS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Global Agentic Product & Durability Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Right: Region Switcher & Settings Vault */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Region Switcher Pill */}
        <button
          onClick={() => setIsRegionSelectorOpen(true)}
          className="group flex items-center space-x-2 px-3 py-1.5 rounded-full bg-obsidian-900/90 hover:bg-obsidian-850 border border-white/10 hover:border-cyan-500/50 transition-all text-xs font-medium text-slate-200 shadow-sm"
          title="Change Shopping Region & Currency"
        >
          <span className="text-base">{currentCountryData.flag}</span>
          <span className="hidden sm:inline font-medium">{currentLocation.countryName}</span>
          <span className="font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40">
            {currentLocation.currencyCode} {currentLocation.currencySymbol}
          </span>
          <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors ml-0.5" />
        </button>

        {/* API Key Status & Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            hasGeminiKey
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:border-amber-400 animate-pulse'
          }`}
          title="Configure API Keys & AI Models"
        >
          {hasGeminiKey ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-mono">Connected</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">Key Required</span>
            </>
          )}
          <Settings className="w-3.5 h-3.5 text-slate-400 ml-1 hover:rotate-45 transition-transform" />
        </button>
      </div>
    </header>
  );
};
