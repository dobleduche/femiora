
import React, { useEffect, useState } from 'react';
import type { View, Milestone } from '../../services/api';
import { useApp } from '../../contexts/AppContext';

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onClose: () => void;
}

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ milestone, onClose }) => {
  const { navigate } = useApp();
  const [visible, setVisible] = useState(false);

  const milestoneInfo: { [key: number]: { message: string; gift: string, targetView: View } } = {
    30: { message: "One month of self-observation!", gift: "Extended history", targetView: 'patterns' },
    90: { message: "Three months of patterns!", gift: "Custom reflection guide", targetView: 'journal' },
    180: { message: "Half a year of insights!", gift: "Premium feature unlock", targetView: 'trendsView' },
    365: { message: "One year of your journey!", gift: "Annual summary report", targetView: 'clinicianSummary' }
  };
  
  const info = milestoneInfo[milestone.days];

  useEffect(() => {
    // A small delay to allow the animation to be noticeable if a milestone is achieved on load
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [milestone.id]);
  
  const handleClose = (targetView?: View) => {
    setVisible(false);
    setTimeout(() => {
        if(targetView) navigate(targetView);
        onClose(); // This will trigger marking the milestone as celebrated
    }, 300); // Allow for exit animation
  };

  if (!info) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div
        className="bg-gradient-to-r from-soft-clay to-dawn-pink rounded-2xl p-6 shadow-2xl text-white max-w-sm"
      >
        <div className="flex items-start space-x-4">
          <div className="text-3xl mt-1">🎉</div>
          <div>
            <h4 className="text-lg font-serif mb-2">{info.message}</h4>
            <p className="text-sm opacity-90 mb-3">
              As a thank you, we've unlocked: <strong>{info.gift}</strong>
            </p>
            <button onClick={() => handleClose(info.targetView)} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors">
              Explore your gift →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneCelebration;
