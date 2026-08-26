import React from 'react';
import { Database, Plus } from 'lucide-react';
import { Lead } from '../../types/lead';
import { LeadRow } from '../molecules/LeadRow';
import { LeadCard } from '../molecules/LeadCard';
import { Button } from '../atoms/Button';

interface LeadTableProps {
  leads: Lead[];
  onSkipTrace: (lead: Lead) => void;
  onPreviewWebsite: (lead: Lead) => void;
  onOutreachPitch: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onAuditWebsite?: (lead: Lead) => void;
  selectedLeadId: string | null;
  onOpenAddModal: () => void;
  onFetchLiveOpenData?: () => void;
  isLiveFetching?: boolean;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onSkipTrace,
  onPreviewWebsite,
  onOutreachPitch,
  onSelectLead,
  onDeleteLead,
  onAuditWebsite,
  selectedLeadId,
  onOpenAddModal,
  onFetchLiveOpenData,
  isLiveFetching = false,
}) => {
  if (leads.length === 0) {
    return (
      <div
        id="empty-leads-view"
        className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm"
      >
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Your Lead Pipeline is Clean & Empty</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Ready to hunt real clients! Query official state/federal licensing registries using <strong>Live Data Sync</strong>, import a CSV list, or add a lead manually.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onFetchLiveOpenData && (
            <Button
              variant="outline"
              size="md"
              onClick={onFetchLiveOpenData}
              isLoading={isLiveFetching}
              icon={<Database className="w-4 h-4 text-blue-600" />}
              className="w-full sm:w-auto"
            >
              {isLiveFetching ? 'Querying APIs...' : 'Fetch Live Open Data'}
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={onOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Add Graduate Lead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="leads-directory-view" className="space-y-3">
      {/* Mobile-First Card View (< 768px) */}
      <div className="block md:hidden space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
          <span>{leads.length} Licensed Lead{leads.length === 1 ? '' : 's'}</span>
          <span className="text-[11px] text-blue-600">Tap cards to preview or pitch</span>
        </div>

        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onSkipTrace={onSkipTrace}
            onPreviewWebsite={onPreviewWebsite}
            onOutreachPitch={onOutreachPitch}
            onSelectLead={onSelectLead}
            onDeleteLead={onDeleteLead}
            onAuditWebsite={onAuditWebsite}
            isSelected={lead.id === selectedLeadId}
          />
        ))}
      </div>

      {/* Desktop Data Table (>= 768px) */}
      <div
        id="leads-directory-table-container"
        className="hidden md:flex bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-col"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">License Type & #</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Web Presence</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Skip Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Stage</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onSkipTrace={onSkipTrace}
                  onPreviewWebsite={onPreviewWebsite}
                  onOutreachPitch={onOutreachPitch}
                  onSelectLead={onSelectLead}
                  onDeleteLead={onDeleteLead}
                  onAuditWebsite={onAuditWebsite}
                  isSelected={lead.id === selectedLeadId}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500 font-medium">
          <p>Showing {leads.length} active graduate lead{leads.length === 1 ? '' : 's'}</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 font-bold">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 border border-blue-600 rounded-md text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-600 font-bold">2</button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 font-bold">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};
