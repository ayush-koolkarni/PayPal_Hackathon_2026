import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ApiSettings } from '../types/index.js';

interface SettingsContextType {
  settings: ApiSettings;
  updateSettings: (newSettings: Partial<ApiSettings>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  hasGeminiKey: boolean;
}

const DEFAULT_SETTINGS: ApiSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-3.8-flash',
  serpApiKey: '',
  tavilyApiKey: '',
  firecrawlApiKey: '',
  overrideRegion: null,
  autoDetectLocation: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ApiSettings>(() => {
    try {
      const saved = localStorage.getItem('nexus_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ApiSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Check if either localStorage key exists OR backend env has it
  const hasGeminiKey = Boolean(settings.geminiApiKey && settings.geminiApiKey.trim().length > 0);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isSettingsOpen,
        setIsSettingsOpen,
        hasGeminiKey,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
