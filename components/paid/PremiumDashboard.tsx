
import React from 'react';
import { StarIcon, HeartIcon, UsersIcon, TrendingUpIcon, MicIcon, SparkleIcon, ArrowRightIcon } from '../icons/Icons';
import AIPoweredInsights from './AIPoweredInsights';
import PremiumNav from './PremiumNav';
import UserMenu from './UserMenu';
import CycleTracker from '../cycle/CycleTracker';
import StreakTracker from '../engagement/StreakTracker';
import DeepInsightCard from './DeepInsightCard';
import { useUser } from '../../contexts/UserContext';
import { useEntitlements } from '../../contexts/EntitlementContext';
import { useApp } from '../../contexts/AppContext';
import { getGreeting, getDynamicMessage } from '../../utils/greetings';

const WeeklySummaryCard: React.FC = () => {
    const { navigate } = useApp();
    return (
        <div 
            onClick={() => navigate('weeklySummary')}
            className="cursor-pointer group bg-white dark:bg-dusk-surface p-6 rounded-2xl border border-gray-100 dark:border-transparent shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-xl text-gray-800 dark:text-dusk-text">Weekly Reflection</h3>
                <div className="p-2 rounded-full bg-calm-sage/10 dark:bg-calm-sage/20">
                    <SparkleIcon className="w-5 h-5 text-calm-sage" />
                </div>
            </div>
            <p className="text-gray-600 dark:text-dusk-text-muted text-sm mb-6 flex-grow">Your AI-powered summary of the last 7 days is ready. Take a moment to reflect on your journey.</p>
            <div className="flex justify-between items-center mt-auto">
                 <span className="text-sm font-medium text-calm-sage flex items-center gap-1">
                     View Summary
                     <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                 </span>
                <div className="text-xs px-2 py-1 rounded-full bg-calm-sage/20 text-calm-sage">
                   New
                </div>
            </div>
        </div>
    );
}

interface ToolCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    status: 'ready' | 'not_setup';
    actionText: string;
    onAction: () => void;
    secondaryActionText?: string;
    onSecondaryAction?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, status, actionText, onAction, secondaryActionText, onSecondaryAction }) => (
    <div className="bg-white/50 dark:bg-dusk-surface/50 p-6 rounded-xl border border-transparent hover:border-dawn-pink dark:hover:border-soft-clay/50 transition-colors duration-300 flex flex-col">
        <div className="text-3xl mb-3">{icon}</div>
        <h4 className="font-medium text-gray-800 dark:text-dusk-text mb-2">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-dusk-text-muted flex-grow mb-4">{description}</p>
        <div className="flex flex-col gap-2 mt-auto">
            <button 
                onClick={onAction}
                className={`w-full text-sm px-4 py-2 rounded-full transition-colors ${
                status === 'ready' ? 'bg-soft-clay text-white hover:bg-opacity-90' : 'border border-soft-clay text-soft-clay hover:bg-soft-clay hover:text-white dark:hover:text-dusk-bg'
            }`}>
                {actionText}
            </button>
            {secondaryActionText && onSecondaryAction && (
                 <button 
                    onClick={onSecondaryAction}
                    className="w-full text-sm px-4 py-2 rounded-full transition-colors border border-gray-300 dark:border-dusk-text-muted/30 text-gray-600 dark:text-dusk-text-muted hover:bg-gray-100 dark:hover:bg-dusk-bg"
                >
                    {secondaryActionText}
                </button>
            )}
        </div>
    </div>
);


