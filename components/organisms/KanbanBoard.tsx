import React from 'react';
import {
  Globe,
  Send,
  Zap,
  ArrowRight,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Lead, OutreachStatus, PROFESSION_CONFIGS } from '../../types/lead';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onPreviewWebsite: (lead: Lead) => void;
  onOutreachPitch: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: OutreachStatus) => void;
}

const STAGE_ORDER: OutreachStatus[] = [
  'Uncontacted',
  'Skip Traced',
  'Site Built',
  'Outreach Sent',
  'In Discussion',
  'Client Won',
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onSelectLead,
  onPreviewWebsite,
  onOutreachPitch,
  onUpdateStatus,
}) => {
  const columns: {
    id: OutreachStatus;
    title: string;
    accentColor: string;
    headerBg: string;
    badgeColor: string;
  }[] = [
    {
      id: 'Uncontacted',
      title: 'Newly Discovered',
      accentColor: 'bg-slate-400',
      headerBg: 'bg-slate-50 border-slate-200',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'Skip Traced',
      title: 'Skip Traced',
      accentColor: 'bg-blue-500',
      headerBg: 'bg-blue-50/60 border-blue-200/60',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'Site Built',
      title: 'Site Pitch Built',
      accentColor: 'bg-purple-500',
      headerBg: 'bg-purple-50/60 border-purple-200/60',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'Outreach Sent',
      title: 'Outreach Sent',
      accentColor: 'bg-amber-500',
      headerBg: 'bg-amber-50/60 border-amber-200/60',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'In Discussion',
      title: 'In Talks',
      accentColor: 'bg-indigo-500',
      headerBg: 'bg-indigo-50/60 border-indigo-200/60',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'Client Won',
      title: 'Client Won ($)',
      accentColor: 'bg-emerald-500',
      headerBg: 'bg-emerald-50/60 border-emerald-200/60',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  const getNextStage = (current: OutreachStatus): OutreachStatus | null => {
    const idx = STAGE_ORDER.indexOf(current);
    if (idx >= 0 && idx < STAGE_ORDER.length - 1) {
      return STAGE_ORDER[idx + 1];
    }
    return null;
  };

  const [activeMobileStage, setActiveMobileStage] = React.useState<OutreachStatus>('Uncontacted');

  return (
    <div className="w-full space-y-4">
      {/* Mobile Stage Selector Tabs (Phone only) */}
      <div className="block md:hidden space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
          <span>Stage View</span>
          <span className="text-blue-600 font-bold">
            ${leads.filter((l) => l.outreachStatus === activeMobileStage).reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0).toLocaleString()} in stage
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {columns.map((col) => {
            const count = leads.filter((l) => l.outreachStatus === col.id).length;
            const isSelected = activeMobileStage === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setActiveMobileStage(col.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{col.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Board Controls Summary Header (Desktop) */}
      <div className="hidden md:flex items-center justify-between px-1">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Pipeline Workflow</span>
          <span>•</span>
          <span>6 Active Deal Stages</span>
          <span>•</span>
          <span>{leads.length} Active Leads</span>
        </div>
        <span className="text-xs text-slate-400 italic">Scroll horizontally to view all stages →</span>
      </div>

      {/* Mobile Single Column Display */}
      <div className="block md:hidden">
        {columns
          .filter((col) => col.id === activeMobileStage)
          .map((col) => {
            const columnLeads = leads.filter((l) => l.outreachStatus === col.id);
            const columnValue = columnLeads.reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);
            const nextStageId = getNextStage(col.id);

            return (
              <div
                key={col.id}
                className="w-full flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-xs overflow-hidden"
              >
                <div className={`h-1.5 w-full ${col.accentColor}`} />
                <div className={`p-4 border-b flex items-center justify-between ${col.headerBg}`}>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{col.title}</h3>
                    <p className="text-xs text-slate-500">
                      Est. Value: <strong className="text-slate-800">${columnValue.toLocaleString()}</strong> ({columnLeads.length} leads)
                    </p>
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  {columnLeads.length === 0 ? (
                    <div className="h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium text-slate-400">No leads in {col.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Leads will appear here as they advance</p>
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const hasPhone = Boolean(lead.skipTraceData?.verifiedPhone);
                      const hasEmail = Boolean(lead.skipTraceData?.primaryEmail);

                      return (
                        <div
                          key={lead.id}
                          onClick={() => onSelectLead(lead)}
                          className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                {lead.fullName}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium">
                                {lead.professionTitle}
                              </p>
                            </div>
                            <Badge variant="outline" size="sm" className="shrink-0 font-semibold">
                              {lead.state}
                            </Badge>
                          </div>

                          <div className="text-xs text-slate-500 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="flex items-center gap-1 font-medium truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {lead.city}, {lead.state}
                            </span>
                            <span className="font-bold text-slate-900">${lead.estimatedDealValue}</span>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPreviewWebsite(lead);
                              }}
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold min-h-[44px]"
                            >
                              <Globe className="w-3.5 h-3.5 text-blue-600" />
                              Pitch Site
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOutreachPitch(lead);
                              }}
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold min-h-[44px]"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Outreach
                            </button>
                          </div>

                          {/* Advance Stage Button */}
                          {nextStageId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(lead.id, nextStageId);
                              }}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold min-h-[44px]"
                            >
                              <span>Advance to {nextStageId}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Main Kanban Horizontal Scroll Deck (Desktop) */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-6 pt-1 min-h-[620px] scrollbar-thin scrollbar-thumb-slate-200">
        {columns.map((col) => {
          const columnLeads = leads.filter((l) => l.outreachStatus === col.id);
          const columnValue = columnLeads.reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);
          const nextStageId = getNextStage(col.id);

          return (
            <div
              key={col.id}
              className="w-80 shrink-0 flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-xs overflow-hidden"
            >
              {/* Column Top Accent Bar */}
              <div className={`h-1.5 w-full ${col.accentColor}`} />

              {/* Column Header */}
              <div className={`p-3.5 border-b flex items-center justify-between ${col.headerBg}`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">{col.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badgeColor}`}>
                      {columnLeads.length}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    Est. Value: <strong className="text-slate-800">${columnValue.toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[680px]">
                {columnLeads.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-slate-400">No leads in {col.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Move leads here as deal progresses</p>
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const profMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
                    const hasPhone = Boolean(lead.skipTraceData?.verifiedPhone);
                    const hasEmail = Boolean(lead.skipTraceData?.primaryEmail);

                    return (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className="group bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer space-y-3 relative"
                      >
                        {/* Header: Name & State */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                              {lead.fullName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                              {lead.professionTitle}
                            </p>
                          </div>
                          <Badge variant="outline" size="sm" className="shrink-0 font-semibold">
                            {lead.state}
                          </Badge>
                        </div>

                        {/* Location & School */}
                        <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {lead.city}, {lead.state}
                            </span>
                            <span className="font-bold text-slate-900">${lead.estimatedDealValue}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate" title={lead.collegeOrSchool}>
                            {lead.collegeOrSchool}
                          </p>
                        </div>

                        {/* Contact Chips if Skip Traced */}
                        {(hasPhone || hasEmail) && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {hasPhone && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                {lead.skipTraceData?.verifiedPhone}
                              </span>
                            )}
                            {hasEmail && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate max-w-[190px]">
                                <Mail className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                {lead.skipTraceData?.primaryEmail}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewWebsite(lead);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Preview Pitch Website"
                          >
                            <Globe className="w-3 h-3 text-blue-600" />
                            Pitch Site
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOutreachPitch(lead);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            title="Send Web Offer / Email Pitch"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Stage Selector Dropdown & Move Next Button */}
                        <div
                          className="pt-1 flex items-center justify-between gap-1.5 text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={lead.outreachStatus}
                            onChange={(e) => onUpdateStatus(lead.id, e.target.value as OutreachStatus)}
                            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors"
                          >
                            {columns.map((c) => (
                              <option key={c.id} value={c.id}>
                                Move to: {c.title}
                              </option>
                            ))}
                          </select>

                          {nextStageId && (
                            <button
                              onClick={() => onUpdateStatus(lead.id, nextStageId)}
                              className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-blue-600 transition-colors shrink-0"
                              title={`Advance to ${columns.find((c) => c.id === nextStageId)?.title}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
