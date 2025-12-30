
import React from 'react';
import type { View } from '../../services/api';
import { useApp } from '../../contexts/AppContext';

const NavItem: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
    >
        {label}
        {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-calm-sage rounded-full" />}
    </button>
);

const PremiumNav: React.FC = () => {
    const { currentView, navigate } = useApp();

    return (
        <nav className="flex items-center space-x-2">
            <NavItem 
                label="Dashboard" 
                isActive={currentView === 'home'} 
                onClick={() => navigate('home')} 
            />
            <NavItem 
                label="Patterns" 
                isActive={currentView === 'patterns'} 
                onClick={() => navigate('patterns')} 
            />
             <NavItem 
                label="Chat" 
                isActive={currentView === 'chat'} 
                onClick={() => navigate('chat')} 
            />
            <NavItem 
                label="Journal" 
                isActive={currentView === 'journal'} 
                onClick={() => navigate('journal')} 
            />
        </nav>
    );
};

export default PremiumNav;
