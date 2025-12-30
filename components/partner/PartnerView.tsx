
import React, { useMemo } from 'react';
import MoodCalendar from '../patterns/MoodCalendar';
import SensationTracker from '../patterns/SensationTracker';
import NotesFeed from '../patterns/NotesFeed';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useEntitlements } from '../../contexts/EntitlementContext';
import { InfoIcon } from '../icons/Icons';

const PartnerView: React.FC = () => {
  const { user, logs: userLogs, cycles } = useUser();
  const { navigate } = useApp();
  const { canAccessFullHistory } = useEntitlements();

  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const visibleLogs = useMemo(() => {
    if (!canAccessFullHistory) {
      return userLogs.filter(log => new Date(log.date) >= fourteenDaysAgo);
    }
    return userLogs;
  }, [userLogs, canAccessFullHistory, fourteenDaysAgo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-white to-mist-blue/20 pb-8">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif text-gray-800">Viewing {user.settings.name}'s Journey</h1>
            <p className="text-sm text-gray-500">Read-only access for {user.partnerAccess.partnerEmail}</p>
          </div>
          <button 
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Exit Partner View
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {!canAccessFullHistory && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3">
            <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
                You are viewing the last 14 days of {user.settings.name}'s journey. To provide the best support, you can gently encourage them to upgrade to a Core plan to share their full history.
            </p>
          </div>
        )}
        <div className="bg-white/80 p-6 rounded-2xl shadow-soft border border-gray-100">
            <MoodCalendar logs={visibleLogs} cycles={cycles} />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/80 p-6 rounded-2xl shadow-soft border border-gray-100">
                <SensationTracker logs={visibleLogs} />
            </div>
            <div className="bg-white/80 p-6 rounded-2xl shadow-soft border border-gray-100">
                <NotesFeed logs={visibleLogs} />
            </div>
        </div>
      </main>
    </div>
  );
};

export default PartnerView;