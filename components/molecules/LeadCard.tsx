import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Zap,
  Globe,
  Send,
  Trash2,
  MapPin,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Lead, PROFESSION_CONFIGS } from '../../types/lead';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface LeadCardProps {
  lead: Lead;
  onSkipTrace: (lead: Lead) => void;
  onPreviewWebsite: (lead: Lead) => void;
  onOutreachPitch: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onAuditWebsite?: (lead: Lead) => void;
  isSelected?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSkipTrace,
  onPreviewWebsite,
  onOutreachPitch,
  onSelectLead,
  onDeleteLead,
  onAuditWebsite,
  isSelected = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const professionMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;

  const hasPhone = Boolean(lead.skipTraceData?.verifiedPhone);
  const hasEmail = Boolean(lead.skipTraceData?.primaryEmail);

  return (
    <div
      id={`lead-card-${lead.id}`}
      className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90'
      }`}
    >
      {/* Top Card Bar */}
      <div className="p-4 space-y-3">
        {/* Name, Profession & State Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-200/50">
              {lead.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {lead.fullName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {lead.professionTitle}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 space-y-1">
            <Badge variant="info" size="sm">
              {lead.state}
            </Badge>
            <p className="text-xs font-bold text-slate-800">
              ${lead.estimatedDealValue}
            </p>
          </div>
        </div>

        {/* Location & License Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{lead.city}, {lead.state}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-600 shrink-0 font-semibold">
            #{lead.licenseNumber}
          </span>
        </div>

        {/* Web Presence & Pipeline Stage Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {/* Web Presence Pill */}
          {lead.websiteAudit ? (
            <button
              onClick={() => onAuditWebsite?.(lead)}
              className="inline-flex items-center gap-1.5 text-left cursor-pointer active:scale-95 transition-transform"
              title="Click to view full web presence qualification audit"
            >
              {!lead.websiteAudit.hasWebsite ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  No Website (Hot Lead)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Has Website
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onAuditWebsite?.(lead)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer shadow-2xs transition-all"
              title="Scan live internet to check if they have a website"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Check Web Presence
            </button>
          )}

          {/* Pipeline Stage Badge */}
          <Badge
            variant={
              lead.outreachStatus === 'Client Won'
                ? 'success'
                : lead.outreachStatus === 'In Discussion'
                ? 'info'
                : lead.outreachStatus === 'Outreach Sent'
                ? 'warning'
                : lead.outreachStatus === 'Site Built'
                ? 'purple'
                : 'default'
            }
            size="sm"
          >
            {lead.outreachStatus}
          </Badge>
        </div>

        {/* Quick Contact & Skip Trace Row */}
        {lead.skipTraceStatus === 'Traced' && lead.skipTraceData ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {lead.skipTraceData.verifiedPhone ? (
              <a
                href={`tel:${lead.skipTraceData.verifiedPhone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors min-h-[44px]"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Call {lead.skipTraceData.verifiedPhone}
              </a>
            ) : (
              <button
                onClick={() => onSkipTrace(lead)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold min-h-[44px]"
              >
                No Phone Traced
              </button>
            )}

            {lead.skipTraceData.primaryEmail ? (
              <a
                href={`mailto:${lead.skipTraceData.primaryEmail}?subject=Turnkey%20website%20for%20your%20new%20practice`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold transition-colors min-h-[44px]"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email Prospect
              </a>
            ) : (
              <button
                onClick={() => onSkipTrace(lead)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold min-h-[44px]"
              >
                No Email Traced
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onSkipTrace(lead)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs min-h-[44px] cursor-pointer active:scale-98 transition-all"
          >
            <Zap className="w-4 h-4 fill-amber-200" />
            {lead.skipTraceStatus === 'In Progress' ? 'Skip Tracing...' : '1-Tap Skip Trace Contact Info'}
          </button>
        )}

        {/* Primary Action Row (Touch friendly with 44px min height) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            onClick={() => onPreviewWebsite(lead)}
            icon={<Globe className="w-4 h-4 text-blue-600" />}
            className="w-full justify-center min-h-[44px]"
          >
            Preview Pitch Site
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onOutreachPitch(lead)}
            icon={<Send className="w-4 h-4" />}
            className="w-full justify-center min-h-[44px]"
          >
            Send Offer
          </Button>
        </div>

        {/* Expandable details toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center justify-center gap-1 cursor-pointer"
        >
          {isExpanded ? (
            <>
              Hide Details <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              More Details & Actions <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Expandable Panel */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600 animate-in fade-in duration-150">
            <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
              <p><strong>Education:</strong> {lead.collegeOrSchool} ({lead.graduationYear})</p>
              <p><strong>Issue Date:</strong> {lead.issueDate}</p>
              {lead.skipTraceData?.currentAddress && (
                <p><strong>Address:</strong> {lead.skipTraceData.currentAddress}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => onSkipTrace(lead)}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View Full Skip Trace Record
              </button>

              <button
                onClick={() => onDeleteLead(lead)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Lead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
