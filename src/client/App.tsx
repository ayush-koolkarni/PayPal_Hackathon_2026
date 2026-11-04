import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext.js';
import { LocationProvider } from './context/LocationContext.js';
import { useChat } from './hooks/useChat.js';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { ChatContainer } from './components/ChatContainer.js';
import { ChatInput } from './components/ChatInput.js';
import { SettingsModal } from './components/SettingsModal.js';
import { RegionSelectorModal } from './components/RegionSelectorModal.js';
import { ProductComparisonDrawer } from './components/ProductComparisonDrawer.js';
import { AlertCircle, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
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
  } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian-950 text-slate-100 font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Global Error Banner (e.g., API Key missing) */}
        {error && (
          <div className="px-4 py-2.5 bg-rose-950/80 border-b border-rose-500/40 text-xs text-rose-200 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Chat Messages Stream */}
        <ChatContainer
          messages={messages}
          streamingProgress={streamingProgress}
          isLoading={isLoading}
          comparedProducts={comparedProducts}
          onToggleCompare={toggleProductComparison}
          onSendMessage={sendMessage}
        />

        {/* Floating Chat Input */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />

        {/* Side-by-Side Product Comparison Matrix Drawer */}
        <ProductComparisonDrawer
          products={comparedProducts}
          isOpen={isComparisonDrawerOpen}
          onOpen={() => setIsComparisonDrawerOpen(true)}
          onClose={() => setIsComparisonDrawerOpen(false)}
          onRemove={removeComparedProduct}
          onClear={clearComparison}
        />

        {/* Modals */}
        <SettingsModal />
        <RegionSelectorModal />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <LocationProvider>
        <MainApp />
      </LocationProvider>
    </SettingsProvider>
  );
};

export default App;
