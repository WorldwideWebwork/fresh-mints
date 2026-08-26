import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import { Lead, ExistingWebsiteAudit } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface WebsiteAuditModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onRunAudit: (leadId: string) => Promise<ExistingWebsiteAudit | null>;
  onOpenPitch: (lead: Lead) => void;
  onOpenWebsitePreview?: (lead: Lead) => void;
}

export const WebsiteAuditModal: React.FC<WebsiteAuditModalProps> = ({
  lead,
  isOpen,
  onClose,
  onRunAudit,
  onOpenPitch,
  onOpenWebsitePreview,
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showMethodology, setShowMethodology] = useState(false);

  const audit = lead?.websiteAudit;

  const handleAudit = useCallback(async () => {
    if (!lead) return;
    setIsAuditing(true);
    setActiveStep(1);

    const timer1 = setTimeout(() => setActiveStep(2), 500);
    const timer2 = setTimeout(() => setActiveStep(3), 1000);
    const timer3 = setTimeout(() => setActiveStep(4), 1600);

    try {
      await onRunAudit(lead.id);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsAuditing(false);
      setActiveStep(0);
    }
  }, [lead, onRunAudit]);

  if (!isOpen || !lead) return null;

  const scanSteps = [
    { title: 'Querying Google Search Index & State Board Registries', detail: `Target: "${lead.fullName}" in ${lead.city}, ${lead.state}` },
    { title: 'Checking Standalone Domain Names & DNS Records', detail: 'Evaluating .com / .org / custom branded practice TLDs' },
    { title: 'Filtering Static Aggregators vs Solo Practice Sites', detail: 'Separating official state registries & Yelp from standalone websites' },
    { title: 'Synthesizing Strategic Outreach Pitch Angle', detail: 'Formulating highest-conversion turnkey package recommendation' },
  ];

  return (
    <div
      id="website-audit-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="website-audit-modal-content"
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Website Presence Audit</h2>
                {audit && (
                  <Badge variant={!audit.hasWebsite ? 'success' : 'warning'} size="sm">
                    {!audit.hasWebsite ? 'No Website (Hot Lead)' : 'Site Detected'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Live Google Search grounding & domain verification for {lead.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1">
          {/* Lead Context Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900 text-sm">{lead.fullName}</span>
                <Badge variant="info" size="sm">{lead.professionTitle}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {lead.city}, {lead.state} • License #{lead.licenseNumber}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAudit}
              isLoading={isAuditing}
              icon={<RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isAuditing ? 'animate-spin' : ''}`} />}
            >
              {isAuditing ? 'Auditing Live...' : 'Re-Run Live Audit'}
            </Button>
          </div>

          {/* Active Live Scanner Animation */}
          {isAuditing && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center animate-spin">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Scanning Live Web & Domain Footprint...
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Verifying official standalone website status across public search engines
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {scanSteps.map((step, idx) => {
                  const stepNumber = idx + 1;
                  const isDone = activeStep > stepNumber;
                  const isCurrent = activeStep === stepNumber;

                  return (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <span className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin inline-block" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                            {stepNumber}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${isCurrent ? 'text-emerald-900' : isDone ? 'text-emerald-800' : 'text-slate-400'}`}>
                          {step.title}
                        </p>
                        <p className="text-[11px] text-slate-500">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audit Findings */}
          {audit && !isAuditing && (
            <div className="space-y-4 animate-fadeIn">
              {/* Primary Findings Card */}
              <div
                className={`p-4 rounded-2xl border ${
                  !audit.hasWebsite
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!audit.hasWebsite ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-sm">
                        {!audit.hasWebsite
                          ? 'High Opportunity Lead: 0 Active Website Found'
                          : 'Existing Website Detected'}
                      </h4>
                      <Badge variant={!audit.hasWebsite ? 'success' : 'warning'} size="sm">
                        {audit.status}
                      </Badge>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-700 font-medium">
                      {audit.summary}
                    </p>

                    {audit.existingUrl && (
                      <div className="pt-2">
                        <a
                          href={audit.existingUrl.startsWith('http') ? audit.existingUrl : `https://${audit.existingUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {audit.existingUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Qualification Criteria Matrix */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-slate-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Website Qualification Breakdown
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Audit Date: {new Date(audit.checkedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Custom Domain Metric */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5">
                    {audit.qualifications?.hasCustomDomain || audit.hasWebsite ? (
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-slate-800">Standalone Custom Domain</p>
                      <p className="text-[11px] text-slate-500">
                        {audit.qualifications?.domainCheckSummary || (!audit.hasWebsite ? 'No dedicated .com or root domain' : 'Live root domain registered')}
                      </p>
                    </div>
                  </div>

                  {/* Direct Intake / Booking Funnel */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5">
                    {audit.qualifications?.hasDirectBookingPortal ? (
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-slate-800">Online Intake / Booking Portal</p>
                      <p className="text-[11px] text-slate-500">
                        {audit.qualifications?.hasDirectBookingPortal ? 'Direct client booking system active' : 'Zero booking system or calendar'}
                      </p>
                    </div>
                  </div>

                  {/* Aggregator Directory Filter */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5 sm:col-span-2">
                    <Layers className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Digital Footprint Classification</p>
                      <p className="text-[11px] text-slate-500">
                        {audit.qualifications?.digitalFootprintRating || (!audit.hasWebsite ? 'Registry / Board Listing Only' : 'Custom Independent Practice')} — {!audit.hasWebsite ? 'Appears exclusively on passive state registers or directory stubs; has no personal control of their client acquisition funnel.' : 'Controls their own branded web property.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pitch Strategy Recommendation */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Recommended Turnkey Pitch Strategy</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {audit.pitchStrategy}
                </p>
              </div>

              {/* Sources Checked */}
              {audit.socialProfilesFound && audit.socialProfilesFound.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Online Sources & Registries Verified
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {audit.socialProfilesFound.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200/60"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Educational Qualification Methodology Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>How Fresh Mints Qualifies Website Presence</span>
              </div>
              {showMethodology ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showMethodology && (
              <div className="p-4 pt-0 text-xs text-slate-600 space-y-3 border-t border-slate-100 bg-slate-50/50">
                <div className="space-y-1">
                  <p className="font-bold text-emerald-800">1. What Qualifies as &quot;No Website&quot; (Hot Lead):</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li><strong>No Standalone Root Domain:</strong> No active <code>.com</code>, <code>.co</code>, or dedicated domain registered under their name or practice.</li>
                    <li><strong>Directory-Only Presence:</strong> Appearing exclusively on passive licensing registers (e.g. State Board, NPPES NPI index, Yelp stubs, university rolls) with zero custom branding.</li>
                    <li><strong>Missing Conversion Funnel:</strong> No discovery call scheduler, custom contact intake form, or mobile-optimized services showcase.</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-amber-800">2. What Qualifies as &quot;Has Existing Website&quot;:</p>
                  <p className="text-[11px] text-slate-600">
                    A live, dedicated personal or business domain matching the professional&apos;s name, city, and licensing credentials. In these cases, you can pitch a <strong>Website Modernization & Mobile Performance Redesign</strong> instead of a new build.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {onOpenWebsitePreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenWebsitePreview(lead);
                }}
                icon={<Globe className="w-4 h-4 text-emerald-600" />}
              >
                Preview Turnkey Site
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenPitch(lead);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Outreach & Pitch Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
