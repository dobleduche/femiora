
import React, { useState, useEffect } from 'react';
import { SparkleIcon } from '../icons/Icons';

interface PremiumUnlockProps {
  onClose: () => void;
}

const PremiumUnlock: React.FC<PremiumUnlockProps> = ({ onClose }) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    // Animate in
    setIsShowing(true);
    
    // Set timer to animate out and then close
    const timer = setTimeout(() => {
      setIsShowing(false);
      setTimeout(onClose, 300); // Wait for fade-out animation to finish
    }, 3000); // Total display time: 3 seconds
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isShowing ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-calm-sage/30 to-mist-blue/30 backdrop-blur-sm" />
      <div 
        className={`text-center transition-all duration-500 ease-in-out ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="inline-block p-4 bg-white rounded-full shadow-2xl mb-6">
          <SparkleIcon className="w-16 h-16 text-soft-clay" />
        </div>
        <h3 className="text-3xl font-serif text-gray-800">Welcome to Premium!</h3>
        <p className="text-lg text-gray-600 mt-2">Your new features are now unlocked.</p>
      </div>
    </div>
  );
};

export default PremiumUnlock;
