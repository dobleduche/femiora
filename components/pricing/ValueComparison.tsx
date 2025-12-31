
import React from 'react';
import { ArrowRightIcon } from '../icons/Icons';
import { useApp } from '../../contexts/AppContext';

const ValueComparison: React.FC = () => {
  const { openUpgradeModal } = useApp();

  const comparisons = [
    {
      item: "Weekly wellness class",
      cost: "$30",
      femiora: "1 month of Premium",
      saving: "Save $8"
    },
    {
      item: "Monthly specialty coffee habit",
      cost: "$50",
      femiora: "2+ months of Core",
      saving: "Save $28"
    },
    {
      item: "Annual gym membership",
      cost: "$600",
      femiora: "2+ years of Premium",
      saving: "Save $72"
    }
  ];
  
  return (
    <div className="bg-gradient-to-b from-paper-white/0 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h3 className="text-2xl font-serif text-center text-gray-800 mb-8">
          Compare the value
        </h3>
        
        <div className="space-y-4">
          {comparisons.map((comp, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 shadow-soft hover:border-calm-sage/30 transition-all duration-300">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{comp.item}</div>
                <div className="text-sm text-gray-500 line-through">{comp.cost}</div>
              </div>
              
              <ArrowRightIcon className="w-5 h-5 text-gray-300 mx-4 shrink-0" />
              
              <div className="text-right flex-1">
                <div className="font-medium text-calm-sage">{comp.femiora}</div>
                <div className="text-sm text-green-600 font-medium">{comp.saving}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Invest in understanding your experience
          </p>
          <button 
            onClick={openUpgradeModal}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-calm-sage to-mist-blue text-white rounded-full font-medium hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            Start my Femiora journey →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValueComparison;
