import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, ChevronLeft, ChevronRight, ShoppingBag, ShieldCheck, Cpu } from 'lucide-react';
import type { ChatSession } from '../types/index.js';
import { useSettings } from '../context/SettingsContext.js';
import { useLocation } from '../context/LocationContext.js';
import { SUPPORTED_COUNTRIES } from '../utils/geo.js';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  isOpen,
  onToggle,
}) => {
  const { settings, setIsSettingsOpen } = useSettings();
  const { currentLocation } = useLocation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r border-white/10 glass-panel bg-obsidian-950 ${
          isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat Button */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          {isOpen ? (
            <button
              onClick={onNewSession}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide shadow-glow-cyan/10 transition-all group"
            >
              <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform" />
              <span>New Shopping Session</span>
            </button>
          ) : (
            <button
              onClick={onNewSession}
              className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 flex items-center justify-center hover:bg-cyan-900/50 transition-all mx-auto"
              title="New Shopping Session"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onToggle}
            className="hidden md:flex p-1.5 ml-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isOpen && (
            <div className="px-2 py-1 text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Shopping Threads</span>
              <span className="text-slate-600">({sessions.length})</span>
            </div>
          )}

          {sessions.length === 0 ? (
            isOpen ? (
              <div className="text-center py-10 px-4 text-slate-500 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p>No previous shopping sessions.</p>
                <p className="text-[11px] text-slate-600 mt-1">Start by asking for any product.</p>
              </div>
            ) : null
          ) : (
            sessions.map((session) => {
              const isSelected = currentSessionId === session.id;
              const countryFlag = SUPPORTED_COUNTRIES[session.countryCode]?.flag || '🌐';

              if (!isOpen) {
                return (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 shadow-glow-cyan/20'
                        : 'text-slate-400 hover:text-white hover:bg-obsidian-850'
                    }`}
                    title={session.title}
                  >
                    <span className="text-sm">{countryFlag}</span>
                  </button>
                );
              }

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/50 to-obsidian-850 border border-cyan-500/40 text-cyan-200 shadow-sm'
                      : 'text-slate-300 hover:bg-obsidian-850 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0 pr-2">
                    <span className="text-sm flex-shrink-0">{countryFlag}</span>
                    {editingId === session.id ? (
                      <form
                        onSubmit={(e) => saveRename(session.id, e)}
                        className="flex items-center space-x-1 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-obsidian-900 border border-cyan-500/60 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button type="submit" className="text-cyan-400 hover:text-cyan-300 p-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-slate-400 hover:text-slate-300 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate font-medium">{session.title}</span>
                    )}
                  </div>

                  {/* Actions on Hover */}
                  {editingId !== session.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startRename(session, e)}
                        className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Rename Thread"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Thread"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Sidebar Status */}
        <div className="p-3 border-t border-white/10 bg-obsidian-900/60">
          {isOpen ? (
            <div className="space-y-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-white/5 hover:border-cyan-500/30 text-xs text-slate-300 transition-all"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate font-mono text-[11px]">
                    {settings.geminiModel || 'gemini-3.8-flash'}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Config
                </span>
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                <span>Region Active</span>
                <span className="text-slate-300">
                  {currentLocation.countryCode} ({currentLocation.currencyCode})
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-xl bg-obsidian-850 flex items-center justify-center text-slate-400 hover:text-cyan-300 mx-auto"
              title="Settings & Model Config"
            >
              <Cpu className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
