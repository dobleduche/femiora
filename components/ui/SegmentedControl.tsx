
import React from 'react';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  selectedValue: T;
  onChange: (value: T) => void;
}

const SegmentedControl = <T extends string>({ options, selectedValue, onChange }: SegmentedControlProps<T>) => {
  return (
    <div className="relative flex w-full max-w-sm mx-auto bg-gray-100 dark:bg-dusk-bg rounded-full p-1">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative flex-1 py-2 text-sm font-medium transition-colors rounded-full z-10
            ${selectedValue === option.value ? 'text-gray-800 dark:text-dusk-text' : 'text-gray-500 dark:text-dusk-text-muted hover:text-gray-700 dark:hover:text-dusk-text'}`
          }
        >
          {option.label}
        </button>
      ))}
      <div
        className="absolute top-1 h-[calc(100%-8px)] bg-white dark:bg-dusk-surface rounded-full shadow-md transition-transform duration-300 ease-in-out"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${options.findIndex(o => o.value === selectedValue) * 100}%)`,
        }}
      />
    </div>
  );
};

export default SegmentedControl;
