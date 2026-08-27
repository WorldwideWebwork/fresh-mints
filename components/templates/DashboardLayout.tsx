"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Users,
  Kanban,
  PhoneCall,
  Server,
  BarChart3,
  Plus,
  Flame,
  Sparkles,
  Trash2,
  DollarSign,
  Info,
  X,
  Globe,
  Building,
  ShieldCheck,
  Scale,
  Activity,
  Database,
  CheckCircle2
} from "lucide-react";
import { useLeadStore } from "../../hooks/use-lead-store";
import { useToast } from "../../hooks/use-toast";
import { FilterBar } from "../molecules/FilterBar";
import { LeadTable } from "../organisms/LeadTable";
import { SkipTraceModal } from "../organisms/SkipTraceModal";
import { WebsitePreviewModal } from "../organisms/WebsitePreviewModal";
import { WebsiteAuditModal } from "../organisms/WebsiteAuditModal";
import { OutreachComposerModal } from "../organisms/OutreachComposerModal";
import { KanbanBoard } from "../organisms/KanbanBoard";
import { AddLeadModal } from "../organisms/AddLeadModal";
import { CrmExportModal } from "../organisms/CrmExportModal";
import { AnalyticsView } from "../organisms/AnalyticsView";
import { ValuationExplainerModal } from "../organisms/ValuationExplainerModal";
import { RegistrySearchView } from "../organisms/RegistrySearchView";
import { RepHubView } from "../organisms/RepHubView";
import { W4EconomicsView } from "../organisms/W4EconomicsView";
import { AddCustomTabModal } from "../organisms/AddCustomTabModal";
import { CustomFilteredView } from "../organisms/CustomFilteredView";
import { ToastContainer } from "../molecules/Toast";
import { ConfirmDialog } from "../molecules/ConfirmDialog";
import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import { Lead, CustomTabConfig, ProfessionCategory, PROFESSION_CONFIGS } from "../../types/lead";

const TAB_ICONS: Record<string, React.ElementType> = {
  Flame,
  Phone: PhoneCall,
  Users,
  DollarSign,
  Globe,
  Building,
  ShieldCheck,
  Scale,
  Activity,
  Sparkles,
  Server,
  Search
};

