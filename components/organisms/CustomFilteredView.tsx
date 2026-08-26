import React, { useState } from 'react';
import {
  CustomTabConfig,
  Lead,
  PROFESSION_CONFIGS,
  W4_HOSTING_PLANS,
  OutreachStatus,
} from '../../types/lead';
import { LeadTable } from './LeadTable';
import { FilterBar } from '../molecules/FilterBar';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import {
  Trash2,
  Filter,
  Users,
  DollarSign,
  Flame,
  Phone,
  Building,
  ShieldCheck,
  Scale,
  Activity,
  Globe,
  Sparkles,
} from 'lucide-react';

interface CustomFilteredViewProps {
  customTab: CustomTabConfig;
  leads: Lead[];
  onSkipTrace: (lead: Lead) => void;
  onPreviewWebsite: (lead: Lead) => void;
  onOutreachPitch: (lead: Lead) => void;
  onAuditWebsite: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onRemoveCustomTab: (tabId: string) => void;
  onOpenAddModal: () => void;
  onFetchLiveOpenData: () => void;
  selectedLeadId: string | null;
  isLiveFetching: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  Phone,
  Users,
  DollarSign,
  Globe,
  Building,
  ShieldCheck,
  Scale,
  Activity,
  Sparkles,
};

export const CustomFilteredView: React.FC<CustomFilteredViewProps> = ({
  customTab,
  leads,
  onSkipTrace,
  onPreviewWebsite,
  onOutreachPitch,
  onAuditWebsite,
  onSelectLead,
  onDeleteLead,
  onRemoveCustomTab,
  onOpenAddModal,
  onFetchLiveOpenData,
  selectedLeadId,
  isLiveFetching,
}) => {
  const [localSearch, setLocalSearch] = useState(customTab.searchFilter || '');
  const [localProfession, setLocalProfession] = useState(customTab.professionFilter || 'all');
  const [localState, setLocalState] = useState(customTab.stateFilter || 'all');
  const [localStatus, setLocalStatus] = useState(customTab.outreachStatusFilter || 'all');

  const filtered = leads.filter((lead) => {
    if (localProfession !== 'all' && lead.profession !== localProfession) return false;
    if (localState !== 'all' && lead.state.toUpperCase() !== localState.toUpperCase()) return false;
    if (localStatus !== 'all' && lead.outreachStatus !== localStatus) return false;
    if (localSearch.trim() !== '') {
      const q = localSearch.toLowerCase();
      const matchName = lead.fullName.toLowerCase().includes(q);
      const matchCity = lead.city.toLowerCase().includes(q);
      const matchTitle = lead.professionTitle.toLowerCase().includes(q);
      const matchLicense = lead.licenseNumber.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchTitle && !matchLicense) return false;
    }
    return true;
  });

  const IconComp = ICON_MAP[customTab.iconName] || Flame;

  const totalValue = filtered.reduce(
    (sum, l) => sum + (l.estimatedDealValue || PROFESSION_CONFIGS[l.profession]?.averageWebsiteValue || 1650),
    0
  );

  return (
    <div id={`custom-view-${customTab.id}`} className="space-y-4">
      {/* Custom Tab Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IconComp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {customTab.label}
              </h2>
              <Badge variant="info" size="sm">
                Custom Tab
              </Badge>
            </div>
            <p className="text-xs text-stone-500">
              Filtered view: {customTab.professionFilter && customTab.professionFilter !== 'all' ? PROFESSION_CONFIGS[customTab.professionFilter]?.label : 'All Professions'} • State: {customTab.stateFilter || 'All'} • Status: {customTab.outreachStatusFilter || 'All'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-stone-400 block font-medium">Pipeline Segment</span>
            <span className="text-base font-bold text-stone-900 font-mono">
              ${totalValue.toLocaleString()} ({filtered.length} leads)
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemoveCustomTab(customTab.id)}
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            className="text-rose-600 hover:bg-rose-50 border-stone-200"
            title="Delete this custom tab"
          >
            Remove Tab
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        selectedProfession={localProfession}
        onProfessionChange={(p) => setLocalProfession(p)}
        selectedState={localState}
        onStateChange={(s) => setLocalState(s)}
        selectedOutreachStatus={localStatus as any}
        onStatusChange={(s) => setLocalStatus(s)}
        onBatchSkipTrace={async () => {}}
        onFetchLiveOpenData={onFetchLiveOpenData}
        onOpenCrmModal={() => {}}
        onOpenAddModal={onOpenAddModal}
        isBatchLoading={false}
        isLiveFetching={isLiveFetching}
        totalFilteredCount={filtered.length}
        fetchQuantity={25}
        onFetchQuantityChange={() => {}}
      />

      {/* Lead Table */}
      <LeadTable
        leads={filtered}
        onSkipTrace={onSkipTrace}
        onPreviewWebsite={onPreviewWebsite}
        onOutreachPitch={onOutreachPitch}
        onAuditWebsite={onAuditWebsite}
        onSelectLead={onSelectLead}
        onDeleteLead={onDeleteLead}
        selectedLeadId={selectedLeadId}
        onOpenAddModal={onOpenAddModal}
        onFetchLiveOpenData={onFetchLiveOpenData}
        isLiveFetching={isLiveFetching}
      />
    </div>
  );
};
