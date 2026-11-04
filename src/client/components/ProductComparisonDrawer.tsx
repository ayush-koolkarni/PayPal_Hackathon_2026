import React from 'react';
import { X, Scale, ExternalLink, Star, Trash2 } from 'lucide-react';
import type { Product } from '../types/index.js';
import { formatCurrencyAmount } from '../utils/geo.js';

interface ProductComparisonDrawerProps {
  products: Product[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export const ProductComparisonDrawer: React.FC<ProductComparisonDrawerProps> = ({
  products,
  isOpen,
  onOpen,
  onClose,
  onRemove,
  onClear,
}) => {
  if (products.length === 0) return null;

  // Render Persistent Floating Bar when Drawer is closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3 px-4 py-2.5 rounded-full bg-obsidian-900/95 border border-cyan-500/50 shadow-glow-cyan/20 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-white">
            {products.length} {products.length === 1 ? 'Product' : 'Products'} in Comparison
          </span>
        </div>

        {/* Thumbnail Avatars */}
        <div className="flex -space-x-2 overflow-hidden items-center">
          {products.map((p) => (
            <div
              key={p.id}
              className="w-7 h-7 rounded-full bg-obsidian-800 border-2 border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
              title={p.title}
            >
              {p.brand.slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>

        <button
          onClick={onOpen}
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian-950 font-bold text-xs shadow-sm transition-all"
        >
          Compare Side-by-Side
        </button>

        <button
          onClick={onClear}
          className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-obsidian-800 transition-colors"
          title="Clear Comparison"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Gather unique spec keys across all compared products
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.keySpecs || {})))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[90vh] bg-obsidian-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden glass-panel-elevated">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-obsidian-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Side-by-Side Product Intelligence Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Comparing {products.length} products on street price, lifespan, durability scores, and specs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClear}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 text-xs text-slate-300 hover:text-rose-300 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-flow-col auto-cols-fr gap-4 min-w-[700px]">
            {products.map((product) => {
              const formattedPrice = formatCurrencyAmount(
                product.lowestPrice,
                product.currency,
                product.currencySymbol
              );
              const bestStore = product.stores[0];

              return (
                <div
                  key={product.id}
                  className="rounded-xl bg-obsidian-950/70 border border-white/10 p-4 space-y-4 flex flex-col justify-between"
                >
                  {/* Top: Title & Remove */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {product.brand}
                      </span>
                      <button
                        onClick={() => onRemove(product.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Remove Column"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2">
                      {product.title}
                    </h4>

                    {/* Price & Score */}
                    <div className="mt-3 p-3 rounded-lg bg-obsidian-900 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Lowest Street Price
                      </span>
                      <span className="text-lg font-extrabold text-cyan-300 font-mono">
                        {formattedPrice}
                      </span>
                      <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono mt-1">
                        <span>{product.matchScore}% Match Score</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline mr-0.5" />
                          <span>{product.reviewSynthesis.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lifespan & Durability */}
                    <div className="mt-3 p-3 rounded-lg bg-obsidian-900 border border-white/5 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Durability & Lifespan
                      </span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Expected Lifespan:</span>
                        <span className="font-bold text-white font-mono">
                          {product.lifespanAssessment.estimatedLifespanYears}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Durability Score:</span>
                        <span className="font-bold text-cyan-400 font-mono">
                          {product.lifespanAssessment.durabilityScore.toFixed(1)} / 10
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5 leading-snug">
                        {product.lifespanAssessment.buildQuality}
                      </p>
                    </div>

                    {/* Pros Highlights */}
                    <div className="mt-3 p-3 rounded-lg bg-obsidian-900 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                        Top Pros
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-1">
                        {product.reviewSynthesis.pros.slice(0, 3).map((pro, idx) => (
                          <li key={idx} className="leading-snug">
                            • {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons Highlights */}
                    <div className="mt-3 p-3 rounded-lg bg-obsidian-900 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-rose-400 block font-bold">
                        Limitations
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-1">
                        {product.reviewSynthesis.cons.slice(0, 2).map((con, idx) => (
                          <li key={idx} className="leading-snug">
                            • {con}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Specs Breakdown */}
                    {allSpecKeys.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-obsidian-900 border border-white/5 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                          Technical Specs
                        </span>
                        <div className="space-y-1">
                          {allSpecKeys.slice(0, 5).map((key) => (
                            <div key={key} className="flex justify-between text-[11px] border-b border-white/5 pb-0.5">
                              <span className="text-slate-400">{key}:</span>
                              <span className="text-slate-200 font-mono font-medium">
                                {product.keySpecs[key] || '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct Buy CTA */}
                  {bestStore && (
                    <a
                      href={bestStore.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian-950 font-bold text-xs shadow-glow-cyan/20 transition-all"
                    >
                      <span>Buy on {bestStore.name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
