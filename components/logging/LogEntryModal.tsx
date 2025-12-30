
import React, { useState, useEffect, useMemo } from 'react';
import { CloseIcon, MoonIcon, DropletIcon, CheckIcon } from '../icons/Icons';
import type { DailyLog, Sensation } from '../../services/api';
import { sensations as sensationList } from '../../services/api';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

const moods: { emoji: string; label: DailyLog['mood'] }[] = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '⚡️', label: 'Energetic' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😟', label: 'Anxious' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😖', label: 'Stressed' },
];

const defaultPrompts = [
    "What's one thing you noticed in your body today?",
    "Was there a moment of peace or ease today?",
    "What supported your energy today?",
    "Any particular craving or aversion you noticed?",
    "How did your sleep last night show up in your day?",
    "Is there anything you're leaving behind from today?",
    "What was the emotional texture of your day?",
];

const LogEntryModal: React.FC = () => {
  const { user, logs, cycles, saveLog, logPeriodDay, removePeriodDay } = useUser();
  const { isLogModalOpen, closeLogModal } = useApp();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const isPeriodInitiallyLogged = useMemo(() => {
    return cycles.some(cycle => cycle.periodDays.includes(todayStr));
  }, [cycles, todayStr, isLogModalOpen]);


  const initialLog = useMemo(() => {
    return logs.find(log => log.date === todayStr) || {};
  }, [logs, todayStr, isLogModalOpen]);

  const [mood, setMood] = useState(initialLog.mood);
  const [sleep, setSleep] = useState<number | undefined>(initialLog.sleep);
  const [note, setNote] = useState<string | undefined>(initialLog.note);
  const [sensations, setSensations] = useState<Sensation[]>(initialLog.sensations as Sensation[] || []);
  const [isPeriodLogged, setIsPeriodLogged] = useState(isPeriodInitiallyLogged);
  
  const dailyPrompt = useMemo(() => {
    const customPrompts = user.settings.customPrompts;
    if (customPrompts && customPrompts.length > 0) {
        return customPrompts[Math.floor(Math.random() * customPrompts.length)];
    }
    // Provide a default rotating prompt for everyone
    const dayOfMonth = new Date().getDate();
    return defaultPrompts[dayOfMonth % defaultPrompts.length];
  }, [user.settings.customPrompts, isLogModalOpen]); // Reroll prompt when modal opens

  useEffect(() => {
    setMood(initialLog.mood);
    setSleep(initialLog.sleep);
    setNote(initialLog.note);
    setSensations(initialLog.sensations as Sensation[] || []);
    setIsPeriodLogged(isPeriodInitiallyLogged);
  }, [initialLog, isPeriodInitiallyLogged]);

  if (!isLogModalOpen) {
    return null;
  }

  const handleSave = async () => {
    triggerHapticFeedback('success');
    // Save core log data
    await saveLog({ mood, sleep, note, sensations });
    
    // Handle cycle data if it has changed
    if (isPeriodLogged && !isPeriodInitiallyLogged) {
      await logPeriodDay(todayStr);
    } else if (!isPeriodLogged && isPeriodInitiallyLogged) {
      await removePeriodDay(todayStr);
    }

    closeLogModal();
  };
  
  const handleMoodSelect = (label: DailyLog['mood']) => {
    setMood(label);
    triggerHapticFeedback('medium');
  };
  
  const handleSleepSelect = (rating: number) => {
    setSleep(rating);
    triggerHapticFeedback('medium');
  }

  const handleSensationToggle = (sensation: Sensation) => {
    triggerHapticFeedback('light');
    setSensations(prev => 
      prev.includes(sensation) ? prev.filter(s => s !== sensation) : [...prev, sensation]
    );
  };
  
  const handlePeriodToggle = () => {
    triggerHapticFeedback('light');
    setIsPeriodLogged(prev => !prev);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-feather-fall" onClick={closeLogModal}>
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-serif text-gray-800">Today's Observation</h2>
          <button onClick={closeLogModal} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Mood Logger */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">How are you feeling?</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {moods.map(({ emoji, label }) => (
                <button
                  key={label}
                  onClick={() => handleMoodSelect(label)}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                    mood === label ? 'border-calm-sage bg-calm-sage/10' : 'border-transparent bg-gray-100 hover:bg-gray-200/70'
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-xs text-gray-600 mt-1">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sensation Logger */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Any sensations?</label>
            <div className="flex flex-wrap gap-2">
              {sensationList.map(sensation => (
                <button
                  key={sensation}
                  onClick={() => handleSensationToggle(sensation)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    sensations.includes(sensation)
                      ? 'bg-soft-clay/20 border-soft-clay text-soft-clay-darker font-medium'
                      : 'bg-gray-100 border-gray-100 text-gray-600 hover:bg-gray-200/70'
                  }`}
                >
                  {sensation}
                </button>
              ))}
            </div>
          </div>
          
           {/* Cycle Logger */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Cycle</label>
            <button
              onClick={handlePeriodToggle}
              className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                isPeriodLogged
                  ? 'border-soft-clay bg-soft-clay/10 text-soft-clay-darker font-medium'
                  : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200/70'
              }`}
            >
              {isPeriodLogged ? <CheckIcon className="w-5 h-5" /> : <DropletIcon className="w-5 h-5" />}
              {isPeriodLogged ? 'Period Logged' : 'Log Period Day'}
            </button>
          </div>

          {/* Sleep Logger */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">How did you sleep?</label>
            <div className="flex justify-around items-center bg-gray-100 rounded-lg p-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button key={rating} onClick={() => handleSleepSelect(rating)}>
                  <MoonIcon
                    className={`w-8 h-8 transition-colors ${
                      sleep && rating <= sleep ? 'text-mist-blue fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Note Logger */}
          <div>
            <label htmlFor="note-input" className="text-sm font-medium text-gray-700 mb-2 block">
              {dailyPrompt}
            </label>
            <textarea
              id="note-input"
              value={note || ''}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder="e.g., felt a headache after lunch, had a nice walk..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mist-blue focus:border-mist-blue transition-colors text-gray-700"
            ></textarea>
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="w-full py-3 px-6 bg-calm-sage text-white rounded-full font-medium
                       hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5
                       shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue"
          >
            Save Observation
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogEntryModal;
