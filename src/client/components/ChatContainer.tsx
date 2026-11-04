import React, { useEffect, useRef } from 'react';
import { Sparkles, Shield, Compass, ArrowRight, ShoppingCart, User, Bot, Clock } from 'lucide-react';
import type { ChatMessage, Product, StreamingProgress } from '../types/index.js';
import { ProductCard } from './ProductCard.js';
import { ClarificationPills } from './ClarificationPills.js';
import { StreamingStatus } from './StreamingStatus.js';
import { useLocation } from '../context/LocationContext.js';

interface ChatContainerProps {
  messages: ChatMessage[];
  streamingProgress: StreamingProgress | null;
  isLoading: boolean;
  comparedProducts: Product[];
  onToggleCompare: (product: Product) => void;
  onSendMessage: (text: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  streamingProgress,
  isLoading,
  comparedProducts,
  onToggleCompare,
  onSendMessage,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const { currentLocation } = useLocation();

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingProgress]);

  const samplePrompts = [
    {
      title: 'Espresso Machine with Durability',
      prompt: `Espresso machine with fast heatup and durable commercial brass boiler under ${currentLocation.currencySymbol} 45,000`,
      tag: 'Longevity Focus',
    },
    {
      title: 'Hot-Swap Mechanical Keyboard',
      prompt: `Mechanical keyboard under ${currentLocation.currencySymbol} 8,000 with hot-swappable tactile switches and PBT keycaps`,
      tag: 'Value & Build',
    },
    {
      title: 'Travel Noise-Cancelling Headphones',
      prompt: 'Wireless noise-cancelling over-ear headphones with 30+ hour battery and replaceable earpads',
      tag: 'Comfort & Battery',
    },
    {
      title: 'Test Dynamic LLM Clarification',
      prompt: 'shoes',
      tag: 'Dynamic Clarify Test',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-5xl mx-auto w-full">
      {messages.length === 0 ? (
        // Hero Landing Screen
        <div className="py-8 md:py-16 text-center space-y-8 animate-in fade-in duration-500">
          {/* Logo & Headline */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium shadow-glow-cyan/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Google Search + Live Retailer Scraping</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Where Shopping Meets{' '}
              <span className="gradient-text-cyan">Durability Intelligence.</span>
            </h1>

            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
              Search real-time stores in <strong className="text-slate-200">{currentLocation.countryName}</strong>, compare local street prices in <strong className="text-cyan-300">{currentLocation.currencyCode} ({currentLocation.currencySymbol})</strong>, and uncover how long products actually last before you buy.
            </p>
          </div>

          {/* Quick Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-obsidian-900/80 border border-white/5 glass-panel">
              <Compass className="w-5 h-5 text-cyan-400 mb-2" />
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                Region-Locked Search
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Zero US-only bias. Scrapes regional stores that deliver directly to your doorstep.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-900/80 border border-white/5 glass-panel">
              <Clock className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                Lifespan & Durability
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Evaluates expected lifespan, failure points over 3–7 years, and local warranty networks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-900/80 border border-white/5 glass-panel">
              <Shield className="w-5 h-5 text-violet-400 mb-2" />
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                Dynamic Clarification
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                AI dynamically diagnoses ambiguous requests and returns 1-click refinement pills.
              </p>
            </div>
          </div>

          {/* Sample Starter Queries */}
          <div className="space-y-3 max-w-3xl mx-auto text-left pt-4">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or click a starter query:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="group flex flex-col p-3 rounded-xl bg-obsidian-900 hover:bg-obsidian-850 border border-white/10 hover:border-cyan-500/50 text-left transition-all shadow-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                      {item.tag}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    "{item.prompt}"
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Message Stream
        messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                isUser ? 'justify-end' : 'justify-start'
              } animate-in fade-in duration-300`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1 shadow-glow-cyan/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl space-y-3 ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 rounded-2xl rounded-tr-sm px-4 py-3 text-slate-100 text-xs md:text-sm shadow-sm'
                    : 'w-full'
                }`}
              >
                {/* User Message Content */}
                {isUser && (
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}

                {/* Assistant Message Content */}
                {!isUser && (
                  <div className="space-y-4">
                    {/* Conversational Text / Verdict */}
                    {message.content && (
                      <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/10 text-xs md:text-sm text-slate-200 leading-relaxed glass-panel">
                        {message.content}
                      </div>
                    )}

                    {/* Clarification Request & Pills */}
                    {message.clarification && (
                      <ClarificationPills
                        clarification={message.clarification}
                        onSelectPill={(pill) => onSendMessage(pill)}
                        disabled={isLoading}
                      />
                    )}

                    {/* Product Cards Grid */}
                    {message.products && message.products.length > 0 && (
                      <div className="space-y-4 pt-2">
                        {message.products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isCompared={comparedProducts.some((p) => p.id === product.id)}
                            onToggleCompare={onToggleCompare}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-obsidian-850 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Live Streaming Step Indicator */}
      {streamingProgress && <StreamingStatus progress={streamingProgress} />}

      <div ref={scrollEndRef} className="h-4" />
    </div>
  );
};
