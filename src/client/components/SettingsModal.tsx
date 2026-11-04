import React, { useState } from 'react';
import { X, Key, Cpu, Shield, ExternalLink, Check, Eye, EyeOff, Layers, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.js';

const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended)', desc: 'Next-gen flagship speed & deep reasoning with search grounding' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast, high-efficiency multimodal reasoning' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Maximum analytical depth for complex multi-product comparisons' },
  { id: 'custom', name: 'Custom Model ID...', desc: 'Specify any valid Google Gemini model identifier' },
];

export const SettingsModal: React.FC = () => {
  const { settings, updateSettings, isSettingsOpen, setIsSettingsOpen } = useSettings();

  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.geminiModel || 'gemini-3.8-flash');
  const [customModel, setCustomModel] = useState('');
  const [serpKey, setSerpKey] = useState(settings.serpApiKey || '');
  const [tavilyKey, setTavilyKey] = useState(settings.tavilyApiKey || '');
  const [firecrawlKey, setFirecrawlKey] = useState(settings.firecrawlApiKey || '');
  const [autoDetect, setAutoDetect] = useState(settings.autoDetectLocation ?? true);

  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalModel = model === 'custom' ? (customModel.trim() || 'gemini-3.8-flash') : model;
    updateSettings({
      geminiApiKey: geminiKey.trim(),
      geminiModel: finalModel,
      serpApiKey: serpKey.trim(),
      tavilyApiKey: tavilyKey.trim(),
      firecrawlApiKey: firecrawlKey.trim(),
      autoDetectLocation: autoDetect,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSettingsOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-obsidian-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel-elevated">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                API Keys & Intelligence Vault
              </h2>
              <p className="text-xs text-slate-400">
                Configure your Gemini credentials & search engines. Stored locally in your browser.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Gemini API Key</span>
                <span className="text-[10px] text-cyan-400 font-mono">(Primary AI Brain)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-0.5 hover:underline"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full glass-input px-3.5 py-2.5 pr-10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Nexus uses the official <code className="text-cyan-300 font-mono">@google/genai</code> SDK with Google Search Grounding. Backend fallback to <code className="text-slate-300 font-mono">process.env.GEMINI_API_KEY</code> is active.
            </p>
          </div>

          {/* Gemini Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini Model</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-white bg-obsidian-900 focus:outline-none"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-obsidian-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
            {model === 'custom' && (
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. gemini-3.8-flash"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono mt-1"
              />
            )}
          </div>

          {/* Geo-Location Preference */}
          <div className="p-3.5 rounded-xl bg-obsidian-850 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Automatic Client Location Detection
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Detects country & currency from browser timezone & IP to lock region search.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-obsidian-950 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Optional External Scraper Keys */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">
                Optional Enhanced Scraper Providers
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              The platform operates fully using native Gemini Google Search Grounding and Cheerio live metadata scraping. You may optionally provide additional keys:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">SerpAPI Key (Optional)</label>
                <input
                  type="password"
                  value={serpKey}
                  onChange={(e) => setSerpKey(e.target.value)}
                  placeholder="Optional..."
                  className="w-full glass-input px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tavily API Key (Optional)</label>
                <input
                  type="password"
                  value={tavilyKey}
                  onChange={(e) => setTavilyKey(e.target.value)}
                  placeholder="Optional..."
                  className="w-full glass-input px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian-950 font-bold text-xs shadow-glow-cyan/20 transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