const PremiumDashboard: React.FC = () => {
  const { user: userProfile } = useUser();
  const { tier, isPremium, canTrackCycles } = useEntitlements();
  const { navigate, openPartnerModal } = useApp();
  const greeting = getGreeting();
  const dynamicMessage = getDynamicMessage();

  const memberSince = new Date(userProfile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
    
  return (
    <div className="min-h-screen bg-gradient-to-b from-paper-white to-gray-50 dark:from-dusk-bg dark:to-dusk-bg/90 pb-24 md:pb-0">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-dusk-surface/80 backdrop-blur-lg border-b border-gray-100 dark:border-dusk-surface hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-serif text-gray-800 dark:text-dusk-text">Femiora</h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${tier === 'premium' ? 'bg-soft-clay/20 text-soft-clay' : 'bg-calm-sage/20 text-calm-sage'}`}>
                    {tier}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-dusk-text-muted">Pattern awareness companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <PremiumNav />
                <UserMenu />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-calm-sage/10 to-mist-blue/10 dark:from-calm-sage/20 dark:to-mist-blue/20 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif text-gray-800 dark:text-dusk-text mb-1">{greeting}, {userProfile.settings.name}</h2>
                <p className="text-gray-600 dark:text-dusk-text-muted italic">{dynamicMessage}</p>
              </div>
              <div className="text-left md:text-right flex items-center gap-6">
                <StreakTracker />
                <div>
                  <div className="text-sm text-gray-500 dark:text-dusk-text-muted">Member since</div>
                  <div className="text-lg font-medium text-gray-800 dark:text-dusk-text">{memberSince}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-4">
                {canTrackCycles && <CycleTracker />}
                <AIPoweredInsights />
            </div>
            <div className="space-y-8">
                <WeeklySummaryCard />
                <DeepInsightCard />
            </div>
        </div>
        
        {isPremium && (
          <div className="bg-gradient-to-br from-white to-dawn-pink/20 dark:from-dusk-surface dark:to-dusk-surface/80 rounded-2xl border border-dawn-pink/30 dark:border-soft-clay/20 p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
              <div>
                <h3 className="text-xl font-serif text-gray-800 dark:text-dusk-text flex items-center">
                  <StarIcon className="w-6 h-6 text-soft-clay mr-2" />
                  Premium Tools
                </h3>
                <p className="text-gray-600 dark:text-dusk-text-muted">Exclusive features for deeper understanding</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-dusk-text-muted/80">Only available on Premium</div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ToolCard icon={<MicIcon className="w-8 h-8 text-soft-clay" />} title="Live AI Coach" description="Talk with your guide in real-time for instant support." status="ready" actionText="Start Session" onAction={() => navigate('liveCoach')} />
              <ToolCard icon="📝" title="Support Summary" description="Generate a shareable report of your observations." status="ready" actionText="Create report" onAction={() => navigate('clinicianSummary')} />
              <ToolCard 
                icon={<UsersIcon className="w-8 h-8 text-soft-clay" />} 
                title="Partner Access" 
                description={userProfile.partnerAccess.enabled ? `Sharing with ${userProfile.partnerAccess.partnerEmail}` : "Share read-only access with a trusted person."}
                status={userProfile.partnerAccess.enabled ? "ready" : "not_setup"} 
                actionText={userProfile.partnerAccess.enabled ? "View as Partner" : "Invite partner"}
                onAction={userProfile.partnerAccess.enabled ? () => navigate('partnerView') : openPartnerModal}
                secondaryActionText={userProfile.partnerAccess.enabled ? "Manage" : undefined}
                onSecondaryAction={userProfile.partnerAccess.enabled ? openPartnerModal : undefined}
              />
              <ToolCard icon={<TrendingUpIcon className="w-8 h-8 text-soft-clay" />} title="Advanced Trends" description="Ask questions and get AI-powered analysis of your long-term data." status="ready" actionText="Explore trends" onAction={() => navigate('trendsView')} />
            </div>
          </div>
        )}
        
        <div className="text-center py-8">
          <div className="inline-block p-4 rounded-full bg-calm-sage/10 dark:bg-calm-sage/20">
            <HeartIcon className="w-8 h-8 text-calm-sage" />
          </div>
          <p className="text-gray-600 dark:text-dusk-text-muted mt-4 max-w-md mx-auto">
            Thank you for supporting Femiora. Your subscription ensures we can continue providing a private, ad-free space for women's wellness.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-dusk-text-muted/80">
            Next billing: May 15, 2024 • 
            <button className="ml-2 text-calm-sage hover:underline">Manage subscription</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumDashboard;
