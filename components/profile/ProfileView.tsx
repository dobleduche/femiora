
import React, { useState, useEffect } from 'react';
import { HomeIcon, CheckIcon, Edit2Icon, PlusIcon, TrashIcon, SparkleIcon, LogOutIcon, TrendingUpIcon, DropletIcon, MoonIcon, TagIcon, FeatherIcon, LockIcon, LeafIcon } from '../icons/Icons';
import SegmentedControl from '../ui/SegmentedControl';
import ToggleSwitch from '../ui/ToggleSwitch';
import type { UserProfile, Tier, View, Theme, UserSettings } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';
import { useEntitlements, EntitlementGuard } from '../../contexts/EntitlementContext';

const focusOptions = [
    { id: 'energy', label: 'Energy levels throughout the day', icon: <TrendingUpIcon className="w-8 h-8" /> },
    { id: 'mood', label: 'Mood tone — light, heavy, calm, tense', icon: <FeatherIcon className="w-8 h-8" /> },
    { id: 'sleep', label: 'Sleep quality and restfulness', icon: <MoonIcon className="w-8 h-8" /> },
    { id: 'focus', label: 'Focus and mental clarity', icon: <SparkleIcon className="w-8 h-8" /> },
    { id: 'temperature', label: 'Body temperature sensations', icon: <TagIcon className="w-8 h-8" /> },
    { id: 'stress', label: 'Stress pressure or ease', icon: <LockIcon className="w-8 h-8" /> },
    { id: 'motivation', label: 'Motivation — what moves you?', icon: <LeafIcon className="w-8 h-8" /> },
    { id: 'appetite', label: 'Appetite shifts', icon: <TagIcon className="w-8 h-8" /> },
    { id: 'cycles', label: 'Personal cadence', icon: <DropletIcon className="w-8 h-8" /> },
];

