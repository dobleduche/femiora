
import React, { useMemo } from 'react';
import type { Cycle } from '../../services/api';
import { DropletIcon, CalendarIcon } from '../icons/Icons';

const CycleHistoryChart: React.FC<{ cycles: Cycle[] }> = ({ cycles }) => {
  if (cycles.length < 2) {
    return (
      <div className="text-center text-gray-500 py-10 flex flex-col items-center">
        <DropletIcon className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-medium text-gray-700">Not enough cycle data yet.</p>
        <p className="text-sm mt-1">Log your period for a couple of cycles to see your history here.</p>
      </div>
    );
  }

  // Calculate stats
  const cycleLengths = cycles.slice(0, -1).map((cycle, index) => {
    const nextCycle = cycles[index + 1];
    const startDate = new Date(cycle.startDate);
    const nextStartDate = new Date(nextCycle.startDate);
    const diffTime = Math.abs(nextStartDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  const avgCycleLength = cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : 'N/A';
  const periodLengths = cycles.map(c => c.periodDays.length);
  const avgPeriodLength = periodLengths.length > 0 ? (periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length).toFixed(1) : 'N/A';

  const predictedNextStartDate = useMemo(() => {
    if (cycles.length < 2 || typeof avgCycleLength !== 'number') return null;
    
    const lastCycle = cycles[cycles.length - 1];
    // IMPORTANT: Create a new Date object from parts to avoid timezone issues.
    const lastStartDateParts = lastCycle.startDate.split('-').map(Number);
    const lastStartDate = new Date(lastStartDateParts[0], lastStartDateParts[1] - 1, lastStartDateParts[2]);

    const predictedDate = new Date(lastStartDate);
    predictedDate.setDate(predictedDate.getDate() + avgCycleLength);
    
    return predictedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }, [cycles, avgCycleLength]);


  const last5Cycles = cycles.slice(-5).reverse();

  const getCycleLength = (cycleId: string) => {
      const cycleIndex = cycles.findIndex(c => c.id === cycleId);
      if (cycleIndex < 0 || cycleIndex === cycles.length - 1) {
          return null; // It's the last (ongoing) cycle
      }
      const nextCycle = cycles[cycleIndex + 1];
      const startDate = new Date(cycles[cycleIndex].startDate);
      const nextStartDate = new Date(nextCycle.startDate);
      const diffTime = Math.abs(nextStartDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }


  return (
    <div>
      <h3 className="font-serif text-xl text-gray-800 mb-6">Cycle History</h3>
      <div className="grid grid-cols-2 gap-4 mb-8 text-center">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-calm-sage">{avgCycleLength}</div>
          <div className="text-xs text-gray-500">Avg. Cycle Length (days)</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-soft-clay">{avgPeriodLength}</div>
          <div className="text-xs text-gray-500">Avg. Period Length (days)</div>
        </div>
      </div>

      {predictedNextStartDate && (
        <div className="mb-8 p-4 rounded-xl bg-mist-blue/10 border-2 border-dashed border-mist-blue/20 text-center flex flex-col items-center">
            <CalendarIcon className="w-6 h-6 text-mist-blue mb-2" />
            <p className="text-sm font-medium text-gray-700">Predicted Next Period</p>
            <p className="text-2xl font-bold text-mist-blue">{predictedNextStartDate}</p>
            <p className="text-xs text-gray-500 mt-1">This is an estimate based on your average cycle length.</p>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Recent Cycles</h4>
        {last5Cycles.map((cycle) => {
          const cycleLength = getCycleLength(cycle.id);
          const displayCycleLength = cycleLength ? `${cycleLength} day cycle` : 'In Progress';
          const barWidthPercentage = cycleLength ? (cycle.periodDays.length / cycleLength) * 100 : (cycle.periodDays.length / 28) * 100; // Assume 28 for progress bar

          return (
            <div key={cycle.id}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-gray-700">
                  {new Date(cycle.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-gray-500">{displayCycleLength}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-5 relative" title={`Period: ${cycle.periodDays.length} days`}>
                <div
                  className="bg-soft-clay/80 rounded-full h-5"
                  style={{ width: `${barWidthPercentage}%` }}
                />
                <div className="absolute inset-0 px-2 flex items-center text-xs font-bold text-white">
                  {cycle.periodDays.length} days
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default CycleHistoryChart;