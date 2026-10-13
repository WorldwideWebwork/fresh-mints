import type { Lead, SkipTraceResult } from '../types/lead';
import { formatEmailValidation } from './skip-trace';

// Leads saved before #6026, #6042 and #6053 can still hold contact claims that no check
// produced. Nothing displays them any more, but a CSV export writes whatever is stored, so
// stored leads are normalized when they load and again before they are exported.
//
// The patterns are regexes, not literals: verification-labels.test.ts forbids the old wording
// anywhere in source, and a regex also tolerates case and spacing drift in stored text.

const UNKNOWN = 'Unknown';

/** DNC wording stored with no DNC lookup behind it: a clearance, or a directory label parked in the DNC column. */
const LEGACY_DNC_CLAIMS: readonly RegExp[] = [/^clean\b.*\bnot on dnc\b/i, /^public (?:business )?directory$/i];

/** A carrier check older builds claimed for every imported phone. */
const LEGACY_PHONE_TYPE_CLAIMS: readonly RegExp[] = [/^mobile\s*\(carrier\s+verified\)$/i];

/**
 * Scores older builds wrote from a hardcoded constant: Places and NPPES imports (98), the
 * source heuristics in skip-trace enrichment (95, 92, 90, 88), CSV import (95) and the
 * website-audit and skip-trace fallbacks (85, 90, 30). The data model keeps no record of a
 * verification step and no check in the app produces a score today, so one of these exact
 * values is a leftover constant. Any other number is left alone.
 */
const LEGACY_CONFIDENCE_SCORES: ReadonlySet<number> = new Set([98, 95, 92, 90, 88, 85, 30]);

const isLegacyClaim = (text: string | undefined, patterns: readonly RegExp[]): boolean => {
  const value = typeof text === 'string' ? text.trim() : '';
  return patterns.some((pattern) => pattern.test(value));
};

const claimOrUnknown = (text: string, patterns: readonly RegExp[]): string =>
  isLegacyClaim(text, patterns) ? UNKNOWN : text;

const isLegacyScore = (score: number | undefined): boolean =>
  typeof score === 'number' && LEGACY_CONFIDENCE_SCORES.has(score);

/** A stored claim rewritten as what happened. A blank validation is not a claim: it stays blank, and the display formatter reads it as Not checked. */
const honestEmailValidation = (data: SkipTraceResult): string => {
  const stored = typeof data.emailValidation === 'string' ? data.emailValidation.trim() : '';
  const rewritten = formatEmailValidation(data);
  const isRewritten = stored !== '' && rewritten !== stored;
  return isRewritten ? rewritten : data.emailValidation;
};

/** Skip-trace data with legacy invented claims replaced. Returns the same object when nothing changed. */
export function normalizeLegacySkipTrace(data: SkipTraceResult): SkipTraceResult {
  const next: SkipTraceResult = {
    ...data,
    dncStatus: claimOrUnknown(data.dncStatus, LEGACY_DNC_CLAIMS),
    phoneType: claimOrUnknown(data.phoneType, LEGACY_PHONE_TYPE_CLAIMS),
    emailValidation: honestEmailValidation(data),
  };
  const hasLegacyScore = isLegacyScore(data.confidenceScore);
  if (hasLegacyScore) delete next.confidenceScore;

  const isRewritten =
    hasLegacyScore ||
    next.dncStatus !== data.dncStatus ||
    next.phoneType !== data.phoneType ||
    next.emailValidation !== data.emailValidation;
  return isRewritten ? next : data;
}

/** A lead with its skip-trace data normalized. Returns the same object when nothing changed. */
export function normalizeLegacyLead(lead: Lead): Lead {
  const trace = lead.skipTraceData;
  const normalized = trace ? normalizeLegacySkipTrace(trace) : undefined;
  const isRewritten = Boolean(normalized) && normalized !== trace;
  return isRewritten ? { ...lead, skipTraceData: normalized } : lead;
}

export interface LegacyLeadNormalization {
  /** Every lead, in order; untouched leads are the same objects. */
  leads: Lead[];
  /** Only the leads that were rewritten, for persisting once. */
  changed: Lead[];
}

export function normalizeLegacyLeads(leads: Lead[]): LegacyLeadNormalization {
  const normalized = leads.map(normalizeLegacyLead);
  return { leads: normalized, changed: normalized.filter((lead, index) => lead !== leads[index]) };
}
