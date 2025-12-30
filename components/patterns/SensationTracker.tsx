
import React, { useMemo } from 'react';
import type { UserLog, Sensation } from '../../services/api';
import { TagIcon } from '../icons/Icons';

const SensationTracker: React.FC<{ logs: UserLog[] }> = ({ logs }) => {
  const sensationCounts = useMemo(() => {
    const counts = new Map<Sensation, number>();
    logs.forEach(log => {
      log.sensations?.forEach(sensation => {
        counts.set(sensation, (counts.get(sensation) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  if (sensationCounts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10 flex flex-col items-center">
        <TagIcon className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-medium text-gray-700">No sensations logged in this period.</p>
        <p className="text-sm mt-1">Tap the '+' button to add an observation.</p>
      </div>
    );
  }

  const maxCount = Math.max(...sensationCounts.map(([, count]) => count), 1);

  return (
    <div>
      <h3 className="font-serif text-xl text-gray-800 mb-6">Sensation Frequency</h3>
      <div className="space-y-4">
        {sensationCounts.map(([sensation, count]) => (
          <div key={sensation} className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm font-medium text-gray-700 text-right">{sensation}</span>
            <div className="col-span-2 flex items-center">
              <div className="w-full bg-gray-100 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-soft-clay/80 to-soft-clay rounded-full h-6 flex items-center justify-start pl-3"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                >
                   <span className="text-xs font-bold text-white">{count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensationTracker;
