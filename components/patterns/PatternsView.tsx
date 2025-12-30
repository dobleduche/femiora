
import React, { useState, useMemo } from 'react';
import SegmentedControl from '../ui/SegmentedControl';
import MoodCalendar from './MoodCalendar';
import SleepChart from './SleepChart';
import NotesFeed from './NotesFeed';
import SensationTracker from './SensationTracker';
import CycleHistoryChart from './CycleHistoryChart';
import { HomeIcon, LockIcon, DropletIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useEntitlements, EntitlementGuard } from '../../contexts/EntitlementContext';

type ChartType = 'mood' | 'cycle' | 'sensations' | 'sleep' | 'notes';

const PatternsView: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>('mood');
  const { logs: userLogs, cycles } = useUser();
  const { canAccessFullHistory } = useEntitlements();
  const { navigate, openUpgradeModal } = useApp();
  
  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const visibleLogs = useMemo(() => {
    if (!canAccessFullHistory) {
      return userLogs.filter(log => new Date(log.date) >= fourteenDaysAgo);
    }
    return userLogs;
  }, [userLogs, canAccessFullHistory, fourteenDaysAgo]);

  const renderChart = () => {
    switch (chartType) {
      case 'mood':
        return <MoodCalendar logs={visibleLogs} cycles={cycles} />;
      case 'cycle':
        return (
            <EntitlementGuard 
                feature="canTrackCycles"
                fallback={
            <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                <DropletIcon className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800">Track Your Cycle History</h3>
                <p className="text-sm mt-1 mb-4 max-w-sm">Upgrade to visualize your cycle lengths, see historical patterns, and get personalized predictions.</p>
                <button onClick={openUpgradeModal} className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full bg-calm-sage text-white hover:bg-opacity-90 transition-colors">
                    <LockIcon className="w-4 h-4" />
                    Unlock Cycle Tracking
                </button>
            </div>
                }
            >
                <CycleHistoryChart cycles={cycles} />
            </EntitlementGuard>
        );
      case 'sensations':
        return <SensationTracker logs={visibleLogs} />;
      case 'sleep':
        return <SleepChart logs={visibleLogs} />;
      case 'notes':
        return <NotesFeed logs={visibleLogs} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-paper-white/80 pb-24 md:pb-8">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-gray-800">Your Patterns</h1>
            <p className="text-sm text-gray-500">Observing rhythms in your experience.</p>
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
        <div className="mb-8">
          <SegmentedControl
            options={[
              { label: 'Mood', value: 'mood' },
              { label: 'Cycle', value: 'cycle' },
              { label: 'Sensations', value: 'sensations' },
              { label: 'Sleep', value: 'sleep' },
              { label: 'Notes', value: 'notes' },
            ]}
            selectedValue={chartType}
            onChange={(value) => setChartType(value)}
          />
        </div>

        {!canAccessFullHistory && (
          <div className="mb-8 bg-gradient-to-r from-calm-sage/10 to-mist-blue/10 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-grow">
              <h3 className="font-medium text-gray-800">Viewing last 14 days</h3>
              <p className="text-sm text-gray-600">Upgrade to unlock your complete history and see long-term patterns.</p>
            </div>
            <button 
                onClick={openUpgradeModal}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full bg-calm-sage text-white hover:bg-opacity-90 transition-colors"
            >
                <LockIcon className="w-4 h-4" />
                Unlock Full History
            </button>
          </div>
        )}

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-gray-100">
          {renderChart()}
        </div>
      </main>
    </div>
  );
};

export default PatternsView;