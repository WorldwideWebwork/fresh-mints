import React, { useState } from 'react';
import {
  Download,
  Upload,
  Link2,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Send,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useLeadStore } from '../../hooks/use-lead-store';
import { ToastType } from '../molecules/Toast';

interface CrmExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (toast: {
    type: ToastType;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  }) => void;
}

export const CrmExportModal: React.FC<CrmExportModalProps> = ({ isOpen, onClose, onToast }) => {
  const {
    leads,
    filteredLeads,
    exportFilteredToCSV,
    importFromCSV,
    getWebhookUrl,
    setWebhookUrl,
    syncAllFilteredToCRM,
    clearAllLeads,
  } = useLeadStore();

  const [webhookInput, setWebhookInput] = useState(getWebhookUrl());
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveWebhook = () => {
    setWebhookUrl(webhookInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    onToast?.({
      type: 'success',
      title: 'Webhook URL Saved',
      description: 'New lead records and skip-trace updates will route through this webhook endpoint.',
    });
  };

  const handleSyncCRM = async () => {
    if (!webhookInput.trim()) {
      setSyncStatus('Please enter and save a valid Webhook URL first.');
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);

    const result = await syncAllFilteredToCRM();
    setIsSyncing(false);

    if (result.success) {
      setSyncStatus(`Successfully pushed ${filteredLeads.length} lead(s) to your CRM.`);
      onToast?.({
        type: 'success',
        title: 'CRM Webhook Dispatched',
        description: `Pushed ${filteredLeads.length} leads payload to webhook endpoint.`,
      });
    } else {
      setSyncStatus(`Sync Notice: ${result.message}`);
    }
  };

  const handleExportCSV = () => {
    exportFilteredToCSV();
    onToast?.({
      type: 'success',
      title: 'CSV File Generated',
      description: `Downloaded ${filteredLeads.length} formatted leads to your local downloads folder.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      if (csvText) {
        const count = importFromCSV(csvText);
        setImportStatus(`Successfully parsed and saved ${count} new lead(s) into IndexedDB.`);
        onToast?.({
          type: 'success',
          title: 'CSV Import Complete',
          description: `Loaded and persisted ${count} new records into IndexedDB NoSQL storage.`,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClear = () => {
    clearAllLeads();
    setShowClearConfirm(false);
    setClearedNotice('IndexedDB database cleared. Ready for fresh live registry data.');
    onToast?.({
      type: 'info',
      title: 'Storage Cleared',
      description: 'All local leads removed. You now have a clean slate.',
    });
  };

  return (
    <div
      id="crm-export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="crm-export-modal"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">CRM Integration & NoSQL Storage</h3>
              <p className="text-xs text-slate-500">Export, live sync, or import leads with persistent storage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: CSV Export */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Direct CSV Download for CRM Import</h4>
                  <p className="text-xs text-slate-500">
                    Export {filteredLeads.length} currently filtered lead(s) formatted for GoHighLevel, HubSpot, & Salesforce.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCSV}
                icon={<Download className="w-4 h-4" />}
              >
                Export {filteredLeads.length} Leads (.CSV)
              </Button>
            </div>
          </div>

          {/* Section 2: Inbound Webhook Sync */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Live CRM Webhook Endpoint</h4>
                <p className="text-xs text-slate-500">
                  Automatically post newly discovered/skip-traced leads to your Zapier, Make, or GoHighLevel endpoint.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="https://hooks.zapier.com/hooks/catch/12345/abcde or GoHighLevel URL"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                />
              </div>
              <Button variant="outline" size="md" onClick={handleSaveWebhook}>
                {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : 'Save URL'}
              </Button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                {getWebhookUrl() ? 'Endpoint Connected' : 'No Webhook URL configured'}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSyncCRM}
                isLoading={isSyncing}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Sync {filteredLeads.length} Leads Now
              </Button>
            </div>

            {syncStatus && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
                <span>{syncStatus}</span>
              </div>
            )}
          </div>

          {/* Section 3: Import Custom CSV */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Import Real Leads (.CSV)</h4>
                  <p className="text-xs text-slate-500">
                    Upload your own customer database or state registry CSV file into IndexedDB.
                  </p>
                </div>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-xs">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                Select File
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {importStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          {/* Section 4: IndexedDB Storage Purge & Clean Slate */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">IndexedDB Storage Management</h4>
                <p className="text-xs text-slate-500">
                  Currently persisting <strong>{leads.length} total lead(s)</strong> in browser storage.
                </p>
              </div>

              {leads.length > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Wipe Local Storage
                </Button>
              )}
            </div>

            {/* In-Modal Confirmation Dialogue */}
            {showClearConfirm && (
              <div
                id="clear-leads-confirm-dialog"
                className="p-4 rounded-xl bg-white border-2 border-rose-300 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Wipe All {leads.length} Saved Leads from Storage?
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      This will remove all saved lead records from your local browser IndexedDB storage.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleConfirmClear}>
                    Yes, Wipe {leads.length} Leads
                  </Button>
                </div>
              </div>
            )}

            {clearedNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{clearedNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done & Close
          </Button>
        </div>
      </div>
    </div>
  );
};
