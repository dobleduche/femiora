import React, { useState, useEffect } from 'react';
import {
  FeatherIcon,
  LockIcon,
  LeafIcon,
  TrendingUpIcon,
  DropletIcon,
  MoonIcon,
  TagIcon,
  SparkleIcon,
} from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';

const intentOptions = [
  { id: 'changes', label: "I'm noticing changes in how I feel" },
  { id: 'rhythms', label: 'I want to understand my personal rhythms' },
  { id: 'different', label: "I feel different lately — not sure why" },
  { id: 'curious', label: "I'm just curious about my patterns" },
  { id: 'returning', label: "I've been here before — back to reflect" },
];

const focusOptions = [
  {
    id: 'energy',
    label: 'Energy levels throughout the day',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <TrendingUpIcon className="w-7 h-7" />,
  },
  {
    id: 'mood',
    label: 'Mood tone — light, heavy, calm, tense',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <FeatherIcon className="w-7 h-7" />,
  },
  {
    id: 'sleep',
    label: 'Sleep quality and restfulness',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <MoonIcon className="w-7 h-7" />,
  },
  {
    id: 'focus',
    label: 'Focus and mental clarity',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <SparkleIcon className="w-7 h-7" />,
  },
  {
    id: 'temperature',
    label: 'Body temperature sensations (warm, cool, flushed)',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <TagIcon className="w-7 h-7" />,
  },
  {
    id: 'stress',
    label: 'Stress pressure or ease',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <LockIcon className="w-7 h-7" />,
  },
  {
    id: 'motivation',
    label: 'Motivation — what moves you?',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <LeafIcon className="w-7 h-7" />,
  },
  {
    id: 'appetite',
    label: 'Appetite shifts — hunger, cravings, satisfaction',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <TagIcon className="w-7 h-7" />,
  },
  {
    id: 'cycles',
    label: 'Personal cadence — recurring phases in your rhythm',
    description: 'This helps Femiora surface patterns — never diagnose.',
    icon: <DropletIcon className="w-7 h-7" />,
  },
];

const WelcomeFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [selectedIntent, setSelectedIntent] = useState('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const { completeOnboarding, updateUser } = useUser();

  useEffect(() => {
    setIsEntering(true);
    const timer = requestAnimationFrame(() => {
      setIsEntering(false);
    });
    return () => cancelAnimationFrame(timer);
  }, [step]);

  const handleToggleFocusArea = (id: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const steps = [
    {
      title: 'Why are you here?',
      content: 'What brought you to Femiora today?',
      cta: 'Continue',
      isStepValid: selectedIntent.length > 0,
    },
    {
      title: 'What would you like to gently observe?',
      content: 'You can adjust this anytime.',
      cta: 'Continue',
      isStepValid: selectedFocusAreas.length > 0,
    },
    {
      title: 'Before we begin: Femiora is not medical advice.',
      content:
        "You’re here to reflect, not to be diagnosed. Your notes belong to you. Insights are observations — not prescriptions. If you ever need clinical support, we’ll gently guide you there.",
      cta: 'I understand — let’s begin.',
      isStepValid: true,
    },
  ];

  const handleNext = async () => {
    if (step === 0) {
      await updateUser({ settings: { onboardingIntent: selectedIntent } });
    }
    if (step === 1) {
      await updateUser({ settings: { focusAreas: selectedFocusAreas } });
    }

    setExiting(true);
    setTimeout(() => {
      if (step === steps.length - 1) {
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
          <h1 className="text-3xl font-serif text-gray-800 mb-4">
            {currentStep.title}
          </h1>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            {currentStep.content}
          </p>

          {step === 0 && (
            <div className="space-y-3 mb-8">
              {intentOptions.map((option) => {
                const isSelected = selectedIntent === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedIntent(option.id)}
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

          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {focusOptions.map((option) => {
                const isSelected = selectedFocusAreas.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleToggleFocusArea(option.id)}
                    className={`flex flex-col items-start text-left p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue ${
                      isSelected
                        ? 'border-calm-sage bg-white/80 shadow-soft'
                        : 'border-white/60 bg-white/40 hover:border-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2 text-calm-sage">
                      {option.icon}
                      <span className="text-sm font-medium text-gray-800">
                        {option.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

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
        </div>

        <div className="flex justify-center mt-12 space-x-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === step ? 'bg-calm-sage w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeFlow;
