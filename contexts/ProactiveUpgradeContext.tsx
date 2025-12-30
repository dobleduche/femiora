
import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { useUser } from './UserContext';
import { checkForUpgradeOpportunities, UpgradeTrigger } from '../services/proactive-upgrade';
import { useEntitlements } from './EntitlementContext';

interface ProactiveUpgradeContextType {
  trigger: UpgradeTrigger | null;
  dismissTrigger: (triggerId: string) => void;
}

const ProactiveUpgradeContext = createContext<ProactiveUpgradeContextType | undefined>(undefined);

const DISMISSED_TRIGGERS_KEY = 'femiora-dismissed-triggers';

export const ProactiveUpgradeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { logs, cycles } = useUser();
  const { isFree } = useEntitlements();
  const [trigger, setTrigger] = useState<UpgradeTrigger | null>(null);
  const [dismissedTriggers, setDismissedTriggers] = useState<string[]>([]);

  // Load dismissed triggers from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DISMISSED_TRIGGERS_KEY);
      if (stored) {
        setDismissedTriggers(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse dismissed triggers from localStorage", error);
    }
  }, []);

  // Analyze data for upgrade opportunities when data changes
  useEffect(() => {
    // Only run this for free users and if there's enough data
    if (isFree && (logs.length > 5 || cycles.length > 1)) {
      const opportunity = checkForUpgradeOpportunities(logs, cycles);
      
      if (opportunity && !dismissedTriggers.includes(opportunity.id)) {
        setTrigger(opportunity);
      } else {
        setTrigger(null); // Clear trigger if it's already dismissed or no opportunity found
      }
    } else {
      setTrigger(null); // Not a free user, no trigger
    }
  }, [logs, cycles, isFree, dismissedTriggers]);

  const dismissTrigger = (triggerId: string) => {
    const newDismissed = [...dismissedTriggers, triggerId];
    setDismissedTriggers(newDismissed);
    try {
      window.localStorage.setItem(DISMISSED_TRIGGERS_KEY, JSON.stringify(newDismissed));
    } catch (error) {
       console.error("Failed to save dismissed triggers to localStorage", error);
    }
    setTrigger(null); // Hide the prompt immediately
  };
  
  const value = useMemo(() => ({
    trigger,
    dismissTrigger,
  }), [trigger]);
  
  return (
    <ProactiveUpgradeContext.Provider value={value}>
      {children}
    </ProactiveUpgradeContext.Provider>
  );
};

export const useProactiveUpgrade = (): ProactiveUpgradeContextType => {
  const context = useContext(ProactiveUpgradeContext);
  if (context === undefined) {
    throw new Error('useProactiveUpgrade must be used within a ProactiveUpgradeProvider');
  }
  return context;
};
