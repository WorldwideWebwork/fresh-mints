import React from 'react';
import { Phone, Mail, MapPin, Linkedin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SkipTraceResult } from '../../types/lead';
import { copyContactToClipboard } from '../../services/skip-trace';

interface ContactBadgeListProps {
  data?: SkipTraceResult;
  onCopySuccess?: () => void;
}

export const ContactBadgeList: React.FC<ContactBadgeListProps> = ({ data, onCopySuccess }) => {
  if (!data) {
    return (
      <div className="text-xs text-stone-400 italic flex items-center gap-1.5">
        <span>No skip-trace contact profile available yet.</span>
      </div>
    );
  }

  const handleCopy = () => {
    copyContactToClipboard(data);
    if (onCopySuccess) onCopySuccess();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {data.verifiedPhone ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium">
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>{data.verifiedPhone}</span>
        </span>
      ) : null}

      {data.primaryEmail ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-md font-medium">
          <Mail className="w-3.5 h-3.5 text-sky-600" />
          <span>{data.primaryEmail}</span>
        </span>
      ) : null}

      {data.linkedInUrl && (
        <a
          href={`https://${data.linkedInUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-medium hover:bg-blue-100 transition-colors"
        >
          <Linkedin className="w-3.5 h-3.5 text-blue-600" />
          <span>LinkedIn</span>
        </a>
      )}

      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[11px]">
        <MapPin className="w-3 h-3" />
        <span>{data.currentAddress}</span>
      </span>

      <button
        onClick={handleCopy}
        className="text-[11px] font-medium text-stone-500 hover:text-stone-900 underline ml-auto transition-colors"
        title="Copy full skip trace report"
      >
        Copy Info
      </button>
    </div>
  );
};
