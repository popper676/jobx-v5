import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DeadlineCountdownProps {
  deadline: string; // ISO date string
  status?: string;
  employerResponded?: boolean;
}

export default function DeadlineCountdown({ deadline, status, employerResponded }: DeadlineCountdownProps) {
  if (employerResponded) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Responded
      </div>
    );
  }

  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diffMs = target - now;
  
  if (status === 'Expired' || diffMs <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertCircle className="w-3.5 h-3.5" />
        Expired
      </div>
    );
  }

  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  let colorClass = 'bg-green-50 text-green-700 border-green-200';
  if (daysLeft <= 3) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      <Clock className="w-3.5 h-3.5" />
      {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left to respond
    </div>
  );
}
