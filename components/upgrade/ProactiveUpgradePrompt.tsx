
import React from 'react';
import { UpgradeTrigger } from '../../services/proactive-upgrade';
import { CloseIcon, LightbulbIcon } from '../icons/Icons';

interface ProactiveUpgradePromptProps {
  trigger: UpgradeTrigger;
  onUpgrade: () => void;
  onDismiss: () => void;
}

const ProactiveUpgradePrompt: React.FC<ProactiveUpgradePromptProps> = ({ trigger, onUpgrade, onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-calm-sage/10 to-mist-blue/10 p-4 rounded-2xl border border-calm-sage/20 relative animate-feather-fall">
      <button onClick={onDismiss} className="absolute top-2 right-2 text-calm-sage/50 hover:text-calm-sage transition-colors">
        <CloseIcon className="w-5 h-5" />
      </button>
      <div className="flex items-start gap-4">
        <div className="mt-1 text-calm-sage p-2 bg-white/50 rounded-full">
            <LightbulbIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">An insight is emerging...</h4>
          <p className="text-sm text-gray-600 mt-1 mb-3" dangerouslySetInnerHTML={{ __html: trigger.message }} />
          <button
            onClick={onUpgrade}
            className="text-sm font-medium text-calm-sage bg-white border border-calm-sage/30 px-4 py-2 rounded-full hover:bg-calm-sage/10 transition-colors"
          >
            {trigger.cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProactiveUpgradePrompt;
