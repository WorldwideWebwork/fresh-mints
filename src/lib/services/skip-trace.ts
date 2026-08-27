import type { SkipTraceResult } from '../types/lead';

export interface SkipTraceSummary {
  phoneFormatted: string;
  emailFormatted: string;
  linkedInFormatted: string;
  confidenceBadge: {
    label: string;
    color: string;
  };
}

export function formatSkipTraceSummary(data?: SkipTraceResult): SkipTraceSummary {
  if (!data) {
    return {
      phoneFormatted: 'Not Traced',
      emailFormatted: 'Not Traced',
      linkedInFormatted: 'Not Traced',
      confidenceBadge: {
        label: 'Unverified',
        color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      },
    };
  }

  const score = data.confidenceScore;
  let badgeColor = 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  let label = `Verified ${score}%`;

  if (score < 85) {
    badgeColor = 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    label = `Moderate ${score}%`;
  }

  return {
    phoneFormatted: data.verifiedPhone || 'No Phone Found',
    emailFormatted: data.primaryEmail || 'No Email Found',
    linkedInFormatted: data.linkedInUrl || 'No LinkedIn',
    confidenceBadge: {
      label,
      color: badgeColor,
    },
  };
}

export function copyContactToClipboard(data: SkipTraceResult): string {
  const text = `Contact: ${data.primaryEmail} | Phone: ${data.verifiedPhone} | Address: ${data.currentAddress} | LinkedIn: ${data.linkedInUrl || 'N/A'}`;
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  return text;
}
