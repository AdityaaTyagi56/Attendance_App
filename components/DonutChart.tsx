import React from 'react';

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
  strokeWidth?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 160, strokeWidth = 16 }) => {
  const halfsize = size / 2;
  const radius = halfsize - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-on-surface-variant dark:text-on-surface-dark-variant">No distribution data available.</p>
        </div>
    );
  }

  // This logic creates stacked segments by drawing larger circles behind smaller ones.
  // We process the data from "critical" up to "perfect" to calculate the cumulative size of each ring.
  const reversedData = [...data].reverse();
  
  let cumulativeValue = 0;
  const segments = reversedData.map(item => {
    cumulativeValue += item.value;
    const percent = (cumulativeValue / total) * 100;
    const dashoffset = circumference * (1 - percent / 100);
    return { ...item, dashoffset };
  }).reverse(); // Reverse back so the largest circle (Perfect) is drawn first at the bottom of the SVG stack.


  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            r={radius}
            cx={halfsize}
            cy={halfsize}
            strokeWidth={strokeWidth}
            fill="none"
            className="stroke-black/5 dark:stroke-white/5"
          />
          {segments.map((segment, index) => (
            <circle
              key={index}
              r={radius}
              cx={halfsize}
              cy={halfsize}
              strokeWidth={strokeWidth}
              fill="none"
              stroke={segment.color}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={segment.dashoffset}
              className="transition-all duration-1000 ease-out"
            />
          ))}
        </svg>
      </div>
      <div className="flex flex-col space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="text-sm text-on-surface dark:text-on-surface-dark">
              {item.label}: <span className="font-bold">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;