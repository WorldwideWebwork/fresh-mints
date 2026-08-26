import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightColor?: 'teal' | 'indigo' | 'emerald' | 'amber' | 'sky';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'teal',
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {trend ? (
        <span
          className={`text-xs font-medium ${
            trend.isPositive ? 'text-green-500' : 'text-rose-500'
          }`}
        >
          {trend.isPositive ? '+' : ''}{trend.value}
        </span>
      ) : (
        subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>
      )}
    </div>
  );
};
