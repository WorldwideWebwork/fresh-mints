import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Zap,
  Database,
  Share2,
  X,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import { ProfessionCategory, PROFESSION_CONFIGS, OutreachStatus } from '../../types/lead';
import { STATE_DROPDOWN_OPTIONS } from '../../types/states';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedProfession: ProfessionCategory | 'all';
  onProfessionChange: (p: ProfessionCategory | 'all') => void;
  selectedState: string;
  onStateChange: (s: string) => void;
  selectedOutreachStatus: OutreachStatus | 'all';
  onStatusChange: (s: OutreachStatus | 'all') => void;
  onBatchSkipTrace: () => void;
  onFetchLiveOpenData?: (quantity?: number) => void;
  onOpenCrmModal?: () => void;
  onOpenAddModal: () => void;
  isBatchLoading?: boolean;
  isLiveFetching?: boolean;
  totalFilteredCount: number;
  fetchQuantity?: number;
  onFetchQuantityChange?: (quantity: number) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedProfession,
  onProfessionChange,
  selectedState,
  onStateChange,
  selectedOutreachStatus,
  onStatusChange,
  onBatchSkipTrace,
  onFetchLiveOpenData,
  onOpenCrmModal,
  onOpenAddModal,
  isBatchLoading = false,
  isLiveFetching = false,
  totalFilteredCount,
  fetchQuantity = 25,
  onFetchQuantityChange,
}) => {
  const [showCategoryPills, setShowCategoryPills] = useState(false);

  const professionOptions = [
    { value: 'all', label: 'All Industries (13 Categories)' },
    ...Object.values(PROFESSION_CONFIGS).map((p) => ({
      value: p.id,
      label: `${p.label} ($${p.averageWebsiteValue.toLocaleString()})`,
    })),
  ];

  const stateOptions = STATE_DROPDOWN_OPTIONS;

  const statusOptions = [
    { value: 'all', label: 'All Outreach Stages' },
    { value: 'Uncontacted', label: 'Newly Minted (Uncontacted)' },
    { value: 'Skip Traced', label: 'Skip Traced & Verified' },
    { value: 'Site Built', label: 'Website Built' },
    { value: 'Outreach Sent', label: 'Pitch Sent' },
    { value: 'In Discussion', label: 'In Active Talks' },
    { value: 'Client Won', label: 'Client Won ($)' },
    { value: 'Declined', label: 'Declined' },
  ];

  const quantityOptions = [
    { value: '10', label: 'Fetch 10' },
    { value: '25', label: 'Fetch 25' },
    { value: '50', label: 'Fetch 50' },
  ];

  const hasActiveFilters =
    selectedProfession !== 'all' ||
    selectedState !== 'all' ||
    selectedOutreachStatus !== 'all' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    onSearchChange('');
    onProfessionChange('all');
    onStateChange('all');
    onStatusChange('all');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6 space-y-4">
      {/* Top Search and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        {/* Search input (full width on mobile, 5 cols on desktop) */}
        <div className="md:col-span-5 relative">
          <Input
            id="filter-search-input"
            placeholder="Search newly licensed graduate, school, city, license #..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="w-4 h-4 text-emerald-600/70" />}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Industry Category Dropdown */}
        <div className="md:col-span-3">
          <Select
            id="filter-profession-select"
            options={professionOptions}
            value={selectedProfession}
            onChange={(e) => onProfessionChange(e.target.value as any)}
          />
        </div>

        {/* State Dropdown */}
        <div className="md:col-span-2">
          <Select
            id="filter-state-select"
            options={stateOptions}
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
          />
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-2">
          <Select
            id="filter-status-select"
            options={statusOptions}
            value={selectedOutreachStatus}
            onChange={(e) => onStatusChange(e.target.value as any)}
          />
        </div>
      </div>

      {/* Quick Category Cloud (Wraps naturally onto new lines - No Horizontal Scrolling) */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Browse Licenses
            </span>
            <button
              onClick={() => setShowCategoryPills(!showCategoryPills)}
              className="md:hidden text-xs text-emerald-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>{showCategoryPills ? 'Hide all tags' : 'Show all 12 tags'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCategoryPills ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              id="filter-reset-button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Wrapping Flex Grid for Industry Chips */}
        <div className={`${showCategoryPills ? 'flex' : 'hidden'} md:flex flex-wrap gap-1.5`}>
          <button
            id="chip-profession-all"
            onClick={() => onProfessionChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedProfession === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All 12 Fields
          </button>
          {Object.values(PROFESSION_CONFIGS).map((p) => {
            const isSelected = selectedProfession === p.id;
            return (
              <button
                key={p.id}
                id={`chip-profession-${p.id}`}
                onClick={() => onProfessionChange(isSelected ? 'all' : p.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/50'
                }`}
              >
                <span>{p.label.split(' ')[0]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  ${p.averageWebsiteValue}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Showing <strong className="text-slate-900 font-bold">{totalFilteredCount}</strong> matching leads
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quantity Selector for Live Ingestion */}
          {onFetchQuantityChange && (
            <div className="min-w-[90px]">
              <select
                id="fetch-quantity-select"
                aria-label="Batch Fetch Results Quantity"
                value={String(fetchQuantity)}
                onChange={(e) => onFetchQuantityChange(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-2 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden min-h-[38px] cursor-pointer"
              >
                {quantityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onOpenCrmModal && (
            <Button
              id="btn-crm-export"
              variant="outline"
              size="sm"
              onClick={onOpenCrmModal}
              icon={<Share2 className="w-3.5 h-3.5 text-slate-600" />}
              title="Export leads to CSV or push to Webhook"
              className="justify-center min-h-[38px]"
            >
              Export CSV
            </Button>
          )}

          {onFetchLiveOpenData && (
            <Button
              id="btn-sync-live-data"
              variant="outline"
              size="sm"
              onClick={() => onFetchLiveOpenData(fetchQuantity)}
              isLoading={isLiveFetching}
              icon={<Database className="w-3.5 h-3.5 text-emerald-600" />}
              title="Query Free Public Registries (CMS NPPES & State Socrata)"
              className="justify-center min-h-[38px] border-emerald-200 hover:bg-emerald-50 text-emerald-800"
            >
              {isLiveFetching ? 'Fetching...' : `Sync Fresh +${fetchQuantity}`}
            </Button>
          )}

          <Button
            id="btn-batch-skip-trace"
            variant="outline"
            size="sm"
            onClick={onBatchSkipTrace}
            isLoading={isBatchLoading}
            icon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
            className="justify-center min-h-[38px]"
          >
            Batch Trace
          </Button>

          <Button
            id="btn-add-lead"
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
            className="justify-center min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            + Add Lead
          </Button>
        </div>
      </div>
    </div>
  );
};
