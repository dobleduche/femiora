
import React from 'react';
import { FlameIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';

const StreakTracker: React.FC = () => {
    const { user } = useUser();
    const streak = user.currentStreak || 0;

    const isHotStreak = streak >= 5;

    return (
        <div className={`
            relative overflow-hidden rounded-2xl border p-6 text-center flex flex-col items-center justify-center
            ${isHotStreak 
                ? 'bg-gradient-to-br from-soft-clay/10 to-dawn-pink/20 border-soft-clay/30' 
                : 'bg-white dark:bg-dusk-surface border-gray-100 dark:border-transparent shadow-soft'}
            transition-all duration-500
        `}>
             <div className={`
                p-3 rounded-full mb-3
                ${isHotStreak ? 'bg-soft-clay/20' : 'bg-calm-sage/10 dark:bg-calm-sage/20'}
             `}>
                <FlameIcon className={`
                    w-8 h-8 
                    ${isHotStreak ? 'text-soft-clay' : 'text-calm-sage dark:text-calm-sage'}
                `} />
             </div>
             <h3 className="text-3xl font-bold text-gray-800 dark:text-dusk-text">{streak}</h3>
             <p className="text-sm text-gray-500 dark:text-dusk-text-muted">Day Streak</p>
             {isHotStreak && (
                <div className="mt-2 text-xs font-bold text-soft-clay animate-pulse">
                    ON FIRE!
                </div>
             )}
        </div>
    );
};

export default StreakTracker;
