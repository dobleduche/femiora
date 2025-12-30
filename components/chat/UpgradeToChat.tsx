
import React from 'react';
import { HomeIcon, SparkleIcon, LockIcon } from '../icons/Icons';
import { useApp } from '../../contexts/AppContext';

const UpgradeToChat: React.FC = () => {
  const { navigate, openUpgradeModal } = useApp();

  return (
    <div className="min-h-screen bg-paper-white/80 pb-24 md:pb-8 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif text-gray-800">AI Guide</h1>
            <p className="text-sm text-gray-500">Your personal wellness companion.</p>
          </div>
          <button 
            onClick={() => navigate('home')}
            className="md:hidden flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <HomeIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center px-4 py-8">
        <div className="bg-gradient-to-br from-white to-calm-sage/10 p-8 rounded-2xl shadow-soft border border-gray-100 max-w-lg">
            <div className="inline-block p-4 rounded-full bg-white shadow-lg mb-4">
                <SparkleIcon className="w-12 h-12 text-calm-sage" />
            </div>
            <h2 className="text-2xl font-serif text-gray-800 mb-2">Unlock Your Personal AI Guide</h2>
            <p className="text-gray-600 mb-6">
                Go beyond logging and start a conversation with your data. The Femiora AI Guide helps you discover patterns, ask questions, and gain deeper insights in a gentle, supportive way.
            </p>
            <button 
                onClick={openUpgradeModal}
                className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-calm-sage text-white hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 shadow-lg"
            >
                <LockIcon className="w-4 h-4" />
                Upgrade to Unlock Chat
            </button>
        </div>
      </main>
    </div>
  );
};

export default UpgradeToChat;
