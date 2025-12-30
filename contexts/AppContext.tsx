
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { View } from '../services/api';

interface AppContextType {
  currentView: View;
  isUpgradeModalOpen: boolean;
  isLogModalOpen: boolean;
  isPartnerModalOpen: boolean;
  welcomeBackMessage: string | null;
  
  navigate: (view: View) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  openLogModal: () => void;
  closeLogModal: () => void;
  openPartnerModal: () => void;
  closePartnerModal: () => void;
  setWelcomeBackMessage: (message: string) => void;
  clearWelcomeBackMessage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [isPartnerModalOpen, setPartnerModalOpen] = useState(false);
  const [welcomeBackMessage, setWelcomeBackMessage] = useState<string | null>(null);

  const clearWelcomeBackMessage = useCallback(() => {
    setWelcomeBackMessage(null);
  }, []);

  const value = {
    currentView,
    isUpgradeModalOpen,
    isLogModalOpen,
    isPartnerModalOpen,
    welcomeBackMessage,
    
    navigate: setCurrentView,
    openUpgradeModal: () => setUpgradeModalOpen(true),
    closeUpgradeModal: () => setUpgradeModalOpen(false),
    openLogModal: () => setLogModalOpen(true),
    closeLogModal: () => setLogModalOpen(false),
    openPartnerModal: () => setPartnerModalOpen(true),
    closePartnerModal: () => setPartnerModalOpen(false),
    setWelcomeBackMessage,
    clearWelcomeBackMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
