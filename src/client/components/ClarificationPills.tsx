import React from 'react';
import { HelpCircle, Sparkles, CornerDownLeft } from 'lucide-react';
import type { ClarificationData } from '../types/index.js';

interface ClarificationPillsProps {
  clarification: ClarificationData;
  onSelectPill: (pillText: string) => void;
  disabled?: boolean;
}

export const ClarificationPills: React.FC<ClarificationPillsProps> = ({
  clarification,
  onSelectPill,
  disabled = false,
}) => {
  return (
    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-obsidian-900/90 via-obsidian-850 to-cyan-950/20 border border-cyan-500/30 shadow-subtle">
      {/* Question Header */}
      <div className="flex items-start space-x-2.5 mb-3">
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mt-0.5">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
            Agent Clarification Request
          </span>
          <p className="text-sm font-medium text-slate-100 mt-0.5">
            {clarification.question}
          </p>
        </div>
      </div>

      {/* Suggestion Pills */}
      <div className="pt-2 border-t border-white/5">
        <span className="text-[11px] text-slate-400 mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Refinement Options (Click to select):</span>
        </span>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {clarification.suggestionPills.map((pill, idx) => (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelectPill(pill)}
              className="group flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-obsidian-800/90 hover:bg-cyan-950/70 border border-white/10 hover:border-cyan-500/50 text-xs text-slate-200 hover:text-cyan-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{pill}</span>
              <CornerDownLeft className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
