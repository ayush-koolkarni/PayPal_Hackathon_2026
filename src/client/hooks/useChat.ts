import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatSession, ChatMessage, Product, StreamingProgress, UserLocation } from '../types/index.js';
import { useSettings } from '../context/SettingsContext.js';
import { useLocation } from '../context/LocationContext.js';

export function useChat() {
  const { settings, setIsSettingsOpen } = useSettings();
  const { currentLocation } = useLocation();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState<StreamingProgress | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Sessions on initial mount
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !currentSessionId) {
          // Select the most recent session
          selectSession(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  }, [currentSessionId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Select and load a session's messages
  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setError(null);
    setStreamingProgress(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch session messages:', err);
    }
  };

  // Create a brand new session
  const createNewSession = () => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setCurrentSessionId(newId);
    setMessages([]);
    setError(null);
    setStreamingProgress(null);
  };

  // Rename a session
  const renameSession = async (sessionId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
        );
      }
    } catch (err) {
      console.error('Failed to rename session:', err);
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          if (remaining.length > 0) {
            selectSession(remaining[0].id);
          } else {
            createNewSession();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // Send a message and stream response
  const sendMessage = async (text: string) => {
    if (!text || text.trim() === '' || isLoading) return;

    setError(null);
    setIsLoading(true);
    setStreamingProgress({
      step: 'ANALYZING',
      message: `Analyzing request for ${currentLocation.countryName} (${currentLocation.currencyCode})...`,
    });

    const activeSessionId = currentSessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    if (!currentSessionId) {
      setCurrentSessionId(activeSessionId);
    }

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sessionId: activeSessionId,
      role: 'user',
      content: text.trim(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (settings.geminiApiKey) {
        headers['x-gemini-api-key'] = settings.geminiApiKey;
      }
      if (settings.geminiModel) {
        headers['x-gemini-model'] = settings.geminiModel;
      }
      if (settings.serpApiKey) {
        headers['x-serpapi-key'] = settings.serpApiKey;
      }
      if (settings.tavilyApiKey) {
        headers['x-tavily-key'] = settings.tavilyApiKey;
      }
      if (settings.firecrawlApiKey) {
        headers['x-firecrawl-key'] = settings.firecrawlApiKey;
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: text.trim(),
          userLocation: currentLocation,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const trimmed = event.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);

            if (data.type === 'session_created') {
              setSessions((prev) => {
                if (prev.some((s) => s.id === data.session.id)) return prev;
                return [data.session, ...prev];
              });
            } else if (data.type === 'progress') {
              setStreamingProgress({
                step: data.step,
                message: data.message,
                detail: data.detail,
              });
            } else if (data.type === 'complete') {
              setMessages((prev) => {
                // Replace or append
                const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
                return [
                  ...filtered,
                  tempUserMsg,
                  data.message,
                ];
              });
              setStreamingProgress(null);
              // Refresh sessions list in background to update title
              fetchSessions();
            } else if (data.type === 'error') {
              setError(data.error);
              if (data.error && data.error.includes('GEMINI_API_KEY_REQUIRED')) {
                setIsSettingsOpen(true);
              }
            }
          } catch (jsonErr) {
            console.error('Error parsing SSE event:', jsonErr, dataStr);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Stream failure:', err);
        setError(err.message || 'Connection lost to agent server.');
      }
    } finally {
      setIsLoading(false);
      setStreamingProgress(null);
      abortControllerRef.current = null;
    }
  };

  // Compare products toggle
  const toggleProductComparison = (product: Product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 products simultaneously.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeComparedProduct = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setComparedProducts([]);
    setIsComparisonDrawerOpen(false);
  };

  return {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    streamingProgress,
    comparedProducts,
    isComparisonDrawerOpen,
    error,
    selectSession,
    createNewSession,
    renameSession,
    deleteSession,
    sendMessage,
    toggleProductComparison,
    removeComparedProduct,
    clearComparison,
    setIsComparisonDrawerOpen,
  };
}
