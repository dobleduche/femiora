
import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from './UserContext';
import type { Tier } from '../services/api';

// This is the shape of the entitlements object
interface Entitlements {
  tier: Tier;
  isFree: boolean;
  isCore: boolean;
  isPremium: boolean;
  canAccessFullHistory: boolean;
  canAccessWeeklySummary: boolean;
  canAccessChat: boolean;
  canTrackCycles: boolean;
  canUseLiveCoach: boolean;
  canUseClinicianSummary: boolean;
  canUsePartnerAccess: boolean;
  canUseAdvancedTrends: boolean;
  canCustomizePrompts: boolean;
}

// The context value will just be the entitlements object
const EntitlementContext = createContext<Entitlements | undefined>(undefined);

export const EntitlementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const tier = user?.tier || 'free';

  const isCore = tier === 'core' || tier === 'premium';
  const isPremium = tier === 'premium';

  const value: Entitlements = {
    tier,
    isFree: tier === 'free',
    isCore,
    isPremium,
    canAccessFullHistory: isCore,
    canAccessWeeklySummary: isCore,
    canAccessChat: isCore,
    canTrackCycles: isCore,
    canUseLiveCoach: isPremium,
    canUseClinicianSummary: isPremium,
    canUsePartnerAccess: isPremium,
    canUseAdvancedTrends: isPremium,
    canCustomizePrompts: isPremium,
  };

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
};

export const useEntitlements = (): Entitlements => {
  const context = useContext(EntitlementContext);
  if (context === undefined) {
    throw new Error('useEntitlements must be used within an EntitlementProvider');
  }
  return context;
};

// Guard component to handle conditional rendering based on entitlements
interface EntitlementGuardProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  feature: keyof Entitlements;
}

export const EntitlementGuard: React.FC<EntitlementGuardProps> = ({ children, fallback, feature }) => {
  const entitlements = useEntitlements();
  const isEntitled = entitlements[feature];

  if (typeof isEntitled !== 'boolean') {
    // This is a safeguard in case a non-boolean feature key is passed.
    console.warn(`EntitlementGuard received a non-boolean feature: ${feature}`);
    return <>{fallback}</>;
  }

  return isEntitled ? <>{children}</> : <>{fallback}</>;
};