const ProfileView: React.FC = () => {
  const { user: userProfile, logs: userLogs, updateUser, resetAllData, signOut } = useUser();
  const { tier } = useEntitlements();
  const { navigate, openUpgradeModal } = useApp();
  
  const [editingName, setEditingName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [reminderTime, setReminderTime] = useState(userProfile.settings.reminderTime);
  const [newPrompt, setNewPrompt] = useState('');

  useEffect(() => {
    setReminderTime(userProfile.settings.reminderTime);
  }, [userProfile.settings.reminderTime]);

  const handleExport = () => {
    const dataStr = JSON.stringify(userLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'femiora_data_export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear your logs and settings and cannot be undone.')) {
      await resetAllData();
      // Navigating home as a visual cue of reset, no reload needed
      navigate('home'); 
    }
  };

  const handleNameEdit = () => {
    setEditingName(userProfile.settings.name);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (editingName.trim()) {
      await updateUser({ settings: { name: editingName.trim() } });
    }
    setIsEditingName(false);
  };
  
  const handleThemeChange = (theme: Theme) => {
    updateUser({ settings: { theme: theme } });
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderTime(e.target.value);
  };

  const handleTimeBlur = () => {
    if (reminderTime !== userProfile.settings.reminderTime) {
      updateUser({ settings: { reminderTime } });
    }
  };

  const handleAddPrompt = () => {
    if (newPrompt.trim()) {
        const updatedPrompts = [...userProfile.settings.customPrompts, newPrompt.trim()];
        updateUser({ settings: { customPrompts: updatedPrompts } });
        setNewPrompt('');
    }
  };

  const handleDeletePrompt = (index: number) => {
    const updatedPrompts = userProfile.settings.customPrompts.filter((_, i) => i !== index);
    updateUser({ settings: { customPrompts: updatedPrompts } });
  };

  const handleToggleFocusArea = (id: string) => {
    const currentAreas = userProfile.settings.focusAreas || [];
    const newAreas = currentAreas.includes(id)
      ? currentAreas.filter(area => area !== id)
      : [...currentAreas, id];
    updateUser({ settings: { focusAreas: newAreas } });
  };


  const SettingRow: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
      <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-dusk-surface last:border-b-0">
          <span className="text-gray-700 dark:text-dusk-text">{label}</span>
          <div>{children}</div>
      </div>
  )

  return (
    <div className="min-h-screen bg-paper-white/80 dark:bg-dusk-bg/80 pb-24 md:pb-8">
      <header className="bg-white/80 dark:bg-dusk-surface/80 backdrop-blur-sm border-b border-gray-100 dark:border-dusk-surface sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-serif text-gray-800 dark:text-dusk-text">Profile & Settings</h1>
            <button 
                onClick={() => navigate('home')}
                className="md:hidden flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-gray-200 dark:border-dusk-text-muted/20 bg-white dark:bg-dusk-surface hover:bg-gray-50 dark:hover:bg-dusk-bg transition-colors"
            >
                <HomeIcon className="w-5 h-5 text-gray-600 dark:text-dusk-text-muted" />
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-transparent">
          <h3 className="font-serif text-lg text-gray-800 dark:text-dusk-text mb-2">Account</h3>
          <SettingRow label="Name">
             {isEditingName ? (
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                        className="w-32 text-right bg-gray-100 dark:bg-dusk-bg text-gray-700 dark:text-dusk-text rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-mist-blue"
                        autoFocus
                    />
                    <button onClick={handleNameSave} className="text-calm-sage"><CheckIcon className="w-5 h-5"/></button>
                </div>
             ) : (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-dusk-text-muted">{userProfile.settings.name}</span>
                    <button onClick={handleNameEdit} className="text-gray-400 dark:text-dusk-text-muted hover:text-calm-sage dark:hover:text-calm-sage"><Edit2Icon className="w-4 h-4"/></button>
                </div>
             )}
          </SettingRow>
          <SettingRow label="Subscription">
             <div className="flex items-center gap-4">
                <span className="font-semibold capitalize text-gray-700 dark:text-dusk-text">{tier}</span>
                 <button onClick={openUpgradeModal} className="text-sm px-3 py-1.5 rounded-full border border-calm-sage text-calm-sage hover:bg-calm-sage hover:text-white dark:hover:text-dusk-bg transition-colors">
                    {tier === 'free' ? 'Upgrade' : 'Manage'}
                </button>
             </div>
          </SettingRow>
          <SettingRow label="Account Action">
            <button onClick={signOut} className="flex items-center gap-2 text-sm text-gray-600 dark:text-dusk-text-muted hover:text-red-500 dark:hover:text-red-400 font-medium">
                <LogOutIcon className="w-4 h-4" />
                Sign Out
            </button>
          </SettingRow>
        </div>

         <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-transparent">
            <h3 className="font-serif text-lg text-gray-800 dark:text-dusk-text mb-2">Preferences</h3>
            <SettingRow label="Theme">
                <SegmentedControl 
                    options={[{label: 'Light', value: 'light'}, {label: 'Dusk', value: 'dark'}]}
                    selectedValue={userProfile.settings.theme}
                    onChange={(val) => handleThemeChange(val as Theme)}
                />
            </SettingRow>
             <SettingRow label="Daily Reminders">
                 <ToggleSwitch
                    enabled={userProfile.settings.remindersEnabled}
                    onChange={(enabled) => updateUser({ settings: { remindersEnabled: enabled }})}
                 />
            </SettingRow>
            {userProfile.settings.remindersEnabled && (
                <SettingRow label="Reminder Time">
                    <input 
                        type="time" 
                        value={reminderTime} 
                        onChange={handleTimeChange}
                        onBlur={handleTimeBlur}
                        className="bg-gray-100 dark:bg-dusk-bg text-gray-700 dark:text-dusk-text rounded-md px-2 py-1 text-sm border border-gray-200 dark:border-dusk-text-muted/20 focus:outline-none focus:ring-2 focus:ring-mist-blue"
                    />
                </SettingRow>
            )}
        </div>

        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-transparent">
            <h3 className="font-serif text-lg text-gray-800 dark:text-dusk-text mb-4">Focus Areas</h3>
            <p className="text-sm text-gray-500 dark:text-dusk-text-muted mb-4">Select the areas you're most curious about to help tailor your experience.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {focusOptions.map(option => {
                    const isSelected = userProfile.settings.focusAreas?.includes(option.id);
                    return (
                        <button
                            key={option.id}
                            onClick={() => handleToggleFocusArea(option.id)}
                            className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue ${
                                isSelected
                                ? 'border-calm-sage bg-calm-sage/10 text-calm-sage'
                                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 dark:border-dusk-bg dark:bg-dusk-bg/50 dark:hover:border-dusk-surface'
                            }`}
                        >
                            <div className={`mb-2 ${isSelected ? 'text-calm-sage' : 'text-gray-500'}`}>{option.icon}</div>
                            <span className="text-sm font-medium">{option.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>

        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-transparent">
            <h3 className="font-serif text-lg text-gray-800 dark:text-dusk-text mb-4">Custom Reflection Prompts</h3>
            <EntitlementGuard
              feature="canCustomizePrompts"
              fallback={
                 <div className="text-center bg-gradient-to-br from-soft-clay/10 to-mist-blue/10 p-6 rounded-xl">
                    <SparkleIcon className="w-8 h-8 text-soft-clay mx-auto mb-3"/>
                    <h4 className="font-semibold text-gray-800">Personalize Your Journaling</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-4">Upgrade to Premium to create your own reflection prompts that appear when you log an observation.</p>
                    <button onClick={openUpgradeModal} className="text-sm px-4 py-2 rounded-full border border-soft-clay text-soft-clay hover:bg-soft-clay hover:text-white transition-colors">Upgrade to Premium</button>
                </div>
              }
            >
                <div className="space-y-3">
                    {userProfile.settings.customPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-dusk-bg p-3 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-dusk-text">{prompt}</p>
                            <button onClick={() => handleDeletePrompt(index)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                        <input
                            type="text"
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                            placeholder="Add a new prompt..."
                             onKeyDown={(e) => e.key === 'Enter' && handleAddPrompt()}
                            className="flex-1 w-full bg-gray-100 dark:bg-dusk-bg border border-gray-200 dark:border-dusk-text-muted/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mist-blue"
                        />
                        <button onClick={handleAddPrompt} className="p-2.5 rounded-lg bg-calm-sage text-white hover:bg-opacity-90 disabled:bg-gray-300" disabled={!newPrompt.trim()}>
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </EntitlementGuard>
        </div>

        <div className="bg-white dark:bg-dusk-surface p-6 rounded-2xl shadow-soft border border-gray-100 dark:border-transparent">
          <h3 className="font-serif text-lg text-gray-800 dark:text-dusk-text mb-4">Data Management</h3>
          <div className="space-y-2">
             <button onClick={handleExport} className="w-full text-left text-gray-700 dark:text-dusk-text p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dusk-bg transition-colors">Export all data</button>
             <button onClick={handleReset} className="w-full text-left text-red-600 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Reset app and clear all data</button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ProfileView;