export const DashboardLayout: React.FC = () => {
  const {
    leads,
    filteredLeads,
    selectedLeadId,
    activeTab,
    customTabs,
    filters,
    analytics,
    fetchQuantity,

    setFetchQuantity,
    setSelectedLeadId,
    setActiveTab,
    addCustomTab,
    removeCustomTab,
    setFilters,
    addLead,
    updateLead,
    deleteLead,
    skipTraceLead,
    batchSkipTraceAllUntraced,
    checkLeadWebsite,
    fetchLiveOpenRegistryData,
    ensureWebsiteConfig,
    logOutreach,
    clearAllLeads
  } = useLeadStore();

  const { toasts, addToast, dismissToast } = useToast();

  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [activeTab]);

  // Modal States
  const [isSkipTraceModalOpen, setIsSkipTraceModalOpen] = useState(false);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [isWebsiteAuditModalOpen, setIsWebsiteAuditModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [isLiveFetching, setIsLiveFetching] = useState(false);
  const [modalTargetLead, setModalTargetLead] = useState<Lead | null>(null);

  // Delete Confirmation States
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);

  // Handlers
  const handleFetchLiveOpenData = async (quantity?: number) => {
    setIsLiveFetching(true);
    const targetProf = filters.profession === "all" ? undefined : filters.profession;
    const targetState = filters.state === "all" ? undefined : filters.state;
    const targetQuantity = quantity || fetchQuantity || 25;
    const newCount = await fetchLiveOpenRegistryData(targetProf, targetState, targetQuantity);
    setIsLiveFetching(false);

    if (newCount > 0) {
      addToast({
        type: "success",
        title: "Live Registry Data Synced & Saved",
        description: `Successfully retrieved and persisted ${newCount} real practitioners in your IndexedDB NoSQL storage.`
      });
    } else {
      addToast({
        type: "info",
        title: "Registry Query Up-to-Date",
        description: "No new unique licensees found for current filter criteria."
      });
    }
  };

  const handleOpenSkipTrace = (lead: Lead) => {
    setModalTargetLead(lead);
    setIsSkipTraceModalOpen(true);
  };

  const handleOpenWebsite = (lead: Lead) => {
    ensureWebsiteConfig(lead.id);
    setModalTargetLead(lead);
    setIsWebsiteModalOpen(true);
  };

  const handleOpenWebsiteAudit = (lead: Lead) => {
    setModalTargetLead(lead);
    setIsWebsiteAuditModalOpen(true);
  };

  const handleOpenOutreach = (lead: Lead) => {
    ensureWebsiteConfig(lead.id);
    setModalTargetLead(lead);
    setIsOutreachModalOpen(true);
  };

  const handleBatchSkipTrace = async () => {
    setIsBatchLoading(true);
    const updatedCount = await batchSkipTraceAllUntraced();
    setIsBatchLoading(false);

    addToast({
      type: "success",
      title: "Batch Skip Trace Complete",
      description: `Discovered and verified contact coordinates for ${updatedCount} untraced lead(s).`
    });
  };

  const handlePromptDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      addToast({
        type: "info",
        title: "Lead Removed",
        description: `${leadToDelete.fullName} was removed from your database.`
      });
    }
    setLeadToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmClearAll = () => {
    clearAllLeads();
    setIsClearAllConfirmOpen(false);
    addToast({
      type: "info",
      title: "Database Cleared",
      description: "IndexedDB local storage was wiped clean. You can fetch live records anytime."
    });
  };

  const handleAddNewTab = (tab: CustomTabConfig) => {
    addCustomTab(tab);
    addToast({
      type: "success",
      title: "Custom Tab Created",
      description: `"${tab.label}" tab was added to your navigation bar and saved.`
    });
  };

  const handleRemoveCustomTab = (tabId: string) => {
    removeCustomTab(tabId);
    addToast({
      type: "info",
      title: "Tab Removed",
      description: "Custom view was removed from your navigation."
    });
  };

  // Find active custom tab if selected
  const activeCustomTab = customTabs.find((t) => t.id === activeTab);

  return (
    <div className="flex h-screen bg-slate-50/50 text-slate-900 font-sans antialiased overflow-hidden select-none">
      {/* Toast Notification Layer */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />

      {/* Desktop Sidebar Navigation */}
      <aside
        id="desktop-sidebar"
        className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col border-r border-slate-800"
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-wider flex items-center gap-1.5">
              <span>FRESH MINTS</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Newly Minted Leads & Pitch Studio
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* 1. Search Tab - First item on the left/top */}
          <button
            id="sidebar-nav-search"
            onClick={() => setActiveTab("search")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "search"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Search &amp; Discovery</span>
            <span className="ml-auto text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
              Live
            </span>
          </button>

          {/* 2. Leads Directory Tab */}
          <button
            id="sidebar-nav-directory"
            onClick={() => setActiveTab("directory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "directory"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Minted Leads</span>
            <span className="ml-auto text-[11px] bg-slate-800/80 px-2 py-0.5 rounded-full text-slate-300 font-mono">
              {leads.length}
            </span>
          </button>

          {/* 3. Pipeline Tab */}
          <button
            id="sidebar-nav-pipeline"
            onClick={() => setActiveTab("pipeline")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "pipeline"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>CRM Pipeline</span>
          </button>

          {/* 4. Rep Hub ($300 Bounty) */}
          <button
            id="sidebar-nav-outreach"
            onClick={() => setActiveTab("outreach")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "outreach"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>Rep Hub &amp; Calls</span>
          </button>

          {/* 5. w4 Economics & Tiers */}
          <button
            id="sidebar-nav-economics"
            onClick={() => setActiveTab("economics")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "economics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Server className="w-4 h-4 text-teal-400" />
            <span>w4 Economics</span>
          </button>

          {/* 6. Analytics Tab */}
          <button
            id="sidebar-nav-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "analytics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          {/* Custom Tabs Section */}
          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Custom Saved Views
              </span>
              <button
                onClick={() => setIsAddTabModalOpen(true)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Add New Custom Tab"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {customTabs.length === 0 ? (
              <button
                onClick={() => setIsAddTabModalOpen(true)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-dashed border-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>+ Create Custom Tab</span>
              </button>
            ) : (
              <div className="space-y-1">
                {customTabs.map((tab) => {
                  const IconComp = TAB_ICONS[tab.iconName] || Flame;
                  const isSelected = activeTab === tab.id;
                  return (
                    <div
                      key={tab.id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2.5 truncate flex-1 text-left cursor-pointer"
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomTab(tab.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity p-0.5 ml-1 cursor-pointer"
                        title="Remove tab"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Database Management & Pricing Sidebar Cards */}
        <div className="p-4 space-y-3 border-t border-slate-800">
          {leads.length > 0 && (
            <button
              onClick={() => setIsClearAllConfirmOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Storage ({leads.length})</span>
            </button>
          )}

          <div
            onClick={() => setIsValuationModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-800/80 transition-all rounded-2xl p-3.5 cursor-pointer border border-slate-700/60 group"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400">Turnkey Deal Potential</p>
              <Info className="w-3.5 h-3.5 text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <p className="text-white font-bold text-base mb-1.5 font-mono">
              ${analytics.pipelineValue.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{analytics.totalLeads} saved leads</span>
              <span className="text-emerald-400 font-semibold group-hover:underline">
                w4 Math →
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Workspace */}
      <div
        id="main-content-scroll"
        ref={mainScrollRef}
        className="flex-1 flex flex-col overflow-y-auto"
      >
        {/* Mobile Header Navigation */}
        <header className="md:hidden bg-slate-900 text-white p-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wider block text-white">
                FRESH MINTS
              </span>
              <span className="text-[10px] text-emerald-400 block -mt-0.5">
                50 State Licensing Registries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsValuationModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>${analytics.pipelineValue.toLocaleString()}</span>
            </button>

            <button
              onClick={() => setIsAddTabModalOpen(true)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
              title="Add Custom Tab"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content View Container */}
        <main
          className={`flex-1 px-3 sm:px-8 py-4 sm:py-6 w-full mx-auto space-y-4 sm:space-y-6 pb-28 md:pb-8 ${
            activeTab === "pipeline" ? "max-w-full" : "max-w-7xl"
          }`}
        >
          {/* 1. Search & Live Discovery View */}
          {activeTab === "search" && (
            <RegistrySearchView
              onMintLead={(leadData) => {
                const added = addLead(leadData);
                addToast({
                  type: "success",
                  title: "Licensee Minted to CRM",
                  description: `${added.fullName} added to your active database.`
                });
              }}
              onPreviewWebsite={handleOpenWebsite}
              onSkipTrace={handleOpenSkipTrace}
              onFetchLiveSync={async (prof, st, qty) => {
                setIsLiveFetching(true);
                const count = await fetchLiveOpenRegistryData(prof, st, qty);
                setIsLiveFetching(false);
                if (count > 0) {
                  addToast({
                    type: "success",
                    title: "Live Registry Records Synced",
                    description: `Retrieved and saved ${count} newly licensed professionals.`
                  });
                }
              }}
              existingLeads={leads}
              isLiveFetching={isLiveFetching}
            />
          )}

          {/* 2. Leads Directory View */}
          {activeTab === "directory" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>Minted Leads Directory</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {leads.length} Verified
                    </span>
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Newly licensed solo practitioners ready for turnkey 2-year web hosting packages
                    ($1,250–$3,950).
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handleFetchLiveOpenData(fetchQuantity)}
                    isLoading={isLiveFetching}
                    icon={<Database className="w-4 h-4 text-emerald-600" />}
                    title="Query Free Open Public Registries"
                    className="border-emerald-200 hover:bg-emerald-50 text-emerald-900"
                  >
                    {isLiveFetching ? "Querying..." : `Live Sync (+${fetchQuantity})`}
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsAddLeadModalOpen(true)}
                    icon={<Plus className="w-4 h-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    + Add Lead
                  </Button>
                </div>
              </div>

              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Saved Graduates
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900">
                    {analytics.totalLeads}
                  </p>
                  <span className="text-emerald-600 text-[10px] sm:text-xs font-medium">
                    IndexedDB NoSQL Persisted
                  </span>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Skip-Trace Match
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900">
                    {analytics.totalLeads > 0
                      ? Math.round((analytics.tracedLeads / analytics.totalLeads) * 100)
                      : 0}
                    %
                  </p>
                  <span className="text-blue-600 text-[10px] sm:text-xs font-medium">
                    {analytics.tracedLeads} Contacts Found
                  </span>
                </div>

                <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Contacted
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900">
                    {analytics.contactedLeads}
                  </p>
                  <span className="text-purple-600 text-[10px] sm:text-xs font-medium">
                    Outreach Pitches
                  </span>
                </div>

                <div
                  onClick={() => setIsValuationModalOpen(true)}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 hover:border-blue-300 shadow-xs cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Pipeline Potential
                    </p>
                    <Info className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-700" />
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-mono">
                    ${analytics.pipelineValue.toLocaleString()}
                  </p>
                  <span className="text-emerald-600 text-[10px] sm:text-xs font-semibold block">
                    ${analytics.wonRevenue.toLocaleString()} Won •{" "}
                    <span className="underline">View Math</span>
                  </span>
                </div>
              </div>

              <FilterBar
                searchQuery={filters.search}
                onSearchChange={(q) => setFilters({ search: q })}
                selectedProfession={filters.profession}
                onProfessionChange={(p) => setFilters({ profession: p })}
                selectedState={filters.state}
                onStateChange={(s) => setFilters({ state: s })}
                selectedOutreachStatus={filters.outreachStatus as any}
                onStatusChange={(s) => setFilters({ outreachStatus: s })}
                onBatchSkipTrace={handleBatchSkipTrace}
                onFetchLiveOpenData={handleFetchLiveOpenData}
                onOpenCrmModal={() => setIsCrmModalOpen(true)}
                onOpenAddModal={() => setIsAddLeadModalOpen(true)}
                isBatchLoading={isBatchLoading}
                isLiveFetching={isLiveFetching}
                totalFilteredCount={filteredLeads.length}
                fetchQuantity={fetchQuantity}
                onFetchQuantityChange={setFetchQuantity}
              />

              <LeadTable
                leads={filteredLeads}
                onSkipTrace={handleOpenSkipTrace}
                onPreviewWebsite={handleOpenWebsite}
                onOutreachPitch={handleOpenOutreach}
                onAuditWebsite={handleOpenWebsiteAudit}
                onSelectLead={(l) => setSelectedLeadId(l.id)}
                onDeleteLead={handlePromptDeleteLead}
                selectedLeadId={selectedLeadId}
                onOpenAddModal={() => setIsAddLeadModalOpen(true)}
                onFetchLiveOpenData={() => handleFetchLiveOpenData(fetchQuantity)}
                isLiveFetching={isLiveFetching}
              />
            </div>
          )}

          {/* 3. CRM Pipeline Kanban View */}
          {activeTab === "pipeline" && (
            <KanbanBoard
              leads={leads}
              onSelectLead={(l) => setSelectedLeadId(l.id)}
              onPreviewWebsite={handleOpenWebsite}
              onOutreachPitch={handleOpenOutreach}
              onUpdateStatus={(id, status) => updateLead(id, { outreachStatus: status })}
            />
          )}

          {/* 4. Rep Hub & Cold Call Studio View */}
          {activeTab === "outreach" && (
            <RepHubView
              leads={leads}
              onOpenOutreach={handleOpenOutreach}
              onPreviewWebsite={handleOpenWebsite}
              onUpdateStatus={(id, status) => {
                updateLead(id, { outreachStatus: status });
                addToast({
                  type: "success",
                  title: "Status Updated",
                  description: `Lead status moved to "${status}".`
                });
              }}
            />
          )}

          {/* 5. w4 Economics & Tiers View */}
          {activeTab === "economics" && (
            <W4EconomicsView
              totalLeads={analytics.totalLeads}
              pipelineValue={analytics.pipelineValue}
            />
          )}

          {/* 6. Analytics View */}
          {activeTab === "analytics" && (
            <AnalyticsView
              leads={leads}
              analytics={analytics}
            />
          )}

          {/* 7. Custom Filtered Tab View */}
          {activeCustomTab && (
            <CustomFilteredView
              customTab={activeCustomTab}
              leads={leads}
              onSkipTrace={handleOpenSkipTrace}
              onPreviewWebsite={handleOpenWebsite}
              onOutreachPitch={handleOpenOutreach}
              onAuditWebsite={handleOpenWebsiteAudit}
              onSelectLead={(l) => setSelectedLeadId(l.id)}
              onDeleteLead={handlePromptDeleteLead}
              onRemoveCustomTab={handleRemoveCustomTab}
              onOpenAddModal={() => setIsAddLeadModalOpen(true)}
              onFetchLiveOpenData={() => handleFetchLiveOpenData(fetchQuantity)}
              selectedLeadId={selectedLeadId}
              isLiveFetching={isLiveFetching}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-1 py-1.5 flex items-center justify-evenly shadow-2xl safe-bottom"
      >
        {/* 1. Search Bar - First button on the left! */}
        <button
          id="mobile-nav-search"
          onClick={() => setActiveTab("search")}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] ${
            activeTab === "search"
              ? "text-emerald-400 font-bold bg-slate-900/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate text-center w-full">Search</span>
        </button>

        {/* 2. Leads Directory - On its own tab */}
        <button
          id="mobile-nav-directory"
          onClick={() => setActiveTab("directory")}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] ${
            activeTab === "directory"
              ? "text-emerald-400 font-bold bg-slate-900/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate text-center w-full">Leads</span>
        </button>

        {/* 3. Pipeline */}
        <button
          id="mobile-nav-pipeline"
          onClick={() => setActiveTab("pipeline")}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] ${
            activeTab === "pipeline"
              ? "text-emerald-400 font-bold bg-slate-900/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Kanban className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate text-center w-full">Pipeline</span>
        </button>

        {/* 4. Rep Hub */}
        <button
          id="mobile-nav-outreach"
          onClick={() => setActiveTab("outreach")}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] ${
            activeTab === "outreach"
              ? "text-emerald-400 font-bold bg-slate-900/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <PhoneCall className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate text-center w-full">Rep Hub</span>
        </button>

        {/* 5. Economics */}
        <button
          id="mobile-nav-economics"
          onClick={() => setActiveTab("economics")}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] ${
            activeTab === "economics"
              ? "text-emerald-400 font-bold bg-slate-900/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Server className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate text-center w-full">Economics</span>
        </button>

        {/* 6. Analytics */}
        <button
          id="mobile-nav-analytics"
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] ${
            activeTab === "analytics"
              ? "text-emerald-400 font-bold bg-slate-900/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate text-center w-full">Analytics</span>
        </button>

        {/* Custom User Tabs */}
        {customTabs.map((tab) => {
          const IconComp = TAB_ICONS[tab.iconName] || Flame;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 min-h-[44px] ${
                isSelected
                  ? "text-emerald-400 font-bold bg-slate-900/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <IconComp className="w-5 h-5 shrink-0" />
              <span className="text-[10px] mt-0.5 truncate max-w-[54px] text-center w-full">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Plus (+) Button to Add New Custom Tabs */}
        <button
          id="mobile-nav-add-tab"
          onClick={() => setIsAddTabModalOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-slate-900/60 transition-all cursor-pointer min-w-0 min-h-[44px]"
          title="Add New Custom Tab"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center shrink-0">
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold truncate text-center w-full">New Tab</span>
        </button>
      </nav>

      {/* Modals & Dialogs */}
      {isSkipTraceModalOpen && modalTargetLead && (
        <SkipTraceModal
          lead={modalTargetLead}
          isOpen={isSkipTraceModalOpen}
          onClose={() => setIsSkipTraceModalOpen(false)}
          onRunSkipTrace={async (id) => {
            await skipTraceLead(id);
          }}
        />
      )}

      {isWebsiteModalOpen && modalTargetLead && (
        <WebsitePreviewModal
          lead={modalTargetLead}
          isOpen={isWebsiteModalOpen}
          onClose={() => setIsWebsiteModalOpen(false)}
          onUpdateConfig={(id, config) => updateLead(id, { websiteConfig: config })}
          onOpenOutreach={(lead) => {
            setIsWebsiteModalOpen(false);
            handleOpenOutreach(lead);
          }}
        />
      )}

      {isWebsiteAuditModalOpen && modalTargetLead && (
        <WebsiteAuditModal
          lead={modalTargetLead}
          isOpen={isWebsiteAuditModalOpen}
          onClose={() => setIsWebsiteAuditModalOpen(false)}
          onRunAudit={async (id) => {
            const auditResult = await checkLeadWebsite(id);
            if (auditResult) {
              addToast({
                type: !auditResult.hasWebsite ? "success" : "info",
                title: "Website Check Complete",
                description: !auditResult.hasWebsite
                  ? `Verified: ${modalTargetLead.fullName} has NO active website! Prime turnkey pitch opportunity.`
                  : `Active web domain detected for ${modalTargetLead.fullName}: ${auditResult.existingUrl || "Live website"}.`
              });
            }
            return auditResult;
          }}
          onOpenPitch={(lead) => {
            setIsWebsiteAuditModalOpen(false);
            handleOpenOutreach(lead);
          }}
          onOpenWebsitePreview={(lead) => {
            setIsWebsiteAuditModalOpen(false);
            handleOpenWebsite(lead);
          }}
        />
      )}

      {isOutreachModalOpen && modalTargetLead && (
        <OutreachComposerModal
          lead={modalTargetLead}
          isOpen={isOutreachModalOpen}
          onClose={() => setIsOutreachModalOpen(false)}
          onLogSent={(id, log) => {
            logOutreach(id, {
              channel: log.type === "email" ? "Email" : "SMS",
              notes: log.content,
              newStatus: "Outreach Sent"
            });
          }}
        />
      )}

      {isAddLeadModalOpen && (
        <AddLeadModal
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
          onAddLead={(leadData) => {
            const added = addLead(leadData);
            addToast({
              type: "success",
              title: "Lead Added to Database",
              description: `Successfully added and saved ${added.fullName} to your persistent store.`
            });
          }}
        />
      )}

      {isCrmModalOpen && (
        <CrmExportModal
          isOpen={isCrmModalOpen}
          onClose={() => setIsCrmModalOpen(false)}
        />
      )}

      {isValuationModalOpen && (
        <ValuationExplainerModal
          isOpen={isValuationModalOpen}
          onClose={() => setIsValuationModalOpen(false)}
          pipelineValue={analytics.pipelineValue}
          totalLeads={analytics.totalLeads}
        />
      )}

      {isAddTabModalOpen && (
        <AddCustomTabModal
          isOpen={isAddTabModalOpen}
          onClose={() => setIsAddTabModalOpen(false)}
          onAddTab={handleAddNewTab}
        />
      )}

      {/* Delete Single Lead Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Remove Lead from Database"
        message={`Are you sure you want to remove "${leadToDelete?.fullName}"? This action will permanently remove the lead from your local storage.`}
        confirmLabel="Remove Lead"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setLeadToDelete(null);
        }}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmDialog
        isOpen={isClearAllConfirmOpen}
        title="Wipe IndexedDB Storage"
        message="Are you sure you want to remove all saved leads from your local IndexedDB storage? You can query the live licensing registries at any time to pull fresh leads."
        confirmLabel="Wipe Storage"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsClearAllConfirmOpen(false)}
      />
    </div>
  );
};
