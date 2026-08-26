import React, { useState } from 'react';
import {
  Plus,
  X,
  Sparkles,
  Flame,
  Phone,
  Users,
  DollarSign,
  Globe,
  Building,
  ShieldCheck,
  Scale,
  Activity,
  Heart,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { CustomTabConfig, ProfessionCategory, PROFESSION_CONFIGS, OUTREACH_STAGES } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { US_STATES } from '../../types/states';

interface AddCustomTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTab: (tab: CustomTabConfig) => void;
}

const AVAILABLE_ICONS = [
  { id: 'Flame', label: 'Flame', icon: Flame },
  { id: 'Phone', label: 'Phone', icon: Phone },
  { id: 'Users', label: 'Users', icon: Users },
  { id: 'DollarSign', label: 'Dollar', icon: DollarSign },
  { id: 'Globe', label: 'Globe', icon: Globe },
  { id: 'Building', label: 'Building', icon: Building },
  { id: 'ShieldCheck', label: 'Shield', icon: ShieldCheck },
  { id: 'Scale', label: 'Scale', icon: Scale },
  { id: 'Activity', label: 'Medical', icon: Activity },
  { id: 'Sparkles', label: 'Sparkles', icon: Sparkles },
];

const PRESET_TABS: Array<{
  label: string;
  iconName: string;
  professionFilter?: ProfessionCategory | 'all';
  stateFilter?: string;
  outreachStatusFilter?: string;
  description: string;
}> = [
  {
    label: '🔥 Hot Uncontacted',
    iconName: 'Flame',
    outreachStatusFilter: 'Uncontacted',
    description: 'All newly minted practitioners with no outreach attempted yet',
  },
  {
    label: '🎯 In Discussion',
    iconName: 'Phone',
    outreachStatusFilter: 'In Discussion',
    description: 'Practitioners currently evaluating pitch presentation',
  },
  {
    label: '🏥 Healthcare Solo',
    iconName: 'Activity',
    professionFilter: 'nursing',
    description: 'Concierge nurses, APRNs, and healthcare consultants',
  },
  {
    label: '🏡 Florida Real Estate',
    iconName: 'Building',
    professionFilter: 'real_estate',
    stateFilter: 'FL',
    description: 'Newly licensed realtors and commercial brokers in Florida',
  },
  {
    label: '🤠 Texas Launch',
    iconName: 'Sparkles',
    stateFilter: 'TX',
    description: 'All Texas newly licensed professionals across 12 verticals',
  },
  {
    label: '⚖️ Legal & Wealth',
    iconName: 'Scale',
    professionFilter: 'legal',
    description: 'Solo attorneys, CFPs, and tax strategists launching practices',
  },
];

export const AddCustomTabModal: React.FC<AddCustomTabModalProps> = ({
  isOpen,
  onClose,
  onAddTab,
}) => {
  const [tabTitle, setTabTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Flame');
  const [professionFilter, setProfessionFilter] = useState<ProfessionCategory | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [outreachStatusFilter, setOutreachStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabTitle.trim()) return;

    const newTab: CustomTabConfig = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      label: tabTitle.trim(),
      iconName: selectedIcon,
      professionFilter: professionFilter === 'all' ? undefined : professionFilter,
      stateFilter: stateFilter === 'all' ? undefined : stateFilter,
      outreachStatusFilter: outreachStatusFilter === 'all' ? undefined : outreachStatusFilter,
      searchFilter: searchFilter.trim() || undefined,
    };

    onAddTab(newTab);
    onClose();
  };

  const handleApplyPreset = (preset: typeof PRESET_TABS[0]) => {
    setTabTitle(preset.label);
    setSelectedIcon(preset.iconName);
    setProfessionFilter(preset.professionFilter || 'all');
    setStateFilter(preset.stateFilter || 'all');
    setOutreachStatusFilter(preset.outreachStatusFilter || 'all');
  };

  return (
    <div
      id="add-custom-tab-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        id="add-custom-tab-modal-content"
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Add Custom Tab / Saved View
              </h2>
              <p className="text-xs text-stone-500">
                Create a custom filtered tab pinned to your bottom app bar and sidebar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 flex-1 text-xs">
          {/* Quick Smart Presets */}
          <div className="space-y-2">
            <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Smart Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_TABS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 text-left bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer group"
                >
                  <span className="font-bold text-stone-900 block text-xs group-hover:text-emerald-700">
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-stone-500 line-clamp-1 block mt-0.5">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-4">
            {/* Tab Title */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tab Name / Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={tabTitle}
                onChange={(e) => setTabTitle(e.target.value)}
                placeholder="e.g. Austin Therapists, Hot Leads, Top Rep Queue..."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-stone-900"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Tab Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIcon(item.id)}
                      className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Profession Filter
                </label>
                <select
                  value={professionFilter}
                  onChange={(e) => setProfessionFilter(e.target.value as any)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs"
                >
                  <option value="all">All Professions</option>
                  {Object.values(PROFESSION_CONFIGS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  State Filter
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs"
                >
                  <option value="all">All 50 States</option>
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Status Filter
                </label>
                <select
                  value={outreachStatusFilter}
                  onChange={(e) => setOutreachStatusFilter(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs"
                >
                  <option value="all">All Statuses</option>
                  {OUTREACH_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<Plus className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Add Tab
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
