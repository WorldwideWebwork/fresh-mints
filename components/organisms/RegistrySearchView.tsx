import React, { useState } from 'react';
import {
  Search,
  Database,
  Sparkles,
  Globe,
  Plus,
  Phone,
  Mail,
  MapPin,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Lead, ProfessionCategory, PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { US_STATES } from '../../types/states';

interface RegistrySearchViewProps {
  onMintLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'outreachLogs'>) => void;
  onPreviewWebsite: (lead: Lead) => void;
  onSkipTrace: (lead: Lead) => void;
  onFetchLiveSync: (profession?: ProfessionCategory, state?: string, quantity?: number) => Promise<void>;
  existingLeads: Lead[];
  isLiveFetching: boolean;
}

const SEARCH_PRESETS = [
  {
    label: 'Florida Real Estate Licensees',
    profession: 'real_estate' as ProfessionCategory,
    state: 'FL',
    description: 'Newly licensed residential & commercial agents across Miami, Tampa, and Orlando',
  },
  {
    label: 'Texas Family Nurse Practitioners',
    profession: 'nursing' as ProfessionCategory,
    state: 'TX',
    description: 'Graduating RNs, APRNs, and concierge wellness nurses in Austin, Houston, and Dallas',
  },
  {
    label: 'California Dental Surgery (DDS)',
    profession: 'dental' as ProfessionCategory,
    state: 'CA',
    description: 'Recent board passers establishing private cosmetic & restorative practices',
  },
  {
    label: 'New York Wealth & CPAs',
    profession: 'finance' as ProfessionCategory,
    state: 'NY',
    description: 'Solo tax strategists and financial planners launching boutique advisory firms',
  },
  {
    label: 'North Carolina Mental Health Counselors',
    profession: 'therapy' as ProfessionCategory,
    state: 'NC',
    description: 'LPCs and LMFTs launching telehealth & private therapy clinics',
  },
  {
    label: 'Arizona Medical Esthetics & MedSpas',
    profession: 'beauty' as ProfessionCategory,
    state: 'AZ',
    description: 'Licensed medical estheticians and skincare specialists opening solo suites',
  },
];

