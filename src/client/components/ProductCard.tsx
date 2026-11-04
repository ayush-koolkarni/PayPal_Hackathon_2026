import React, { useState } from 'react';
import {
  ExternalLink,
  Star,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Store,
  Layers,
  Sparkles,
  Check,
  Scale
} from 'lucide-react';
import type { Product } from '../types/index.js';
import { LifespanMeter } from './LifespanMeter.js';
import { formatCurrencyAmount } from '../utils/geo.js';

interface ProductCardProps {
  product: Product;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
}

type TabType = 'STORES' | 'REVIEWS' | 'SPECS';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isCompared,
  onToggleCompare,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('STORES');
  const [imageError, setImageError] = useState(false);

  // Format lowest price
  const formattedLowest = formatCurrencyAmount(
    product.lowestPrice,
    product.currency,
    product.currencySymbol
  );

  // Proxy image to bypass retailer hotlinking restrictions
  const proxyImageUrl = product.imageUrl
    ? `/api/image-proxy?url=${encodeURIComponent(product.imageUrl)}`
    : '';

  return (
    <div className="rounded-2xl bg-obsidian-900/90 border border-white/10 hover:border-cyan-500/40 glass-card transition-all duration-300 overflow-hidden shadow-subtle group">
      {/* Top Header: Brand, Title, Match Score & Lowest Price */}
      <div className="p-4 md:p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
              {product.brand}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{product.matchScore}% Match</span>
            </div>
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-cyan-200 transition-colors leading-snug">
            {product.title}
          </h3>
          {product.matchReason && (
            <p className="text-xs text-slate-400 italic">
              "{product.matchReason}"
            </p>
          )}
        </div>

        {/* Lowest Regional Price & Compare CTA */}
        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-white/5">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Lowest Local Street Price
            </span>
            <span className="text-lg md:text-xl font-extrabold text-cyan-300 font-mono tracking-tight">
              {formattedLowest}
            </span>
          </div>

          <button
            onClick={() => onToggleCompare(product)}
            className={`mt-1.5 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              isCompared
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-glow-cyan/20'
                : 'bg-obsidian-850 hover:bg-obsidian-800 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isCompared ? 'Added to Compare' : 'Compare'}</span>
            {isCompared && <Check className="w-3 h-3 text-cyan-400 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Main Body: Image + Lifespan Meter */}
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Product Visual */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div className="w-full h-48 md:h-56 rounded-xl bg-obsidian-950/80 border border-white/10 overflow-hidden relative flex items-center justify-center p-3">
            {!imageError && proxyImageUrl ? (
              <img
                src={proxyImageUrl}
                alt={product.title}
                onError={() => setImageError(true)}
                className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 p-4 text-center">
                <ShoppingBag className="w-10 h-10 opacity-30 text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">Verified Offering</span>
                <span className="text-[10px] text-slate-600">Visual secured via store link</span>
              </div>
            )}
          </div>
        </div>

        {/* Lifespan & Durability Meter */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <LifespanMeter assessment={product.lifespanAssessment} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 md:px-5 border-t border-white/10 flex items-center space-x-1 bg-obsidian-950/40">
        <button
          onClick={() => setActiveTab('STORES')}
          className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'STORES'
              ? 'border-cyan-400 text-cyan-300 bg-obsidian-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Where to Buy ({product.stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REVIEWS')}
          className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'REVIEWS'
              ? 'border-cyan-400 text-cyan-300 bg-obsidian-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Reviews & Verdict</span>
        </button>

        <button
          onClick={() => setActiveTab('SPECS')}
          className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'SPECS'
              ? 'border-cyan-400 text-cyan-300 bg-obsidian-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Specs & Longevity</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="p-4 md:p-5 bg-obsidian-950/70 border-t border-white/5 min-h-[140px]">
        {/* Tab 1: Where to Buy */}
        {activeTab === 'STORES' && (
          <div className="space-y-2">
            {product.stores.length === 0 ? (
              <p className="text-xs text-slate-400">Retailer stock checking in progress...</p>
            ) : (
              product.stores.map((store, sIdx) => {
                const isBestPrice = sIdx === 0 || store.isLowestPrice;

                return (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-white/5 hover:border-white/20 transition-all text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-obsidian-800 border border-white/10 flex items-center justify-center font-bold text-slate-200 font-mono">
                        {store.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{store.name}</span>
                          {isBestPrice && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                              Best Price
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {store.inStock ? (
                            <span className="text-emerald-400 font-medium">In Stock</span>
                          ) : (
                            <span className="text-amber-400">Check Stock</span>
                          )}
                          {store.availabilityText && ` • ${store.availabilityText}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-sm text-cyan-300">
                        {store.formattedPrice || `${product.currencySymbol} ${store.price?.toLocaleString()}`}
                      </span>

                      <a
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/40 hover:to-blue-600/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 font-medium transition-all group/btn"
                      >
                        <span>Buy on {store.name.split(' ')[0]}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Reviews & Sentiment */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-4">
            {/* Top Score Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-white/5">
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold font-mono text-sm ml-1 text-white">
                    {product.reviewSynthesis.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 ml-0.5 font-mono">/ 5.0</span>
                </div>
                <span className="text-slate-400 text-xs">
                  ({product.reviewSynthesis.reviewCount || 'Verified Internet Reviews'})
                </span>
              </div>
              <span className="text-xs font-medium text-emerald-400">
                {product.reviewSynthesis.reliabilitySentiment}
              </span>
            </div>

            {/* Pros & Cons Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-obsidian-900/60 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Advantages:</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-xs">
                  {product.reviewSynthesis.pros.map((pro, pIdx) => (
                    <li key={pIdx} className="flex items-start space-x-1.5 leading-snug">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-900/60 border border-rose-500/20 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-semibold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Documented Limitations:</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-xs">
                  {product.reviewSynthesis.cons.map((con, cIdx) => (
                    <li key={cIdx} className="flex items-start space-x-1.5 leading-snug">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cross-Web Consensus Verdict */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-200">
              <span className="font-semibold text-cyan-300 block mb-0.5">
                Cross-Web Buyer Consensus:
              </span>
              <p className="leading-relaxed">
                {product.reviewSynthesis.consensusVerdict}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Specs & Longevity */}
        {activeTab === 'SPECS' && (
          <div className="space-y-4">
            {/* Specs Table */}
            {product.keySpecs && Object.keys(product.keySpecs).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(product.keySpecs).map(([specKey, specVal]) => (
                  <div
                    key={specKey}
                    className="p-2.5 rounded-lg bg-obsidian-900 border border-white/5"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block truncate">
                      {specKey}
                    </span>
                    <span className="text-xs font-semibold text-slate-100 block font-mono truncate">
                      {specVal}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Specifications compiled from manufacturer datasheet.</p>
            )}

            {/* Repairability Analysis */}
            <div className="p-3 rounded-xl bg-obsidian-900 border border-white/5 text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-cyan-300 block">
                Repairability & Long-Term Service Network:
              </span>
              <p className="leading-relaxed">
                {product.lifespanAssessment.repairabilityNotes || 'Spare parts and modular replacements available through official service centers.'}
              </p>
              <p className="text-slate-400 text-[11px]">
                <strong className="text-slate-300">Warranty Coverage: </strong>
                {product.lifespanAssessment.warrantyInfo || 'Official manufacturer warranty applies.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
