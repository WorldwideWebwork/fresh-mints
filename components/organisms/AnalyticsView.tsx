import React from 'react';
import {
  TrendingUp,
  Zap,
  Globe,
  Send,
  CheckCircle,
  DollarSign,
  PieChart,
  BarChart,
  Target,
} from 'lucide-react';
import { Lead, PROFESSION_CONFIGS } from '../../types/lead';
import { StatCard } from '../molecules/StatCard';
import { Badge } from '../atoms/Badge';

interface AnalyticsViewProps {
  leads: Lead[];
  analytics: {
    totalLeads: number;
    skipTraceRate: number;
    sitesBuiltCount: number;
    outreachSentCount: number;
    dealsWonCount: number;
    conversionRate: number;
    pipelineValue: number;
    wonRevenue: number;
  };
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads, analytics }) => {
  // Count by profession
  const professionBreakdown = Object.values(PROFESSION_CONFIGS).map((p) => {
    const categoryLeads = leads.filter((l) => l.profession === p.id);
    const wonCount = categoryLeads.filter((l) => l.outreachStatus === 'Client Won').length;
    const value = categoryLeads.reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

    return {
      ...p,
      count: categoryLeads.length,
      wonCount,
      value,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Graduate Leads"
          value={analytics.totalLeads}
          subtitle="Identified across state registries"
          icon={<Target className="w-5 h-5 text-blue-600" />}
          highlightColor="sky"
        />

        <StatCard
          title="Skip Trace Match Rate"
          value={`${analytics.skipTraceRate}%`}
          subtitle="Verified phone & email contact profiles"
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          highlightColor="amber"
        />

        <StatCard
          title="Outreach Pitch Conversion"
          value={`${analytics.conversionRate}%`}
          subtitle={`${analytics.dealsWonCount} deals closed from ${analytics.outreachSentCount} pitches`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          highlightColor="emerald"
        />

        <StatCard
          title="Total Revenue Closed"
          value={`$${analytics.wonRevenue.toLocaleString()}`}
          subtitle={`$${analytics.pipelineValue.toLocaleString()} total pipeline value`}
          icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
          highlightColor="indigo"
        />
      </div>

      {/* Industry Category Breakdown */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Lead & Revenue Breakdown by Profession</h3>
            <p className="text-xs text-slate-500">Pipeline distribution across newly licensed verticals</p>
          </div>
          <Badge variant="purple">7 Industry Categories</Badge>
        </div>

        <div className="space-y-3 pt-2">
          {professionBreakdown.map((item) => {
            const percentage = analytics.totalLeads > 0 ? Math.round((item.count / analytics.totalLeads) * 100) : 0;

            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 font-normal">
                    <span>{item.count} leads ({percentage}%)</span>
                    <span className="font-bold text-slate-900">${item.value.toLocaleString()} Value</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
