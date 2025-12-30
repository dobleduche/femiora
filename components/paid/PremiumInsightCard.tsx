
import React, { useState } from 'react';
import type { Reflection } from '../../services/api';
import { ThumbsUpIcon, ThumbsDownIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';

interface PremiumInsightCardProps {
    insight: Reflection;
}

const PremiumInsightCard: React.FC<PremiumInsightCardProps> = ({ insight }) => {
    const { saveReflectionFeedback } = useUser();
    const [showThanks, setShowThanks] = useState(false);
    const { title, description, confidence, trend } = insight;

    const handleFeedback = async (feedback: 'helpful' | 'not_helpful') => {
        if (insight.feedback) return; // Already provided feedback
        await saveReflectionFeedback(insight.id, feedback);
        setShowThanks(true);
        setTimeout(() => setShowThanks(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl border border-gray-100 dark:border-transparent shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-xl text-gray-800 dark:text-dusk-text">{title}</h3>
                <div className={`capitalize text-xs px-2 py-1 rounded-full ${
                    confidence === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300' : 
                    confidence === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300' : 
                    'bg-gray-100 text-gray-800 dark:bg-dusk-bg dark:text-dusk-text-muted'
                }`}>
                    {confidence} confidence
                </div>
            </div>
            <p className="text-gray-600 dark:text-dusk-text-muted mb-6 flex-grow">{description}</p>
            <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-dusk-text-muted">Helpful?</span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleFeedback('helpful')}
                            disabled={!!insight.feedback}
                            className={`p-1.5 rounded-full transition-colors ${insight.feedback === 'helpful' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300' : 'text-gray-400 dark:text-dusk-text-muted/70 hover:bg-gray-100 dark:hover:bg-dusk-bg disabled:text-gray-300 dark:disabled:text-dusk-bg'}`}
                        >
                            <ThumbsUpIcon className="w-4 h-4" />
                        </button>
                         <button 
                            onClick={() => handleFeedback('not_helpful')}
                            disabled={!!insight.feedback}
                            className={`p-1.5 rounded-full transition-colors ${insight.feedback === 'not_helpful' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-dusk-text-muted/70 hover:bg-gray-100 dark:hover:bg-dusk-bg disabled:text-gray-300 dark:disabled:text-dusk-bg'}`}
                        >
                            <ThumbsDownIcon className="w-4 h-4" />
                        </button>
                    </div>
                     <div className={`text-xs text-calm-sage transition-opacity duration-300 ${showThanks ? 'opacity-100' : 'opacity-0'}`}>
                        Thank you for your feedback!
                    </div>
                </div>
                <div className={`capitalize text-xs px-2 py-1 rounded-full ${
                    trend === 'improving' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300' :
                    trend === 'declining' ? 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300' :
                    'bg-gray-100 text-gray-800 dark:bg-dusk-bg dark:text-dusk-text-muted'
                }`}>
                   Trend: {trend}
                </div>
            </div>
        </div>
    );
};

export default PremiumInsightCard;
