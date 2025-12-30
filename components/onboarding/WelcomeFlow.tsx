
import React, { useState, useEffect } from 'react';
import { FeatherIcon, LockIcon, LeafIcon, TrendingUpIcon, DropletIcon, MoonIcon, TagIcon, InfoIcon, SparkleIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';

const focusOptions = [
    { id: 'mood', label: 'Mood & Energy', icon: <TrendingUpIcon className="w-8 h-8" /> },
    { id: 'cycle', label: 'Cycle Patterns', icon: <DropletIcon className="w-8 h-8" /> },
    { id: 'sleep', label: 'Sleep Quality', icon: <MoonIcon className="w-8 h-8" /> },
    { id: 'sensations', label: 'Sensation Trends', icon: <TagIcon className="w-8 h-8" /> },
];

const WelcomeFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true); // Manages the slide-in effect
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const { user, completeOnboarding, updateUser } = useUser();
  const [name, setName] = useState(user.settings.name || '');


  // This effect triggers the "enter" animation whenever the step changes.
  useEffect(() => {
    setIsEntering(true);
    const timer = requestAnimationFrame(() => {
      setIsEntering(false);
    });
    return () => cancelAnimationFrame(timer);
  }, [step]);

  const handleToggleFocusArea = (id: string) => {
    setSelectedFocusAreas(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const steps = [
    {
      title: "Welcome to a calmer space",
      illustration: <FeatherIcon className="w-16 h-16 text-calm-sage animate-subtle-float" />,
      content: "This is Femiora. A place to notice your experience, without judgment or prediction.",
      cta: "I'm ready",
      isStepValid: true,
    },
    {
      title: "Your privacy is your power",
      illustration: <LockIcon className="w-16 h-16 text-mist-blue animate-subtle-pulse" />,
      content: "We encrypt everything. Your data never leaves your control, and we never sell it.",
      cta: "I understand",
      isStepValid: true,
    },
    {
      title: "What should we call you?",
      illustration: <LeafIcon className="w-16 h-16 text-calm-sage animate-subtle-float" />,
      content: "This helps us personalize your journey.",
      cta: "Continue",
      isStepValid: name.trim().length > 0,
    },
    {
      title: "What are you most curious about?",
      illustration: null, // Custom render for this step
      content: "Select one or more areas you'd like to focus on. This helps us personalize your journey.",
      cta: "Continue",
      isStepValid: selectedFocusAreas.length > 0,
    },
    {
      title: "A quick, important note",
      illustration: <InfoIcon className="w-16 h-16 text-gray-500" />,
      content: "Femiora is a tool for self-observation and pattern recognition. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a healthcare professional for health concerns.",
      cta: "I understand and agree",
      isStepValid: true,
    },
    {
      title: "Your journey is tailored",
      illustration: <SparkleIcon className="w-16 h-16 text-soft-clay animate-subtle-pulse" />,
      content: "We'll pay special attention to the connections between your selected areas:",
      cta: "Begin my first observation",
      isStepValid: true,
    }
  ];

  const handleNext = async () => {
    // If it's the name step, save the data
    if (step === 2) {
      await updateUser({ settings: { name: name.trim() } });
    }
    // If it's the focus step, save the data
    if (step === 3) {
      await updateUser({ settings: { focusAreas: selectedFocusAreas } });
    }

    setExiting(true);
    setTimeout(() => {
      if (step === steps.length - 1) {
        completeOnboarding();
      } else {
        setStep(prev => prev + 1);
        setExiting(false);
      }
    }, 400); // Wait for the exit animation to complete
  };
  
  const currentStep = steps[step];

  const animationClass = exiting
    ? 'opacity-0 -translate-y-8' // Exiting: fade out and slide up
    : isEntering
    ? 'opacity-0 translate-y-8' // Entering: start transparent and below
    : 'opacity-100 translate-y-0'; // Idle: fully visible
    
  const selectedFocusLabels = selectedFocusAreas.map(id => focusOptions.find(opt => opt.id)?.label);

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-white to-dawn-pink flex flex-col justify-center">
      <div className="max-w-md mx-auto py-12 px-4 w-full">
        <div 
          key={step} 
          className={`text-center transition-all duration-400 ease-in-out ${animationClass}`}
        >
          {currentStep.illustration && <div className="mb-8 inline-block">{currentStep.illustration}</div>}
          
          <h1 className="text-3xl font-serif text-gray-800 mb-4">
            {currentStep.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {currentStep.content}
          </p>
          
          {step === 2 && (
             <div className="mb-8">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && name.trim().length > 0 && handleNext()}
                    placeholder="Your name or nickname"
                    className="w-full text-center px-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mist-blue text-lg"
                    autoFocus
                />
             </div>
          )}

          {step === 3 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                  {focusOptions.map(option => {
                      const isSelected = selectedFocusAreas.includes(option.id);
                      return (
                          <button
                              key={option.id}
                              onClick={() => handleToggleFocusArea(option.id)}
                              className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mist-blue ${
                                  isSelected
                                  ? 'border-calm-sage bg-calm-sage/10 text-calm-sage'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                          >
                              <div className="mb-2">{option.icon}</div>
                              <span className="text-sm font-medium">{option.label}</span>
                          </button>
                      )
                  })}
              </div>
          )}
          
          {step === 5 && (
            <div className="mb-8 space-y-2">
              {selectedFocusLabels.map(label => (
                <div key={label} className="bg-white/50 text-calm-sage font-medium px-4 py-2 rounded-full inline-block mx-1">
                  {label}
                </div>
              ))}
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
        
        {/* Progress indicator */}
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
