import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { trackEvent } from '../../utils/analytics';

const WelcomeFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'write' | 'observe' | ''>('');
  const [entryText, setEntryText] = useState('');
  const [showExitCta, setShowExitCta] = useState(false);
  const { completeOnboarding, updateUser, saveLog } = useUser();

  useEffect(() => {
    setIsEntering(true);
    const timer = requestAnimationFrame(() => {
      setIsEntering(false);
    });
    return () => cancelAnimationFrame(timer);
  }, [step]);

  useEffect(() => {
    if (step === 0) trackEvent('onboarding_view_arrival');
    if (step === 1) trackEvent('onboarding_view_reframe');
    if (step === 3) trackEvent('onboarding_introduce_ora');
  }, [step]);

  useEffect(() => {
    if (step === 5) {
      setShowExitCta(false);
      const timer = setTimeout(() => setShowExitCta(true), 500);
      return () => clearTimeout(timer);
    }
    setShowExitCta(true);
    return undefined;
  }, [step]);

  const steps = [
    {
      id: 'arrival',
      headline: 'You don’t have to track anything perfectly here.',
      cta: 'Continue',
      isStepValid: true,
    },
    {
      id: 'reframe',
      headline: (
        <>
          <span className="block">Femiora notices patterns over time.</span>
          <span className="block">Even when you forget.</span>
          <span className="block">Even when you’re not sure.</span>
        </>
      ),
      cta: 'Continue',
      isStepValid: true,
    },
    {
      id: 'agency',
      headline: 'How do you want to be here today?',
      cta: 'Continue',
      isStepValid: selectedMode.length > 0,
    },
    {
      id: 'ora',
      headline: 'This is Ora.',
      subtext: (
        <>
          <span className="block">She doesn’t correct you.</span>
          <span className="block">She notices what returns.</span>
        </>
      ),
      cta: 'Continue',
      isStepValid: true,
    },
    {
      id: 'first-entry',
      headline: 'Anything you want to leave here today.',
      cta: entryText.trim().length > 0 ? 'Leave it here' : 'Continue',
      isStepValid: true,
    },
    {
      id: 'exit',
      headline: 'There’s nothing to keep up with.',
      cta: 'Enter Femiora',
      isStepValid: true,
    },
  ];

  const handleSelectMode = async (mode: 'write' | 'observe') => {
    setSelectedMode(mode);
    trackEvent('onboarding_preference_selected', { mode });
    await updateUser({ settings: { onboardingIntent: mode } });
  };

  const handleNext = async () => {
    if (step === 4) {
      const trimmed = entryText.trim();
      if (trimmed.length > 0) {
        await saveLog({ note: trimmed });
        const lengthBucket =
          trimmed.length <= 50 ? 'short' : trimmed.length <= 200 ? 'medium' : 'long';
        trackEvent('first_entry_created', { length_bucket: lengthBucket });
      } else {
        trackEvent('first_entry_skipped');
      }
    }

    setExiting(true);
    setTimeout(() => {
      if (step === steps.length - 1) {
        trackEvent('onboarding_complete');
        completeOnboarding();
      } else {
        setStep((prev) => prev + 1);
        setExiting(false);
      }
    }, 400);
  };

  const currentStep = steps[step];

  const animationClass = exiting
    ? 'opacity-0 -translate-y-8'
    : isEntering
    ? 'opacity-0 translate-y-8'
    : 'opacity-100 translate-y-0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-sand to-calm-teal flex flex-col justify-center">
      <div className="max-w-xl mx-auto py-12 px-4 w-full">
        <div
          key={step}
          className={`text-center transition-all duration-400 ease-in-out ${animationClass}`}
        >
          <h1 className="text-2xl sm:text-3xl font-serif text-gray-800 mb-4">
            {currentStep.headline}
          </h1>
          {currentStep.subtext && (
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              {currentStep.subtext}
            </p>
          )}

          {step === 2 && (
            <div className="space-y-3 mb-8">
              {[
                {
                  id: 'write',
                  label: 'I want to write when something comes up.',
                },
                {
                  id: 'observe',
                  label: 'I just want to observe quietly for now.',
                },
              ].map((option) => {
                const isSelected = selectedMode === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectMode(option.id as 'write' | 'observe')}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue ${
                      isSelected
                        ? 'border-calm-sage bg-white/70 shadow-soft'
                        : 'border-white/60 bg-white/40 hover:border-white'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="mb-8">
              <textarea
                value={entryText}
                onChange={(event) => setEntryText(event.target.value)}
                className="w-full min-h-[140px] rounded-2xl border-2 border-white/70 bg-white/60 p-4 text-sm text-gray-800 shadow-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue"
              />
            </div>
          )}

          {step !== 5 && (
            <button
              onClick={handleNext}
              disabled={!currentStep.isStepValid}
              className="w-full py-4 px-6 bg-calm-sage text-white rounded-full 
                         hover:bg-opacity-90 transition-all transform hover:-translate-y-1
                         shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue
                         disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
            >
              {currentStep.cta}
            </button>
          )}

          {step === 5 && (
            <div className="min-h-[64px] flex items-center justify-center">
              {showExitCta && (
                <button
                  onClick={handleNext}
                  disabled={!currentStep.isStepValid}
                  className="w-full py-4 px-6 bg-calm-sage text-white rounded-full 
                             hover:bg-opacity-90 transition-all transform hover:-translate-y-1
                             shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue
                             disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                >
                  {currentStep.cta}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeFlow;
