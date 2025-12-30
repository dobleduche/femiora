
import React from 'react';
import { FeatherIcon } from '../icons/Icons';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-paper-white to-dawn-pink dark:from-dusk-bg dark:to-dusk-bg/90">
      <div className="text-center animate-feather-fall">
        <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-calm-sage/10 dark:bg-calm-sage/20 rounded-full animate-pulse"></div>
            <FeatherIcon className="w-24 h-24 p-6 text-calm-sage dark:text-calm-sage/80" />
        </div>
        <p className="text-lg font-serif text-gray-600 dark:text-dusk-text-muted">
          Preparing your calm space...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
