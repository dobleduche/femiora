import React from 'react';
import { useApp } from '../../contexts/AppContext';

const QuietHome: React.FC = () => {
  const { openLogModal, navigate } = useApp();

  return (
    <div className="min-h-screen bg-paper-white/70 flex flex-col justify-center">
      <main className="max-w-lg mx-auto px-4 py-16 w-full">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <button
              onClick={openLogModal}
              className="w-full py-4 px-6 bg-calm-sage text-white rounded-full shadow-lg hover:bg-opacity-90 transition-all"
            >
              Write
            </button>
            <button
              onClick={() => navigate('journal')}
              className="w-full py-4 px-6 bg-white/80 text-gray-700 rounded-full border border-gray-200 shadow-soft hover:bg-white transition-all"
            >
              Sit with what’s here
            </button>
            <div className="space-y-2">
              <button
                onClick={() => navigate('patterns')}
                className="w-full py-4 px-6 bg-white/60 text-gray-700 rounded-full border border-gray-200 shadow-soft hover:bg-white transition-all"
              >
                Patterns (empty state)
              </button>
              <p className="text-sm text-gray-500">
                Patterns appear after time. There’s no rush.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuietHome;
