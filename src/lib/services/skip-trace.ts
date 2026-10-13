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

const UNVERIFIED_COLOR = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
const SOURCED_COLOR = 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
const MODERATE_COLOR = 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
const VERIFIED_COLOR = 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

/** A score counts only when a verification step produced a positive number. */
export function getConfidenceScore(data?: SkipTraceResult): number | null {
  const score = data?.confidenceScore;
  return typeof score === 'number' && Number.isFinite(score) && score > 0 ? Math.round(score) : null;
}

export function formatConfidenceBadge(data?: SkipTraceResult): SkipTraceSummary['confidenceBadge'] {
  const score = getConfidenceScore(data);
  if (score !== null) {
    return score >= 85
      ? { label: `Verified ${score}%`, color: VERIFIED_COLOR }
      : { label: `Moderate ${score}%`, color: MODERATE_COLOR };
  }

  const source = data?.phoneSource?.trim();
  if (source) {
    return { label: `Source: ${source}`, color: SOURCED_COLOR };
  }
  return { label: 'Unverified', color: UNVERIFIED_COLOR };
}

/** Phone type plus its score when one exists, else its source. Never invents either. */
export function formatPhoneLabel(data: SkipTraceResult): string {
  const type = data.phoneType?.trim() || 'Phone';
  const score = getConfidenceScore(data);
  if (score !== null) return `${type} (${score}%)`;
  const source = data.phoneSource?.trim();
  return source ? `${type} (${source})` : type;
}

export function formatSkipTraceSummary(data?: SkipTraceResult): SkipTraceSummary {
  if (!data) {
    return {
      phoneFormatted: 'Not Traced',
      emailFormatted: 'Not Traced',
      linkedInFormatted: 'Not Traced',
      confidenceBadge: formatConfidenceBadge(),
    };
  }

  return {
    phoneFormatted: data.verifiedPhone || 'No Phone Found',
    emailFormatted: data.primaryEmail || 'No Email Found',
    linkedInFormatted: data.linkedInUrl || 'No LinkedIn',
    confidenceBadge: formatConfidenceBadge(data),
  };
}

export function copyContactToClipboard(data: SkipTraceResult): string {
  const text = `Contact: ${data.primaryEmail} | Phone: ${data.verifiedPhone} | Address: ${data.currentAddress} | LinkedIn: ${data.linkedInUrl || 'N/A'}`;
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  return text;
}
