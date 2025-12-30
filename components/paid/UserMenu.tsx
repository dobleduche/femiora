
import React from 'react';
import { ProfileIcon } from '../icons/Icons';
import { useApp } from '../../contexts/AppContext';

const UserMenu: React.FC = () => {
    const { navigate } = useApp();
    return (
        <button
            onClick={() => navigate('profile')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Open profile settings"
        >
            <ProfileIcon className="w-5 h-5 text-gray-600" />
        </button>
    );
};

export default UserMenu;