export const RegistrySearchView: React.FC<RegistrySearchViewProps> = ({
  onMintLead,
  onPreviewWebsite,
  onSkipTrace,
  onFetchLiveSync,
  existingLeads,
  isLiveFetching,
}) => {
  const [selectedProfession, setSelectedProfession] = useState<ProfessionCategory | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [fetchBatchSize, setFetchBatchSize] = useState<number>(25);

  const existingLicenseSet = new Set(existingLeads.map((l) => l.licenseNumber.toLowerCase()));

  const handleRunSearch = async () => {
    const targetProf = selectedProfession === 'all' ? undefined : selectedProfession;
    const targetState = selectedState === 'all' ? undefined : selectedState;
    await onFetchLiveSync(targetProf, targetState, fetchBatchSize);
  };

  const handleApplyPreset = async (preset: typeof SEARCH_PRESETS[0]) => {
    setSelectedProfession(preset.profession);
    setSelectedState(preset.state);
    await onFetchLiveSync(preset.profession, preset.state, fetchBatchSize);
  };

  const activeProfMeta = selectedProfession !== 'all' ? PROFESSION_CONFIGS[selectedProfession] : null;
  const activePlan = activeProfMeta ? W4_HOSTING_PLANS[activeProfMeta.hostingTier] : null;

  return (
    <div id="registry-search-studio" className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              State Licensing Registry Explorer
            </span>
            <Badge variant="info" size="sm">
              50 States • CMS NPPES • Socrata Open Data
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover Newly Minted Practitioners
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Query verified public state licensing boards on Day 1 of exam pass announcements. Find newly licensed professionals with zero web presence and pitch your turnkey <strong>2-year w4 hosting package ($1,250–$3,950)</strong> with <strong>$300 rep commissions</strong> and <strong>$999 domain buyout rights</strong>.
          </p>
        </div>

        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Database className="w-72 h-72 text-emerald-400" />
        </div>
      </div>

      {/* Main Search Query Box */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            Registry Query Filters
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            {existingLeads.length} total leads saved in local IndexedDB store
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Query */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Search Keyword or Licensee Name
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-query-input"
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="e.g. Austin, Dental Surgery, Lic#..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all text-stone-900"
              />
            </div>
          </div>

          {/* Profession Selector */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Profession / Industry
            </label>
            <select
              id="search-profession-select"
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value as any)}
              className="w-full py-2 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all text-stone-900 cursor-pointer"
            >
              <option value="all">All 12 High-Value Professions</option>
              {Object.values(PROFESSION_CONFIGS).map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.label}
                </option>
              ))}
            </select>
          </div>

          {/* State Selector */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              State Board
            </label>
            <select
              id="search-state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-2 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all text-stone-900 cursor-pointer"
            >
              <option value="all">All 50 States</option>
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Size */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Count
            </label>
            <select
              id="search-batch-size-select"
              value={fetchBatchSize}
              onChange={(e) => setFetchBatchSize(Number(e.target.value))}
              className="w-full py-2 px-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all text-stone-900 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Run Action */}
          <div className="sm:col-span-2 flex items-end">
            <Button
              id="run-registry-search-btn"
              variant="primary"
              size="md"
              onClick={handleRunSearch}
              isLoading={isLiveFetching}
              icon={<Sparkles className="w-4 h-4" />}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLiveFetching ? 'Querying...' : 'Sync Registry'}
            </Button>
          </div>
        </div>

        {/* Selected Tier Pricing Banner */}
        {activeProfMeta && activePlan && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-emerald-900 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{activeProfMeta.label}:</span>
              <span>
                Turnkey Offer <strong>${activePlan.twoYearFlatPackagePrice.toLocaleString()}</strong> ({activePlan.name} Tier)
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                Rep Bounty: $300
              </span>
              <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                Net Profit: +${activePlan.netConsultingProfit.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Search Preset Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          High-Yield Discovery Presets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SEARCH_PRESETS.map((preset, idx) => {
            const prof = PROFESSION_CONFIGS[preset.profession];
            const plan = W4_HOSTING_PLANS[prof.hostingTier];
            return (
              <div
                key={idx}
                id={`search-preset-${preset.profession}-${preset.state}`}
                className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => handleApplyPreset(preset)}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 bg-stone-100 group-hover:bg-emerald-100 text-stone-800 group-hover:text-emerald-800 rounded-md transition-colors">
                      {preset.state} • {prof.label.split(' ')[0]}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      ${plan.twoYearFlatPackagePrice.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm group-hover:text-emerald-700 transition-colors">
                    {preset.label}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-emerald-600">
                  <span className="text-stone-400 font-mono text-[11px]">${plan.name}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Query State Board <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discovered Leads in CRM */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recently Synced Licensees
            </h3>
            <p className="text-xs text-stone-500">
              Verified newly licensed professionals persisted in your database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">
              Showing <strong>{Math.min(existingLeads.length, 10)}</strong> of {existingLeads.length} leads
            </span>
          </div>
        </div>

        {existingLeads.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-800 text-sm">No Registry Records Loaded</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Click &quot;Sync Registry&quot; or choose a preset above to query live state board records and CMS federal databases.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunSearch}
              isLoading={isLiveFetching}
              icon={<Sparkles className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white mx-auto"
            >
              Sync 25 Live Licensees
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {existingLeads.slice(0, 10).map((lead) => {
              const prof = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
              const plan = W4_HOSTING_PLANS[prof.hostingTier] || W4_HOSTING_PLANS.bronze;
              return (
                <div
                  key={lead.id}
                  className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{lead.fullName}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                        {lead.professionTitle}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                        {lead.state} Lic #{lead.licenseNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {lead.city}, {lead.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        Issued: {lead.issueDate}
                      </span>
                      <span className="text-stone-400">
                        {lead.collegeOrSchool}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right mr-2 hidden sm:block">
                      <span className="font-mono font-bold text-stone-900 text-sm block">
                        ${(lead.estimatedDealValue || plan.twoYearFlatPackagePrice).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium block">
                        +$300 Rep Bounty
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreviewWebsite(lead)}
                      icon={<Globe className="w-3.5 h-3.5 text-blue-600" />}
                    >
                      Website
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSkipTrace(lead)}
                      icon={<Phone className="w-3.5 h-3.5 text-emerald-600" />}
                    >
                      Contacts
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
