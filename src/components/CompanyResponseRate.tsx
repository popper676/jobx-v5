import React from 'react';
import { Activity } from 'lucide-react';

interface CompanyResponseRateProps {
  rate: number; // 0-100
}

export default function CompanyResponseRate({ rate }: CompanyResponseRateProps) {
  let colorClass = 'bg-green-500';
  let textClass = 'text-green-700';
  let bgClass = 'bg-green-50 border-green-200';
  
  if (rate < 50) {
    colorClass = 'bg-red-500';
    textClass = 'text-red-700';
    bgClass = 'bg-red-50 border-red-200';
  } else if (rate < 80) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-700';
    bgClass = 'bg-amber-50 border-amber-200';
  }

  return (
    <div className={`flex flex-col gap-2 p-4 rounded-2xl border ${bgClass}`}>
      <div className="flex items-center gap-2">
        <Activity className={`w-5 h-5 ${textClass}`} />
        <h3 className={`text-sm font-bold ${textClass}`}>Response Rate</h3>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} rounded-full transition-all duration-1000`}
            style={{ width: `${rate}%` }}
          />
        </div>
        <span className={`text-sm font-bold ${textClass}`}>{rate}%</span>
      </div>
      
      <p className={`text-xs font-medium ${textClass} opacity-80`}>
        This company responds to {rate}% of applications within 7 days.
      </p>
    </div>
  );
}
