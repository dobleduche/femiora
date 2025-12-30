
import React from 'react';

export interface ChartData {
    type: 'bar' | 'line';
    labels: string[];
    datasets: {
        label: string;
        data: number[];
    }[];
}

interface SimpleChartProps {
    data: ChartData;
}

const COLORS = ['#9CAF8F', '#D4A574', '#8CA0B8'];

const SimpleChart: React.FC<SimpleChartProps> = ({ data }) => {
    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 30 };

    const maxVal = Math.max(...data.datasets.flatMap(d => d.data), 0);
    const chartHeight = height - padding.top - padding.bottom;
    const chartWidth = width - padding.left - padding.right;

    const yScale = (val: number) => chartHeight - (val / maxVal) * chartHeight;

    // Y-axis grid lines and labels
    const yAxis = () => {
        const ticks = 5;
        return Array.from({ length: ticks + 1 }).map((_, i) => {
            const val = (maxVal / ticks) * i;
            const y = padding.top + yScale(val);
            return (
                <g key={i}>
                    <text x={padding.left - 5} y={y + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{val.toFixed(0)}</text>
                    <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2"/>
                </g>
            );
        });
    };

    // X-axis labels
    const xAxis = () => {
        return data.labels.map((label, i) => {
            const x = padding.left + (i / (data.labels.length - 1)) * chartWidth;
            return (
                <text key={label} x={x} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="#6b7280">
                    {label}
                </text>
            );
        });
    };

    const renderChart = () => {
        if (data.type === 'line') {
            return data.datasets.map((dataset, dIdx) => {
                const points = dataset.data.map((val, i) => {
                    const x = padding.left + (i / (dataset.data.length - 1)) * chartWidth;
                    const y = padding.top + yScale(val);
                    return `${x},${y}`;
                }).join(' ');

                return (
                    <g key={dataset.label}>
                        <polyline
                            fill="none"
                            stroke={COLORS[dIdx % COLORS.length]}
                            strokeWidth="2"
                            points={points}
                        />
                        {dataset.data.map((val, i) => {
                            const x = padding.left + (i / (dataset.data.length - 1)) * chartWidth;
                            const y = padding.top + yScale(val);
                            return <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={COLORS[dIdx % COLORS.length]} strokeWidth="1.5" />;
                        })}
                    </g>
                );
            });
        }
        if (data.type === 'bar') {
             const barWidth = (chartWidth / data.labels.length) * 0.6;
             return data.labels.map((label, i) => {
                 return data.datasets.map((dataset, dIdx) => {
                    const val = dataset.data[i] || 0;
                    const x = padding.left + (i / data.labels.length) * chartWidth + ((chartWidth / data.labels.length) * 0.2);
                    const y = padding.top + yScale(val);
                    const barHeight = chartHeight - yScale(val);

                    return (
                        <rect 
                            key={`${label}-${dIdx}`}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight > 0 ? barHeight : 0}
                            fill={COLORS[dIdx % COLORS.length]}
                        />
                    );
                 })
             });
        }
        return null;
    };


    return (
        <div>
            <h2 className="font-serif text-lg text-gray-800 mb-4">Analysis Result</h2>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {yAxis()}
                {xAxis()}
                {renderChart()}
            </svg>
            <div className="flex justify-center gap-4 text-xs text-gray-600 mt-2">
                {data.datasets.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span>{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleChart;
