
import React from 'react';
import type { UserLog, Cycle } from '../../services/api';

const MOOD_COLORS: { [key: string]: string } = {
  Happy: 'bg-green-400',
  Calm: 'bg-blue-400',
  Energetic: 'bg-yellow-400',
  Tired: 'bg-indigo-400',
  Anxious: 'bg-purple-400',
  Okay: 'bg-gray-400',
  Stressed: 'bg-red-400',
  default: 'bg-gray-100',
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MoodCalendar: React.FC<{ logs: UserLog[]; cycles: Cycle[] }> = ({ logs, cycles }) => {
  const logsByDate = React.useMemo(() => {
    const map = new Map<string, UserLog>();
    logs.forEach(log => map.set(log.date, log));
    return map;
  }, [logs]);

  const periodDays = React.useMemo(() => {
    const daySet = new Set<string>();
    cycles.forEach(cycle => {
        cycle.periodDays.forEach(day => {
            daySet.add(day);
        });
    });
    return daySet;
  }, [cycles]);

  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 59); // Show ~2 months

  const days = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const firstDayOfWeek = startDate.getDay();

  return (
    <div>
        <h3 className="font-serif text-xl text-gray-800 mb-4">Mood Overview</h3>
        <div className="flex justify-end gap-4 text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-white border border-gray-200 relative">
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                </div>
                <span>Period Day</span>
            </div>
            {Object.entries(MOOD_COLORS).filter(([key]) => key !== 'default').map(([mood, color]) => (
                <div key={mood} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${color}`}></div>
                    <span>{mood}</span>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5" style={{ gridAutoFlow: 'column', gridTemplateRows: 'repeat(9, auto)' }}>
            {WEEK_DAYS.map(day => (
                <div key={day} className="text-xs text-gray-500 font-medium text-center">{day}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
                const dateString = day.toISOString().split('T')[0];
                const log = logsByDate.get(dateString);
                const isPeriodDay = periodDays.has(dateString);
                const color = log?.mood ? MOOD_COLORS[log.mood] : 'bg-gray-100';
                
                return (
                    <div key={dateString} className="aspect-square w-full relative">
                        <div
                            className={`w-full h-full rounded-sm ${color} transition-opacity hover:opacity-70`}
                            title={`${dateString}: ${log?.mood || 'No entry'}`}
                        />
                        {isPeriodDay && (
                           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white" title="Period Day"></div>
                        )}
                    </div>
                );
            })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
            <span>{MONTHS[startDate.getMonth()]}</span>
            <span>{MONTHS[endDate.getMonth()]}</span>
        </div>
    </div>
  );
};

export default MoodCalendar;
