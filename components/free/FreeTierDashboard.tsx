
import React, { useState, useEffect } from 'react';
import DailyReflection from './DailyReflection';
import FreeTierBenefits from './FreeTierBenefits';
import ValueComparison from '../pricing/ValueComparison';
import ProactiveUpgradePrompt from '../upgrade/ProactiveUpgradePrompt';
import StreakTracker from '../engagement/StreakTracker';
import EducationalSnippetCard from './EducationalSnippetCard';
import { CheckCircleIcon, ChartIcon, SparkleIcon, LockIcon } from '../icons/Icons';
import { useApp } from '../../contexts/AppContext';
import { useProactiveUpgrade } from '../../contexts/ProactiveUpgradeContext';

const FreeTierDashboard: React.FC = () => {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const { openUpgradeModal, navigate } = useApp();
  const { trigger, dismissTrigger } = useProactiveUpgrade();

  useEffect(() => {
    if (showSaveConfirmation) {
      const timer = setTimeout(() => setShowSaveConfirmation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaveConfirmation]);

  const handlePromptUpgrade = () => {
    openUpgradeModal();
    if (trigger) {
      dismissTrigger(trigger.id);
    }
  };

  const handlePromptDismiss = () => {
    if (trigger) {
      dismissTrigger(trigger.id);
    }
  };

  return (
    <>
      <div className="bg-paper-white/50 min-h-screen pb-24 md:pb-0">
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <header className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-800">Welcome to Femiora</h1>
            <p className="text-gray-600 mt-2">A space to notice your experience.</p>
          </header>

          {trigger && (
            <div className="mb-8">
              <ProactiveUpgradePrompt
                trigger={trigger}
                onUpgrade={handlePromptUpgrade}
                onDismiss={handlePromptDismiss}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <DailyReflection />
            
            <div className="space-y-8">
              <StreakTracker />
              <EducationalSnippetCard />
              {/* Weekly Summary Upsell Card */}
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft border border-gray-100 flex flex-col items-center justify-center text-center p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-clay/10 to-mist-blue/10"></div>
                  <div className="relative z-10">
                      <div className="inline-block p-3 rounded-full bg-white shadow-md mb-4">
                          <SparkleIcon className="w-8 h-8 text-soft-clay" />
                      </div>
                      <h3 className="font-serif text-xl text-gray-800">Unlock Weekly AI Summaries</h3>
                      <p className="text-sm text-gray-600 mt-2 mb-4">Get a personalized reflection on your week, helping you see patterns more clearly.</p>
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-left text-xs text-gray-500 blur-sm select-none">
                          <p className="font-medium text-gray-600">This past week, it looks like...</p>
                          <p>Your energy levels were highest on days when you slept more than 7 hours. Headaches appeared most often on Tuesday and Thursday. A gentle question for you...</p>
                      </div>
                      <button onClick={openUpgradeModal} className="mt-6 flex items-center justify-center gap-2 text-sm px-6 py-3 rounded-full bg-calm-sage text-white hover:bg-opacity-90 transition-colors shadow-lg">
                          <LockIcon className="w-4 h-4" />
                          Upgrade to Read
                      </button>
                  </div>
              </div>
            </div>
          </div>

           <div className="text-center mb-12">
              <button 
                onClick={() => navigate('patterns')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-calm-sage font-medium hover:bg-calm-sage/10 hover:shadow-soft transition-all"
              >
                <ChartIcon className="w-5 h-5" />
                View My Patterns
              </button>
            </div>
          
          <div className="mb-12">
            <FreeTierBenefits />
          </div>

          <div>
            <ValueComparison />
          </div>
        </main>
      </div>

      <div className={`fixed bottom-28 md:bottom-10 right-1/2 translate-x-1/2 md:right-10 md:translate-x-0 z-50 transition-all duration-300 ${showSaveConfirmation ? 'opacity-100' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-3 bg-calm-sage text-white rounded-full px-4 py-2 shadow-lg">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Observation Saved</span>
        </div>
      </div>
    </>
  );
};

export default FreeTierDashboard;
