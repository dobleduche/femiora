
import React, { useMemo } from 'react';
import { HomeIcon, LockIcon, JournalIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';
import { useEntitlements } from '../../contexts/EntitlementContext';
import { useApp } from '../../contexts/AppContext';

const JournalView: React.FC = () => {
  const { logs: userLogs } = useUser();
  const { canAccessFullHistory } = useEntitlements();
  const { navigate, openUpgradeModal } = useApp();

  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const noteLogs = useMemo(() => {
    const allNotes = userLogs.filter(log => log.note).reverse();
    if (!canAccessFullHistory) {
      return allNotes.filter(log => new Date(log.date) >= fourteenDaysAgo);
    }
    return allNotes;
  }, [userLogs, canAccessFullHistory, fourteenDaysAgo]);

  return (
    <div className="min-h-screen bg-paper-white/80 pb-24 md:pb-8">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-gray-800">My Journal</h1>
            <p className="text-sm text-gray-500">A log of your personal observations.</p>
          </div>
          <button 
            onClick={() => navigate('home')}
            className="md:hidden flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <HomeIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!canAccessFullHistory && (
          <div className="mb-8 bg-gradient-to-r from-calm-sage/10 to-mist-blue/10 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-grow">
              <h3 className="font-medium text-gray-800">Viewing last 14 days</h3>
              <p className="text-sm text-gray-600">Upgrade to see all your past entries and reflections.</p>
            </div>
            <button 
                onClick={openUpgradeModal}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full bg-calm-sage text-white hover:bg-opacity-90 transition-colors"
            >
                <LockIcon className="w-4 h-4" />
                Unlock Full Journal
            </button>
          </div>
        )}

        <div className="space-y-8">
            {noteLogs.length > 0 ? (
                noteLogs.map(log => (
                    <div key={log.date} className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{log.note}</p>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 py-16 bg-white rounded-2xl shadow-soft border border-gray-100 flex flex-col items-center">
                    <JournalIcon className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="font-medium text-gray-700">Your journal is a blank canvas.</p>
                    <p className="text-sm mt-1">Tap the '+' button to add your first observation.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default JournalView;