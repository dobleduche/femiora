
import React, { useMemo, useEffect, useState } from 'react';
import WelcomeFlow from './components/onboarding/WelcomeFlow';
import FreeTierDashboard from './components/free/FreeTierDashboard';
import PremiumDashboard from './components/paid/PremiumDashboard';
import UpgradeModal from './components/upgrade/UpgradeModal';
import MilestoneCelebration from './components/delighters/MilestoneCelebration';
import PremiumUnlock from './components/delighters/PremiumUnlock';
import PremiumNavbar from './components/mobile/PremiumNavbar';
import PatternsView from './components/patterns/PatternsView';
import JournalView from './components/journal/JournalView';
import ProfileView from './components/profile/ProfileView';
import ChatView from './components/chat/ChatView';
import LiveCoachView from './components/coach/LiveCoachView';
import UpgradeToChat from './components/chat/UpgradeToChat';
import LogEntryModal from './components/logging/LogEntryModal';
import ClinicianSummaryView from './components/summary/ClinicianSummaryView';
import WeeklySummaryView from './components/summary/WeeklySummaryView';
import PartnerAccessModal from './components/partner/PartnerAccessModal';
import PartnerView from './components/partner/PartnerView';
import TrendsView from './components/trends/TrendsView';
import WelcomeBack from './components/engagement/WelcomeBack';
import AuthFlow from './components/auth/AuthFlow';
import LoadingScreen from './components/ui/LoadingScreen';
import type { DailyLog, Tier, View } from './services/api';
import { UserProvider, useUser } from './contexts/UserContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { ProactiveUpgradeProvider } from './contexts/ProactiveUpgradeContext';
import { EntitlementProvider, useEntitlements } from './contexts/EntitlementContext';
import { supabase } from './lib/db';
import type { Session } from '@supabase/supabase-js';


export type { DailyLog };

// This component handles all UI logic and consumes context. It receives no props.
const AppUI: React.FC = () => {
    const { user, milestones, upgrade, markMilestoneAsCelebrated } = useUser();
    const entitlements = useEntitlements();
    const {
        currentView,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        isLogModalOpen,
        isPartnerModalOpen,
        welcomeBackMessage,
        setWelcomeBackMessage,
        clearWelcomeBackMessage,
        navigate,
    } = useApp();
    
    const [showPremiumUnlock, setShowPremiumUnlock] = useState(false);
    
    const uncelebratedMilestone = useMemo(() => milestones.find(m => !m.celebrated), [milestones]);

    useEffect(() => {
        if (user.settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [user.settings.theme]);

    useEffect(() => {
        if (user.appState === 'dashboard' && user.lastLogDate) {
            const today = new Date();
            const lastLog = new Date(user.lastLogDate);
            const diffTime = today.getTime() - lastLog.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 2) {
                let message = `Welcome back, ${user.settings.name}. It's been a few days.`;
                if (user.currentStreak > 1) {
                    message += ` Your ${user.currentStreak}-day streak ended, but a new journey begins today.`;
                }
                setWelcomeBackMessage(message);
            }
        }
    }, [user.appState, user.lastLogDate, user.currentStreak, user.settings.name, setWelcomeBackMessage]);
    
    const handleUpgrade = async (tier: Tier) => {
      await upgrade(tier);
      closeUpgradeModal();
      setShowPremiumUnlock(true);
    };
  
    const renderContent = () => {
        if (user.appState === 'onboarding') {
            return <WelcomeFlow />;
        }

        if (user.appState === 'dashboard') {
            if (currentView === 'weeklySummary' && entitlements.canAccessWeeklySummary) return <WeeklySummaryView />;
            if (currentView === 'liveCoach' && entitlements.canUseLiveCoach) return <LiveCoachView />;
            if (currentView === 'trendsView' && entitlements.canUseAdvancedTrends) return <TrendsView />;
            if (currentView === 'partnerView' && user.partnerAccess.enabled) return <PartnerView />;
            if (currentView === 'clinicianSummary' && entitlements.canUseClinicianSummary) return <ClinicianSummaryView />;
            if (currentView === 'chat') return entitlements.canAccessChat ? <ChatView /> : <UpgradeToChat />;
            if (currentView === 'patterns') return <PatternsView />;
            if (currentView === 'journal') return <JournalView />;
            if (currentView === 'profile') return <ProfileView />;
            
            return entitlements.isFree
                ? <FreeTierDashboard />
                : <PremiumDashboard />;
        }
        return null;
    };

    return (
        <div className="relative min-h-screen">
            {renderContent()}
            {user.appState === 'dashboard' && currentView !== 'partnerView' && (
                <div className="md:hidden">
                    <PremiumNavbar />
                </div>
            )}
            {isUpgradeModalOpen && <UpgradeModal onClose={closeUpgradeModal} onUpgrade={handleUpgrade} />}
            {uncelebratedMilestone && <MilestoneCelebration milestone={uncelebratedMilestone} onClose={() => markMilestoneAsCelebrated(uncelebratedMilestone.id)} />}
            {showPremiumUnlock && <PremiumUnlock onClose={() => setShowPremiumUnlock(false)} />}
            {isLogModalOpen && <LogEntryModal />}
            {isPartnerModalOpen && <PartnerAccessModal />}
            {welcomeBackMessage && <WelcomeBack message={welcomeBackMessage} onDismiss={clearWelcomeBackMessage} />}
        </div>
    );
};

// The root component now simply sets up the context providers.
// AppProvider must wrap UserProvider so AppUI can access both contexts
const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check the initial session state
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((error) => {
        console.error("Error fetching session:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Once we get an auth event, we are no longer in the initial loading state.
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
      return <LoadingScreen />;
  }

  if (!session) {
    return <AuthFlow />;
  }
  
  return (
    <AppProvider>
        <UserProvider>
            <EntitlementProvider>
                <ProactiveUpgradeProvider>
                    <AppUI />
                </ProactiveUpgradeProvider>
            </EntitlementProvider>
        </UserProvider>
    </AppProvider>
  );
};

export default App;
