
import React from 'react';
import { LightbulbIcon } from '../icons/Icons';

const EducationalSnippetCard: React.FC = () => {
    return (
        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl border border-gray-100 dark:border-transparent shadow-soft">
            <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-mist-blue/10 dark:bg-mist-blue/20">
                    <LightbulbIcon className="w-5 h-5 text-mist-blue" />
                </div>
                <div>
                    <h3 className="font-serif text-lg text-gray-800 dark:text-dusk-text">A Gentle Note</h3>
                    <p className="text-sm text-gray-600 dark:text-dusk-text-muted mt-2">
                        Observing without judgment is a skill. Simply noticing "I have a headache" is enough. You don't need to fix it, just acknowledge it. Patterns often reveal themselves over time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EducationalSnippetCard;
