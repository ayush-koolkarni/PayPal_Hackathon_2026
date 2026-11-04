import React from 'react';
import { Loader2, Search, Sparkles, Layers, Cpu } from 'lucide-react';
import type { StreamingProgress } from '../types/index.js';

interface StreamingStatusProps {
  progress: StreamingProgress;
}

export const StreamingStatus: React.FC<StreamingStatusProps> = ({ progress }) => {
  let StepIcon = Loader2;
  let accentColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';

  if (progress.step === 'ANALYZING') {
    StepIcon = Cpu;
    accentColor = 'text-blue-400 border-blue-500/40 bg-blue-950/40';
  } else if (progress.step === 'SEARCHING') {
    StepIcon = Search;
    accentColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
  } else if (progress.step === 'SCRAPING') {
    StepIcon = Layers;
    accentColor = 'text-violet-400 border-violet-500/40 bg-violet-950/40';
  } else if (progress.step === 'SYNTHESIZING') {
    StepIcon = Sparkles;
    accentColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  }

  return (
    <div className="flex items-start space-x-3 p-4 rounded-2xl bg-obsidian-900/90 border border-white/10 glass-panel shadow-subtle animate-in fade-in duration-300">
      <div className={`p-2 rounded-xl border flex-shrink-0 animate-pulse ${accentColor}`}>
        <StepIcon className="w-4 h-4 animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-cyan-400">
            {progress.step}
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <p className="text-xs font-medium text-slate-100 mt-0.5 leading-snug">
          {progress.message}
        </p>
        {progress.detail && (
          <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
            {progress.detail}
          </p>
        )}
      </div>
    </div>
  );
};
