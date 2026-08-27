import React from 'react';
import {
  Search,
  Globe,
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Calendar,
  ExternalLink,
  PhoneCall,
  Mail,
  Zap,
  Trash2,
} from 'lucide-react';
import { Lead, PROFESSION_CONFIGS } from '../../types/lead';
import { Badge } from '../atoms/Badge';
import { StatusIndicator } from '../atoms/StatusIndicator';

interface LeadRowProps {
  lead: Lead;
  onSkipTrace: (lead: Lead) => void;
  onPreviewWebsite: (lead: Lead) => void;
  onOutreachPitch: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onAuditWebsite?: (lead: Lead) => void;
  isSelected?: boolean;
}

export const LeadRow: React.FC<LeadRowProps> = ({
  lead,
  onSkipTrace,
  onPreviewWebsite,
  onOutreachPitch,
  onSelectLead,
  onDeleteLead,
  onAuditWebsite,
  isSelected = false,
}) => {
  const professionMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;

  // Generate color palette for initials
  const avatarColors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
  ];
  const colorIndex = Math.abs(lead.id.charCodeAt(lead.id.length - 1)) % avatarColors.length;

  return (
    <tr
      id={`lead-row-${lead.id}`}
      className={`hover:bg-slate-50/50 transition-colors cursor-pointer text-sm ${
        isSelected ? 'bg-blue-50/40' : ''
      }`}
      onClick={() => onSelectLead(lead)}
    >
      {/* Graduate & License Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarColors[colorIndex]}`}
          >
            {lead.fullName.charAt(0)}{lead.fullName.split(' ')[1]?.charAt(0) || ''}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">
              {lead.fullName}
            </p>
            <p className="text-xs text-slate-500">{lead.city}, {lead.state}</p>
          </div>
        </div>
      </td>

      {/* Profession & License # */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <Badge variant="info" size="sm">
            {lead.professionTitle}
          </Badge>
          <p className="text-xs text-slate-400 font-mono">#{lead.licenseNumber}</p>
        </div>
      </td>

      {/* Website Presence Audit */}
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        {lead.websiteAudit ? (
          <button
            onClick={() => onAuditWebsite?.(lead)}
            className="flex items-center gap-1.5 text-left group cursor-pointer"
            title="Click to view full web presence qualification audit"
          >
            {!lead.websiteAudit.hasWebsite ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100 group-hover:border-emerald-300 transition-all shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                No Website (Hot Lead)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-100 group-hover:border-amber-300 transition-all shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Has Website
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => onAuditWebsite?.(lead)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 transition-all py-1.5 px-3 rounded-xl cursor-pointer shadow-2xs group"
            title="Run live Google Search & domain check to verify website presence"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            Check Website
          </button>
        )}
      </td>

      {/* Skip Trace Profile */}
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        {lead.skipTraceStatus === 'Traced' && lead.skipTraceData ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <div>
              <span className="text-xs text-slate-700 font-semibold block">
                {lead.skipTraceData.verifiedPhone || 'No Phone on Record'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                {lead.skipTraceData.primaryEmail || 'No Email on Record'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            <button
              onClick={() => onSkipTrace(lead)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              Skip Trace Lead
            </button>
          </div>
        )}
      </td>

      {/* Pipeline Stage */}
      <td className="px-6 py-4">
        <StatusIndicator status={lead.outreachStatus} />
      </td>

      {/* Action Buttons */}
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={() => onPreviewWebsite(lead)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
            title="Preview custom pitch site"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            Website
          </button>
          <button
            onClick={() => onOutreachPitch(lead)}
            className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100"
          >
            <Send className="w-3 h-3" />
            Offer
          </button>
          <button
            onClick={() => onDeleteLead(lead)}
            className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
            title="Delete this lead"
            aria-label={`Delete ${lead.fullName}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
