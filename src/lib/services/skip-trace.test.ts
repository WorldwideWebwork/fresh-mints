import { describe, it, expect } from 'vitest';
import type { SkipTraceResult } from '../types/lead';
import {
  formatConfidenceBadge,
  formatPhoneLabel,
  formatSkipTraceSummary,
  getConfidenceScore,
} from './skip-trace';

const makeTrace = (overrides: Partial<SkipTraceResult> = {}): SkipTraceResult => ({
  verifiedPhone: '(555) 010-0100',
  phoneType: 'Google Business Line',
  dncStatus: 'Public Business Directory',
  primaryEmail: '',
  emailValidation: 'Unverified',
  currentAddress: 'Albany, NY',
  enrichmentNotes: '',
  ...overrides,
});

describe('getConfidenceScore', () => {
  it('returns null when no verification produced a score', () => {
    expect(getConfidenceScore(undefined)).toBeNull();
    expect(getConfidenceScore(makeTrace())).toBeNull();
  });

  it('treats zero, negative and non-finite values as no score', () => {
    expect(getConfidenceScore(makeTrace({ confidenceScore: 0 }))).toBeNull();
    expect(getConfidenceScore(makeTrace({ confidenceScore: -5 }))).toBeNull();
    expect(getConfidenceScore(makeTrace({ confidenceScore: Number.NaN }))).toBeNull();
  });

  it('returns a rounded score when one exists', () => {
    expect(getConfidenceScore(makeTrace({ confidenceScore: 91.4 }))).toBe(91);
  });
});

describe('formatConfidenceBadge', () => {
  it('never says Verified for a phone that only has a source', () => {
    const badge = formatConfidenceBadge(makeTrace({ phoneSource: 'Google Places' }));

    expect(badge.label).toBe('Source: Google Places');
    expect(badge.label).not.toMatch(/verified/i);
    expect(badge.label).not.toMatch(/\d+%/);
  });

  it('says Unverified when there is neither a score nor a source', () => {
    expect(formatConfidenceBadge(makeTrace()).label).toBe('Unverified');
    expect(formatConfidenceBadge(undefined).label).toBe('Unverified');
  });

  it('ignores a blank source', () => {
    expect(formatConfidenceBadge(makeTrace({ phoneSource: '   ' })).label).toBe('Unverified');
  });

  it('says Verified only for a real score of 85 or more', () => {
    expect(formatConfidenceBadge(makeTrace({ confidenceScore: 85 })).label).toBe('Verified 85%');
    expect(formatConfidenceBadge(makeTrace({ confidenceScore: 97 })).label).toBe('Verified 97%');
  });

  it('says Moderate for a real score below 85', () => {
    expect(formatConfidenceBadge(makeTrace({ confidenceScore: 84 })).label).toBe('Moderate 84%');
  });

  it('lets a real score win over the source label', () => {
    const badge = formatConfidenceBadge(makeTrace({ confidenceScore: 92, phoneSource: 'Yelp' }));

    expect(badge.label).toBe('Verified 92%');
  });
});

describe('formatPhoneLabel', () => {
  it('shows the phone type and its source when there is no score', () => {
    expect(formatPhoneLabel(makeTrace({ phoneSource: 'Google Places' }))).toBe(
      'Google Business Line (Google Places)',
    );
  });

  it('shows the phone type and its score when a verification produced one', () => {
    expect(formatPhoneLabel(makeTrace({ confidenceScore: 90 }))).toBe('Google Business Line (90%)');
  });

  it('falls back to a neutral label, never to a Verified claim', () => {
    const label = formatPhoneLabel(makeTrace({ phoneType: '' }));

    expect(label).toBe('Phone');
    expect(label).not.toMatch(/verified/i);
  });

  it('shows an Unknown phone type as Unknown, never as mobile or carrier verified', () => {
    const label = formatPhoneLabel(
      makeTrace({ phoneType: 'Unknown', dncStatus: 'Unknown', phoneSource: 'CSV import' }),
    );

    expect(label).toBe('Unknown (CSV import)');
    expect(label).not.toMatch(/mobile|carrier|verified|clean/i);
  });
});

describe('formatSkipTraceSummary', () => {
  it('reports Not Traced and Unverified with no data', () => {
    const summary = formatSkipTraceSummary();

    expect(summary.phoneFormatted).toBe('Not Traced');
    expect(summary.confidenceBadge.label).toBe('Unverified');
  });

  it('labels a Google Places phone by its source and keeps the phone', () => {
    const summary = formatSkipTraceSummary(makeTrace({ phoneSource: 'Google Places' }));

    expect(summary.phoneFormatted).toBe('(555) 010-0100');
    expect(summary.confidenceBadge.label).toBe('Source: Google Places');
  });

  it('keeps the placeholder text for missing contact fields', () => {
    const summary = formatSkipTraceSummary(makeTrace({ verifiedPhone: '' }));

    expect(summary.phoneFormatted).toBe('No Phone Found');
    expect(summary.emailFormatted).toBe('No Email Found');
    expect(summary.linkedInFormatted).toBe('No LinkedIn');
  });
});
