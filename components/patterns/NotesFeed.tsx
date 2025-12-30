
import React from 'react';
import type { UserLog } from '../../services/api';

const NotesFeed: React.FC<{ logs: UserLog[] }> = ({ logs }) => {
  const noteLogs = React.useMemo(() => logs.filter(log => log.note).reverse(), [logs]);

  if (noteLogs.length === 0) {
    return <div className="text-center text-gray-500 py-10">You haven't written any notes yet.</div>;
  }

  return (
    <div>
      <h3 className="font-serif text-xl text-gray-800 mb-4">Your Observations</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {noteLogs.map(log => (
          <div key={log.date} className="pb-4 border-b border-gray-100 last:border-b-0">
            <p className="text-sm font-medium text-gray-500 mb-1">
              {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">{log.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesFeed;