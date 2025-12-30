
import React, { useState, useEffect } from 'react';
import { LeafIcon } from '../icons/Icons';
import { useApp } from '../../contexts/AppContext';

interface WelcomeBackProps {
  message: string;
  onDismiss: () => void;
}

const WelcomeBack: React.FC<WelcomeBackProps> = ({ message, onDismiss }) => {
  const { openLogModal } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };
  
  const handleLog = () => {
    openLogModal();
    handleDismiss();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />
      <div 
        className={`bg-white rounded-3xl max-w-md w-full shadow-2xl p-8 text-center transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="inline-block p-4 rounded-full bg-calm-sage/10 mb-4">
          <LeafIcon className="w-12 h-12 text-calm-sage" />
        </div>
        <h2 className="text-2xl font-serif text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <button
            onClick={handleLog}
            className="w-full py-3 px-6 bg-calm-sage text-white rounded-full font-medium
                       hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5
                       shadow-md hover:shadow-lg"
          >
            Log Today's Observation
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBack;
