import { SkipTraceResult } from '../types/lead';

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
        color: 'bg-stone-100 text-stone-600 border-stone-200',
      },
    };
  }

  const score = data.confidenceScore;
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let label = `Verified ${score}%`;

  if (score < 85) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
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
