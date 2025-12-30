
import React, { useState } from 'react';
import { CloseIcon, UsersIcon } from '../icons/Icons';
import type { PartnerAccess } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

const PartnerAccessModal: React.FC = () => {
  const { user, updateUser } = useUser();
  const { isPartnerModalOpen, closePartnerModal } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isPartnerModalOpen) return null;

  const handleInvite = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    updateUser({ partnerAccess: { enabled: true, partnerEmail: email } });
    closePartnerModal();
  };

  const handleRevoke = () => {
    if (window.confirm(`Are you sure you want to revoke access for ${user.partnerAccess.partnerEmail}? They will no longer be able to view your journey.`)) {
      updateUser({ partnerAccess: { enabled: false, partnerEmail: null } });
      closePartnerModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-feather-fall" onClick={closePartnerModal}>
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center border-b border-gray-100">
          <div className="inline-block p-3 rounded-full bg-soft-clay/10 mb-4">
            <UsersIcon className="w-8 h-8 text-soft-clay" />
          </div>
          <h2 className="text-xl font-serif text-gray-800">Partner Access</h2>
          <p className="text-sm text-gray-500 mt-1">Share your journey with someone you trust.</p>
        </div>

        {user.partnerAccess.enabled ? (
          <div className="p-6 space-y-4">
            <p className="text-center text-gray-700">
              You are currently sharing read-only access with <strong className="font-medium text-calm-sage">{user.partnerAccess.partnerEmail}</strong>.
            </p>
            <p className="text-xs text-center text-gray-500 bg-gray-50 p-3 rounded-lg">
              They can view your logged moods, symptoms, and notes but cannot make any changes. You can revoke access at any time.
            </p>
            <button
              onClick={handleRevoke}
              className="w-full py-3 px-6 bg-red-500 text-white rounded-full font-medium
                         hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
            >
              Revoke Access
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Invite a partner or trusted friend to view your journey in a read-only mode. This can help them understand your experience and provide better support.
            </p>
            <div>
              <label htmlFor="partner-email" className="text-sm font-medium text-gray-700 mb-1 block">Partner's Email</label>
              <input
                id="partner-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mist-blue focus:border-mist-blue transition-colors text-gray-700"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              onClick={handleInvite}
              className="w-full py-3 px-6 bg-calm-sage text-white rounded-full font-medium
                         hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5
                         shadow-md hover:shadow-lg"
            >
              Send Invite
            </button>
          </div>
        )}
        
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
            <button onClick={closePartnerModal} className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm">
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerAccessModal;
