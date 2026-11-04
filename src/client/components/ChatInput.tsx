import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Globe, CornerDownLeft } from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';
import { SUPPORTED_COUNTRIES } from '../utils/geo.js';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentLocation, setIsRegionSelectorOpen } = useLocation();

  const country = SUPPORTED_COUNTRIES[currentLocation.countryCode] || {
    flag: '🌐',
    countryName: currentLocation.countryName,
    currencySymbol: currentLocation.currencySymbol,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 md:pb-6">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-obsidian-900/90 border border-white/10 hover:border-cyan-500/50 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30 glass-panel-elevated shadow-2xl transition-all duration-200"
      >
        {/* Top Mini Toolbar: Active Region Indicator */}
        <div className="px-4 pt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5">
          <button
            type="button"
            onClick={() => setIsRegionSelectorOpen(true)}
            className="flex items-center space-x-1.5 hover:text-cyan-300 transition-colors cursor-pointer group"
          >
            <span>{country.flag}</span>
            <span>Targeting:</span>
            <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
              {currentLocation.countryName} ({currentLocation.currencyCode} {currentLocation.currencySymbol})
            </span>
            <Globe className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 ml-0.5" />
          </button>

          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded bg-obsidian-800 text-slate-400 font-mono text-[9px]">Enter</kbd> to send
          </span>
        </div>

        {/* Input Field & Submit Button */}
        <div className="flex items-end p-2.5 md:p-3 space-x-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              placeholder ||
              `Describe what you want to buy (e.g. "Espresso machine with fast heatup and durable brass boiler" or "shoes")...`
            }
            className="flex-1 max-h-36 bg-transparent text-slate-100 placeholder-slate-500 text-xs md:text-sm px-2 py-1.5 focus:outline-none resize-none leading-relaxed"
          />

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all ${
              text.trim() && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian-950 shadow-glow-cyan/20 cursor-pointer scale-100'
                : 'bg-obsidian-800 text-slate-500 cursor-not-allowed scale-95 opacity-50'
            }`}
            title="Send query to agent"
          >
            {isLoading ? (
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
