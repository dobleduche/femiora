
import React, { useState } from 'react';
import { SparkleIcon, CheckCircleIcon, StarIcon, CheckIcon, CloseIcon } from '../icons/Icons';

type Tier = 'core' | 'premium';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: (tier: Tier) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
  const [selectedTier, setSelectedTier] = useState<Tier>('core');

  const coreFeatures = [
    "See your full history & long-term patterns",
    "Receive weekly AI summaries for reflection",
    "Discover potential energy & sensation correlations",
    "Secure cloud sync across all devices",
    "Data export in multiple formats",
    "Priority feature requests",
    "Ad-free forever"
  ];
  
  const premiumFeatures = [
    "Everything in Core, plus:",
    "Generate shareable summaries for reflections",
    "Share your journey with a trusted partner",
    "Ask questions with Advanced AI Trend Analysis",
    "Personalize your journaling with custom prompts",
    "Priority support & guidance",
    "Early access to new features"
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-feather-fall">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <CloseIcon className="w-6 h-6" />
        </button>
        {/* Hero header */}
        <div className="bg-gradient-to-r from-calm-sage/10 to-mist-blue/10 p-6 text-center shrink-0">
          <div className="inline-block p-3 rounded-full bg-white shadow-lg mb-4">
            <SparkleIcon className="w-8 h-8 text-calm-sage" />
          </div>
          <h2 className="text-3xl font-serif text-gray-800">See the whole picture</h2>
          <p className="text-gray-600 mt-2">Unlock deeper insights into your experience</p>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto">
          {/* Tier toggle */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-8 max-w-sm mx-auto">
            <button
              onClick={() => setSelectedTier('core')}
              className={`flex-1 py-3 rounded-full text-center transition-all ${selectedTier === 'core' ? 'bg-white shadow-md text-gray-800' : 'text-gray-600'}`}
            >
              <div className="font-medium">Core</div>
              <div className="text-sm">$11/month</div>
            </button>
            <button
              onClick={() => setSelectedTier('premium')}
              className={`flex-1 py-3 rounded-full text-center transition-all ${selectedTier === 'premium' ? 'bg-white shadow-md text-gray-800' : 'text-gray-600'}`}
            >
              <div className="font-medium">Premium</div>
              <div className="text-sm">$22/month</div>
            </button>
          </div>
          
          {/* Features comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-calm-sage mr-2" />
                Core Features
              </h3>
              <ul className="space-y-3">
                {coreFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-calm-sage mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="opacity-50 transition-opacity duration-300" style={{opacity: selectedTier === 'premium' ? 1 : 0.5}}>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <StarIcon className="w-6 h-6 text-soft-clay mr-2" />
                Premium Features
              </h3>
              <ul className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-soft-clay mr-2 mt-0.5 flex-shrink-0" />
                    <span className={`text-sm ${index === 0 ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Pricing psychology */}
          <div className="bg-gradient-to-r from-calm-sage/5 to-mist-blue/5 rounded-xl p-4 md:p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-serif text-gray-800">
                  {selectedTier === 'core' ? '$11' : '$22'}
                  <span className="text-lg text-gray-600">/month</span>
                </div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">
                  {selectedTier === 'core' ? 'Less than a weekly wellness class' : 'Less than two specialty coffees'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-gray-800">
                  {selectedTier === 'core' ? '$110' : '$220'}
                  <span className="text-sm text-gray-600">/year</span>
                </div>
                <div className="text-xs md:text-sm text-green-600">
                   Save 2 months with annual
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => onUpgrade(selectedTier)}
              className="w-full py-4 px-6 bg-gradient-to-r from-calm-sage to-mist-blue text-white rounded-full text-lg font-medium hover:shadow-xl transform hover:-translate-y-1 transition-all shadow-lg"
            >
              {selectedTier === 'core' ? 'Start seeing patterns →' : 'Explore deeper insights →'}
            </button>
            
            <button onClick={onClose} className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors">
              I'll stay with free for now
            </button>
            
            <div className="pt-4 border-t border-gray-100 text-center">
              <div className="text-xs text-gray-500 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
                <span>🔒 256-bit encryption</span>
                <span>✓ Cancel anytime</span>
                <span>💝 14-day guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
