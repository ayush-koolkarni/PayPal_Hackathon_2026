import React from 'react';
import { ShieldCheck, AlertTriangle, Wrench, Clock, Award } from 'lucide-react';
import type { LifespanAssessment } from '../types/index.js';

interface LifespanMeterProps {
  assessment: LifespanAssessment;
}

export const LifespanMeter: React.FC<LifespanMeterProps> = ({ assessment }) => {
  const score = Math.min(10, Math.max(0, assessment.durabilityScore || 8));
  const percentage = (score / 10) * 100;

  // Color mapping based on score
  let scoreColorClass = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  let barGradient = 'from-emerald-500 to-cyan-400';
  if (score < 6.5) {
    scoreColorClass = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    barGradient = 'from-amber-500 to-orange-400';
  } else if (score < 8.0) {
    scoreColorClass = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
    barGradient = 'from-cyan-500 to-blue-400';
  }

  return (
    <div className="p-3.5 rounded-xl bg-obsidian-900/80 border border-white/5 space-y-3">
      {/* Top Banner: Score & Estimated Years */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-obsidian-850 border border-white/10 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Estimated Lifespan
            </span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {assessment.estimatedLifespanYears || '4–6 Years'}
            </span>
          </div>
        </div>

        {/* Durability Badge */}
        <div className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${scoreColorClass}`}>
          <Award className="w-3.5 h-3.5" />
          <div className="text-right">
            <span className="text-[10px] block font-mono leading-none">Durability Score</span>
            <span className="text-xs font-extrabold font-mono leading-tight">
              {score.toFixed(1)} / 10
            </span>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-obsidian-950 rounded-full h-1.5 overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Build Quality Highlights */}
      {assessment.buildQuality && (
        <div className="flex items-start space-x-2 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-200">Build Materials: </span>
            {assessment.buildQuality}
          </p>
        </div>
      )}

      {/* Failure Points */}
      {assessment.failurePoints && assessment.failurePoints.length > 0 && (
        <div className="p-2.5 rounded-lg bg-obsidian-950/70 border border-amber-500/20 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-300/90 font-medium mb-1">
            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Known Wear-and-Tear Points (Over Time):
            </span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
            {assessment.failurePoints.map((point, idx) => (
              <li key={idx} className="leading-snug">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Repairability & Warranty Notes */}
      {(assessment.repairabilityNotes || assessment.warrantyInfo) && (
        <div className="flex items-start space-x-2 text-[11px] text-slate-400 pt-1 border-t border-white/5">
          <Wrench className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5 leading-snug">
            {assessment.repairabilityNotes && (
              <p>
                <span className="text-slate-300 font-medium">Repairability: </span>
                {assessment.repairabilityNotes}
              </p>
            )}
            {assessment.warrantyInfo && (
              <p>
                <span className="text-slate-300 font-medium">Local Warranty: </span>
                {assessment.warrantyInfo}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
