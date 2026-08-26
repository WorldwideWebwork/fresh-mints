import React from 'react';
import { OutreachStatus } from '../../types/lead';

interface StatusIndicatorProps {
  status: OutreachStatus;
  showText?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, showText = true }) => {
  const statusConfig: Record<OutreachStatus, { label: string; dotColor: string; textColor: string; bg: string }> = {
    Uncontacted: { label: 'Discovered', dotColor: 'bg-slate-400', textColor: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
    'Skip Traced': { label: 'Skip Traced', dotColor: 'bg-sky-500', textColor: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
    'Site Built': { label: 'Site Built', dotColor: 'bg-indigo-500', textColor: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    'Outreach Sent': { label: 'Outreach Sent', dotColor: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    'In Discussion': { label: 'In Talks', dotColor: 'bg-purple-500', textColor: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    'Client Won': { label: 'Client Won', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    Declined: { label: 'Declined', dotColor: 'bg-rose-400', textColor: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  };

  const config = statusConfig[status] || statusConfig.Uncontacted;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.bg} ${config.textColor}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
      {showText && config.label}
    </span>
  );
};
