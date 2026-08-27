import React, { useState } from 'react';
import {
  X,
  Zap,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Lead } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { copyContactToClipboard } from '../../services/skip-trace';

interface SkipTraceModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onRunSkipTrace: (leadId: string) => Promise<void>;
}

export const SkipTraceModal: React.FC<SkipTraceModalProps> = ({
  lead,
  isOpen,
  onClose,
  onRunSkipTrace,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lead) return null;

  const handleRunTrace = async () => {
    setIsLoading(true);
    await onRunSkipTrace(lead.id);
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (lead.skipTraceData) {
      copyContactToClipboard(lead.skipTraceData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const trace = lead.skipTraceData;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">Skip-Trace Contact Profile</h2>
                {trace && (
                  <Badge variant="success" size="sm">
                    {trace.confidenceScore}% Verification Score
                  </Badge>
                )}
              </div>
              <p className="text-xs text-stone-500">
                Public Record & License Registry Enrichment for <strong>{lead.fullName}</strong> ({lead.professionTitle})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Graduate Summary Card */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-stone-400 block font-semibold uppercase text-[10px]">License Number</span>
              <span className="font-mono font-bold text-stone-800">{lead.licenseNumber}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-semibold uppercase text-[10px]">Location</span>
              <span className="font-medium text-stone-800">{lead.city}, {lead.state}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-semibold uppercase text-[10px]">Institution</span>
              <span className="font-medium text-stone-800 truncate block">{lead.collegeOrSchool}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-semibold uppercase text-[10px]">License Date</span>
              <span className="font-medium text-stone-800">{lead.issueDate}</span>
            </div>
          </div>

          {trace ? (
            <div className="space-y-4">
              {/* Phone Records */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Verified Phone Details
                  </span>
                  <Badge variant={trace.verifiedPhone ? "success" : "neutral"}>
                    {trace.verifiedPhone ? trace.dncStatus : "No Phone on File"}
                  </Badge>
                </div>
                {trace.verifiedPhone ? (
                  <div className="flex items-center justify-between bg-emerald-50/60 rounded-lg p-3 text-sm">
                    <div>
                      <span className="font-mono font-bold text-emerald-950 text-base">{trace.verifiedPhone}</span>
                      <span className="text-xs text-emerald-700 block mt-0.5">{trace.phoneType}</span>
                    </div>
                    <a
                      href={`tel:${trace.verifiedPhone}`}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-xs"
                    >
                      Call Now
                    </a>
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500 italic">
                    No verified direct phone number found in public registry or search results.
                  </div>
                )}
              </div>

              {/* Email Records */}
              <div className="border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-sky-600" />
                    Email Addresses & Validation
                  </span>
                  <Badge variant={trace.primaryEmail ? "success" : "neutral"}>
                    {trace.primaryEmail ? "Verified" : "Unlisted"}
                  </Badge>
                </div>
                {trace.primaryEmail ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between bg-sky-50/60 rounded-lg p-3">
                      <div>
                        <span className="font-semibold text-sky-950 block">{trace.primaryEmail}</span>
                        <span className="text-xs text-sky-700 font-medium">{trace.emailValidation}</span>
                      </div>
                      <a
                        href={`mailto:${trace.primaryEmail}`}
                        className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-md shadow-xs"
                      >
                        Compose Email
                      </a>
                    </div>

                    {trace.secondaryEmail && (
                      <div className="flex items-center justify-between bg-stone-50 rounded-lg p-2.5 text-xs text-stone-600">
                        <span>Secondary Work Email: <strong>{trace.secondaryEmail}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500 italic">
                    No direct email address published in public registry records.
                  </div>
                )}
              </div>

              {/* Address & Social Footprint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-stone-200 rounded-xl p-4 space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    Current Residence / Office
                  </span>
                  <p className="text-xs text-stone-800 font-medium leading-relaxed">{trace.currentAddress}</p>
                </div>

                <div className="border border-stone-200 rounded-xl p-4 space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    Social Handles
                  </span>
                  <div className="text-xs space-y-1">
                    {trace.linkedInUrl && (
                      <a
                        href={`https://${trace.linkedInUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 font-semibold hover:underline block truncate flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {trace.linkedInUrl}
                      </a>
                    )}
                    {trace.instagramHandle && (
                      <span className="text-pink-700 font-semibold block">{trace.instagramHandle}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enrichment Notes */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
                <strong className="block font-semibold mb-1">Skip-Trace Verification Notes:</strong>
                {trace.enrichmentNotes}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-stone-900">This lead has not been skip-traced yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Run our public record enrichment engine to uncover mobile phone numbers, verified emails, LinkedIn profile, and residence history.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleRunTrace}
                isLoading={isLoading}
                icon={<Zap className="w-4 h-4 text-amber-300" />}
              >
                Run Skip Trace Now
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          {trace ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCopy} icon={<Copy className="w-3.5 h-3.5" />}>
                {copied ? 'Copied to Clipboard!' : 'Copy Contact Summary'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRunTrace}
                isLoading={isLoading}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Re-Run Skip Trace
              </Button>
            </>
          ) : (
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
