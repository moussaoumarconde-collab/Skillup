import React from 'react';
import { Star } from 'lucide-react';

interface RankingChartProps {
  className?: string;
}

export const RankingChart: React.FC<RankingChartProps> = ({ className = '' }) => {
  // 5 vertical bars with progressive heights matching the screenshot
  const bars = [
    { height: '18%' },
    { height: '34%' },
    { height: '52%' },
    { height: '72%' },
    { height: '94%', hasStar: true },
  ];

  return (
    <div className={`flex items-end gap-1.5 h-16 w-28 justify-end relative ${className}`}>
      {bars.map((bar, index) => (
        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
          {bar.hasStar && (
            <Star
              className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mb-1 animate-pulse"
              strokeWidth={1.5}
            />
          )}
          <div
            className="w-full bg-[#C4B5FD] rounded-t-md transition-all duration-500"
            style={{ height: bar.height }}
          />
        </div>
      ))}
    </div>
  );
};
