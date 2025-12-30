
import React, { useMemo } from 'react';
import { FeatherIcon, CheckCircleIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    action: string;
    isComplete: boolean;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, action, isComplete, onClick }) => (
    <div 
        onClick={onClick}
        className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg border border-transparent hover:border-gray-200/80 hover:bg-white/80 transition-all duration-300 cursor-pointer"
    >
        <div className="text-2xl">{icon}</div>
        <div className="flex-grow">
            <h4 className="font-medium text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        {isComplete ? (
            <div className="flex items-center gap-1 text-calm-sage">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Logged</span>
            </div>
        ) : (
            <button className="text-sm font-medium text-calm-sage hover:underline">
                {action}
            </button>
        )}
    </div>
);

const DailyReflection: React.FC = () => {
  const { logs } = useUser();
  const { openUpgradeModal, openLogModal } = useApp();
  
  const log = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return logs.find(l => l.date === today) || {};
  }, [logs]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-soft 
                    border border-gray-100 hover:shadow-xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-dawn-pink/20 to-calm-sage/20 opacity-20" />
      
      <div className="relative p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-xl font-serif text-gray-800">Today's Reflection</h3>
            <p className="text-sm text-gray-500">Just for you, just for today</p>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-dawn-pink/40 text-gray-700 font-medium whitespace-nowrap">
            Free • Always will be
          </div>
        </div>
        
        <div className="space-y-3">
          <FeatureCard 
            icon="🌿"
            title="One-tap mood check"
            description="How are you arriving today?"
            action="Log mood"
            isComplete={!!log.mood}
            onClick={openLogModal}
          />
           <FeatureCard 
            icon="🏷️"
            title="Sensation Check"
            description="Any physical sensations?"
            action="Log sensations"
            isComplete={!!log.sensations && log.sensations.length > 0}
            onClick={openLogModal}
          />
          <FeatureCard 
            icon="📝"
            title="Quick note"
            description="Capture one observation"
            action="Add note"
            isComplete={!!log.note}
            onClick={openLogModal}
          />
          
          <FeatureCard 
            icon="🌙"
            title="Sleep quality"
            description="How rested do you feel?"
            action="Rate sleep"
            isComplete={log.sleep !== undefined}
            onClick={openLogModal}
          />
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Viewing your recent patterns
              </p>
              <p className="text-xs text-gray-500">
                Upgrade to keep your full history.
              </p>
            </div>
            <button 
              onClick={openUpgradeModal}
              className="text-sm px-4 py-2 rounded-full border border-calm-sage 
                       text-calm-sage hover:bg-calm-sage hover:text-white transition-colors whitespace-nowrap"
            >
              Keep all my history
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 text-calm-sage opacity-10">
        <FeatherIcon className="w-24 h-24" />
      </div>
    </div>
  );
};

export default DailyReflection;