
import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import type { UserProfile, UserLog, Tier, DailyLog, UserSettings, PartnerAccess, Reflection, Milestone, Cycle } from '../services/api';
import LoadingScreen from '../components/ui/LoadingScreen';
import usePersistentState from '../hooks/usePersistentState';

interface UserContextType {
  user: UserProfile;
  logs: UserLog[];
  reflections: Reflection[];
  milestones: Milestone[];
  cycles: Cycle[];
  isLoading: boolean;
  
  // Data mutation functions
  saveLog: (entry: DailyLog) => Promise<void>;
  updateUser: (updates: Partial<Omit<UserProfile, 'settings' | 'partnerAccess' | 'id' | 'createdAt'>> & { settings?: Partial<UserSettings>, partnerAccess?: Partial<PartnerAccess> }) => Promise<void>;
  completeOnboarding: () => void;
  upgrade: (tier: Tier) => Promise<void>;
  saveReflections: (reflections: Omit<Reflection, 'id' | 'userId' | 'createdAt'|'feedback'>[]) => Promise<void>;
  saveReflectionFeedback: (reflectionId: string, feedback: 'helpful' | 'not_helpful') => Promise<void>;
  markMilestoneAsCelebrated: (milestoneId: string) => Promise<void>;
  logPeriodDay: (date: string) => Promise<void>;
  removePeriodDay: (date: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const MILESTONE_DAYS = [30, 90, 180, 365];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = usePersistentState<UserProfile | null>('femiora-userProfile', null);
  const [userLogs, setUserLogs] = usePersistentState<UserLog[]>('femiora-userLogs', []);
  const [reflections, setReflections] = usePersistentState<Reflection[]>('femiora-reflections', []);
  const [milestones, setMilestones] = usePersistentState<Milestone[]>('femiora-milestones', []);
  const [cycles, setCycles] = usePersistentState<Cycle[]>('femiora-cycles', []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      // Set loading to true only if there's no cached data to display.
      if (!userProfile) {
        setIsLoading(true);
      }
      try {
        const { user, logs, reflections, milestones, cycles } = await api.fetchUserData();
        setUserProfile(user);
        setUserLogs(logs);
        setReflections(reflections);
        setMilestones(milestones);
        setCycles(cycles);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching your data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
    // We want this to run ONLY when the provider is first mounted.
    // The auth flow in App.tsx ensures this happens on login.
    // So, we can safely disable the exhaustive-deps lint rule here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUser = useCallback(async (updates: Partial<Omit<UserProfile, 'settings' | 'partnerAccess'| 'id' | 'createdAt'>> & { settings?: Partial<UserSettings>, partnerAccess?: PartnerAccess }) => {
    if (!userProfile) return;
    const updatedProfile = await api.updateUserProfile(updates);
    setUserProfile(updatedProfile);
  }, [userProfile, setUserProfile]);

  const completeOnboarding = useCallback(() => updateUser({ appState: 'dashboard' }), [updateUser]);

  const upgrade = useCallback(async (tier: Tier) => {
    await updateUser({ tier });
  }, [updateUser]);

  const saveLog = useCallback(async (entry: DailyLog) => {
    const { logs, user } = await api.saveLog(entry);
    setUserLogs(logs);
    setUserProfile(user);
  }, [setUserLogs, setUserProfile]);

  const saveReflections = useCallback(async (newReflectionsData: Omit<Reflection, 'id' | 'userId' | 'createdAt' | 'feedback'>[]) => {
    const updatedReflections = await api.saveReflections(newReflectionsData);
    setReflections(updatedReflections);
  }, [setReflections]);
  
  const saveReflectionFeedback = useCallback(async (reflectionId: string, feedback: 'helpful' | 'not_helpful') => {
    const updatedReflections = await api.saveReflectionFeedback(reflectionId, feedback);
    setReflections(updatedReflections);
  }, [setReflections]);

  const markMilestoneAsCelebrated = useCallback(async (milestoneId: string) => {
    const updatedMilestones = await api.markMilestoneAsCelebrated(milestoneId);
    setMilestones(updatedMilestones);
  }, [setMilestones]);
  
  const logPeriodDay = useCallback(async (date: string) => {
    const updatedCycles = await api.logPeriodDay(date);
    setCycles(updatedCycles);
  }, [setCycles]);

  const removePeriodDay = useCallback(async (date: string) => {
    const updatedCycles = await api.removePeriodDay(date);
    setCycles(updatedCycles);
  }, [setCycles]);

  const resetAllData = useCallback(async () => {
    const { user } = await api.resetAllData();
    // Clear local storage as well
    localStorage.removeItem('femiora-userProfile');
    localStorage.removeItem('femiora-userLogs');
    localStorage.removeItem('femiora-reflections');
    localStorage.removeItem('femiora-milestones');
    localStorage.removeItem('femiora-cycles');
    setUserProfile(user);
    setUserLogs([]);
    setReflections([]);
    setMilestones([]);
    setCycles([]);
  }, [setUserProfile, setUserLogs, setReflections, setMilestones, setCycles]);

  const signOut = useCallback(async () => {
    await api.signOut();
    // Clear all persisted data on sign out
    localStorage.clear(); 
    setUserProfile(null);
    setUserLogs([]);
    setReflections([]);
    setMilestones([]);
    setCycles([]);
  }, [setUserProfile, setUserLogs, setReflections, setMilestones, setCycles]);


  // Effect to check for new milestones
  useEffect(() => {
    if (userLogs.length > 0) {
      const uniqueLogDays = new Set(userLogs.map(log => log.date)).size;
      const achievedMilestones = milestones.map(m => m.days);

      for (const days of MILESTONE_DAYS) {
        if (uniqueLogDays >= days && !achievedMilestones.includes(days)) {
          const add = async () => {
            const today = new Date().toISOString().split('T')[0];
            const newMilestones = await api.addMilestone({ days, dateAchieved: today });
            setMilestones(newMilestones);
          };
          add();
        }
      }
    }
  }, [userLogs, milestones, setMilestones]);
  
  const value = useMemo(() => ({
    user: userProfile!,
    logs: userLogs,
    reflections,
    milestones,
    cycles,
    isLoading,
    saveLog,
    updateUser,
    completeOnboarding,
    upgrade,
    saveReflections,
    saveReflectionFeedback,
    markMilestoneAsCelebrated,
    logPeriodDay,
    removePeriodDay,
    resetAllData,
    signOut,
  }), [userProfile, userLogs, reflections, milestones, cycles, isLoading, saveLog, updateUser, completeOnboarding, upgrade, saveReflections, saveReflectionFeedback, markMilestoneAsCelebrated, logPeriodDay, removePeriodDay, resetAllData, signOut]);
  
  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-paper-white p-4">
             <div className="max-w-md w-full text-center">
                <h1 className="text-2xl font-serif text-red-700">Failed to Load Data</h1>
                <p className="text-gray-600 mt-2 mb-4">We couldn't retrieve your profile. Please check your connection and try again later.</p>
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-left text-sm">
                    <p><strong>Details:</strong> {error}</p>
                </div>
            </div>
        </div>
    );
  }

  if (isLoading || !userProfile) {
    return <LoadingScreen />;
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};