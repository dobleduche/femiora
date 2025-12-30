
import React from 'react';

const FreeTierBenefits: React.FC = () => {
  const benefits = [
    {
      icon: "🔒",
      title: "End-to-end encryption",
      description: "Enterprise-grade security, always free",
      highlight: true
    },
    {
      icon: "📱",
      title: "Full mobile experience",
      description: "All features available on iOS & Android",
      highlight: true
    },
    {
      icon: "✨",
      title: "Gentle daily reminders",
      description: "Optional notifications to check in",
      highlight: false
    },
    {
      icon: "🌿",
      title: "Unlimited observations",
      description: "Log as much as you want, always",
      highlight: true
    },
    {
      icon: "📊",
      title: "30-day pattern view",
      description: "See your recent rhythms clearly",
      highlight: true
    },
    {
      icon: "💝",
      title: "No ads, ever",
      description: "We never show ads or sell your data",
      highlight: true
    }
  ];
  
  return (
    <div className="py-12 px-4 bg-gradient-to-b from-paper-white/0 to-white rounded-2xl">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif text-center text-gray-800 mb-12">
          What's included, always free
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border transition-all duration-300 ${benefit.highlight 
                ? 'border-calm-sage/30 bg-gradient-to-br from-white to-calm-sage/5 shadow-soft' 
                : 'border-gray-100 bg-white'}`}
            >
              <div className="text-3xl mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreeTierBenefits;
