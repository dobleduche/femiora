
import React, { useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import { triggerHapticFeedback } from '../../utils/haptics';

const CycleTracker: React.FC = () => {
    const { cycles, logPeriodDay } = useUser();

    const currentCycle = useMemo(() => {
        if (cycles.length === 0) return null;
        return cycles[cycles.length - 1];
    }, [cycles]);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const cycleDay = useMemo(() => {
        if (!currentCycle) return null;
        const startDate = new Date(currentCycle.startDate);
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    }, [currentCycle, today]);

    const isPeriodToday = currentCycle?.periodDays.includes(todayStr);
    
    const handleLogPeriod = () => {
        triggerHapticFeedback('medium');
        logPeriodDay(todayStr);
    };

    if (!currentCycle) {
        return (
            <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl border border-gray-100 dark:border-transparent shadow-soft flex flex-col items-center justify-center text-center">
                 <div className="text-3xl mb-3">🩸</div>
                 <h3 className="font-serif text-lg text-gray-800 dark:text-dusk-text">Track Your Cycle</h3>
                 <p className="text-sm text-gray-600 dark:text-dusk-text-muted mt-1 mb-4">Log the first day of your period to begin.</p>
                 <button 
                    onClick={handleLogPeriod}
                    className="w-full sm:w-auto px-6 py-2 rounded-full bg-soft-clay text-white hover:bg-opacity-90 transition-colors"
                >
                    Log Period Today
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl border border-gray-100 dark:border-transparent shadow-soft">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-serif text-xl text-gray-800 dark:text-dusk-text">Cycle Overview</h3>
                    <p className="text-sm text-gray-500 dark:text-dusk-text-muted">Today is day {cycleDay}</p>
                </div>
                 <button 
                    onClick={handleLogPeriod}
                    className={`text-sm px-4 py-2 rounded-full transition-colors ${
                        isPeriodToday 
                        ? 'bg-soft-clay/20 text-soft-clay-darker font-medium'
                        : 'border border-soft-clay text-soft-clay hover:bg-soft-clay hover:text-white'
                    }`}
                >
                    {isPeriodToday ? 'Period Logged' : 'Log Period Today'}
                </button>
            </div>
            <div className="mt-4 flex items-center gap-6">
                <div className="text-center">
                    <div className="text-3xl font-bold text-calm-sage">{cycleDay}</div>
                    <div className="text-xs text-gray-500 dark:text-dusk-text-muted">Cycle Day</div>
                </div>
                 <div className="text-center">
                    <div className="text-3xl font-bold text-soft-clay">{currentCycle.periodDays.length}</div>
                    <div className="text-xs text-gray-500 dark:text-dusk-text-muted">Period Length</div>
                </div>
            </div>
        </div>
    );
};

export default CycleTracker;
