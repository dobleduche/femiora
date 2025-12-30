
import React from 'react';
import type { UserLog } from '../../services/api';

const SleepChart: React.FC<{ logs: UserLog[] }> = ({ logs }) => {
  const sleepLogs = React.useMemo(() => logs.filter(log => log.sleep !== undefined && log.sleep !== null), [logs]);

  if (sleepLogs.length < 2) {
    return <div className="text-center text-gray-500 py-10">Not enough sleep data to draw a chart.</div>;
  }
  
  const width = 500;
  const height = 150;
  const padding = 20;

  const points = sleepLogs.map((log, i) => {
    const x = (i / (sleepLogs.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((log.sleep! - 1) / 4) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const firstLogDate = new Date(sleepLogs[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastLogDate = new Date(sleepLogs[sleepLogs.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div>
        <h3 className="font-serif text-xl text-gray-800 mb-4">Sleep Quality Trend</h3>
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-axis labels and grid lines */}
                {[...Array(5)].map((_, i) => {
                    const y = height - padding - (i / 4) * (height - padding * 2);
                    return (
                        <g key={i}>
                            <text x={padding - 10} y={y + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{5 - i}</text>
                            <line x1={padding} y1={y} x2={width-padding} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2"/>
                        </g>
                    )
                })}
                <text x={padding - 10} y={padding-5} textAnchor="end" fontSize="8" fill="#9ca3af">Good</text>
                <text x={padding - 10} y={height-padding+10} textAnchor="end" fontSize="8" fill="#9ca3af">Poor</text>

                {/* Line chart */}
                <polyline
                    fill="none"
                    stroke="url(#sleepGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
                
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="sleepGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8CA0B8" />
                        <stop offset="100%" stopColor="#9CAF8F" />
                    </linearGradient>
                </defs>

                 {/* Circles for data points */}
                {sleepLogs.map((log, i) => {
                    const x = (i / (sleepLogs.length - 1)) * (width - padding * 2) + padding;
                    const y = height - padding - ((log.sleep! - 1) / 4) * (height - padding * 2);
                    return <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#9CAF8F" strokeWidth="1.5" />;
                })}
            </svg>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>{firstLogDate}</span>
                <span>{lastLogDate}</span>
            </div>
        </div>
    </div>
  );
};

export default SleepChart;