
import React, { useRef, useEffect, useState } from 'react';
import { HomeIcon, CalendarIcon, PlusIcon, JournalIcon, ProfileIcon, StarIcon, MessageIcon } from '../icons/Icons';
import { triggerHapticFeedback } from '../../utils/haptics';
import type { View } from '../../services/api';
import { useEntitlements } from '../../contexts/EntitlementContext';
import { useApp } from '../../contexts/AppContext';

interface NavIconProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: 'new' | 'premium' | null;
  onClick: () => void;
  ref: React.RefObject<HTMLButtonElement>;
}

const NavIcon = React.forwardRef<HTMLButtonElement, Omit<NavIconProps, 'ref'>>(({ icon, label, active = false, badge = null, onClick }, ref) => (
  <button ref={ref} onClick={() => { onClick(); triggerHapticFeedback(); }} className={`relative flex flex-col items-center space-y-1 w-16 transition-colors z-10 ${active ? 'text-calm-sage' : 'text-gray-400 hover:text-calm-sage'}`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
    {badge === 'new' && <span className="absolute top-0 right-3 text-[10px] bg-soft-clay text-white px-1.5 py-0.5 rounded-full">new</span>}
    {badge === 'premium' && <StarIcon className="absolute top-0 right-3 w-3 h-3 text-soft-clay"/>}
  </button>
));

const PremiumNavbar: React.FC = () => {
  const { tier, isFree, isPremium } = useEntitlements();
  const { currentView, navigate, openLogModal } = useApp();
  const [isPulsing, setIsPulsing] = useState(false);

  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  const iconRefs = {
      home: useRef<HTMLButtonElement>(null),
      patterns: useRef<HTMLButtonElement>(null),
      chat: useRef<HTMLButtonElement>(null),
      profile: useRef<HTMLButtonElement>(null),
  };

  const navItems: { view: View, icon: React.ReactNode, label: string, badge?: 'new' | 'premium', ref: React.RefObject<HTMLButtonElement> }[] = [
      { view: 'home', icon: <HomeIcon className="w-6 h-6"/>, label: 'Home', ref: iconRefs.home},
      { view: 'patterns', icon: <CalendarIcon className="w-6 h-6"/>, label: 'Patterns', ref: iconRefs.patterns},
      { view: 'chat', icon: <MessageIcon className="w-6 h-6"/>, label: 'Chat', badge: isFree ? 'new' : undefined, ref: iconRefs.chat},
      { view: 'profile', icon: <ProfileIcon className="w-6 h-6"/>, label: 'Profile', badge: isPremium ? 'premium' : undefined, ref: iconRefs.profile},
  ];

  useEffect(() => {
    const activeItem = navItems.find(item => item.view === currentView);
    if (activeItem && activeItem.ref?.current && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const iconRect = activeItem.ref.current.getBoundingClientRect();
        setIndicatorStyle({
            left: iconRect.left - navRect.left,
            width: iconRect.width,
        });
    }
  }, [currentView, navItems]);

  const handleAddClick = () => {
    openLogModal();
    triggerHapticFeedback('medium');
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {!isFree && (
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-calm-sage to-mist-blue text-white px-4 py-1 rounded-t-lg text-xs font-medium uppercase tracking-wider">
          {tier}
        </div>
      )}
      <div ref={navRef} className="relative flex justify-around items-center px-2 py-2">
        {/* Dynamic sliding indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-10 bg-calm-sage/10 rounded-full transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]" 
          style={indicatorStyle}
        />
        
        {/* First half of nav items */}
        {navItems.slice(0, 2).map(item => (
            <NavIcon key={item.view} ref={item.ref} active={currentView === item.view} icon={item.icon} label={item.label} badge={item.badge} onClick={() => navigate(item.view)} />
        ))}
        
        {/* Center action button */}
        <div className="relative -top-5 z-20">
          <button 
            onClick={handleAddClick}
            className={`bg-gradient-to-r from-calm-sage to-mist-blue rounded-full p-4 shadow-lg transition-all transform hover:-translate-y-1 ${isPulsing ? 'scale-110' : ''}`}>
            <PlusIcon className="w-7 h-7 text-white" />
          </button>
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-soft-clay rounded-full flex items-center justify-center border-2 border-white">
              <StarIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        {/* Second half of nav items */}
         {navItems.slice(2, 4).map(item => (
            <NavIcon key={item.view} ref={item.ref} active={currentView === item.view} icon={item.icon} label={item.label} badge={item.badge} onClick={() => navigate(item.view)} />
        ))}
      </div>
    </div>
  );
};

export default PremiumNavbar;