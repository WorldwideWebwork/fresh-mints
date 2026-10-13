import { describe, it, expect } from 'vitest';
import type { SkipTraceResult } from '../types/lead';
import {
  EMAIL_FOUND_ON_WEBSITE,
  EMAIL_GUESSED_FROM_DOMAIN,
  EMAIL_NOT_CHECKED,
  formatConfidenceBadge,
  formatEmailValidation,
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

describe('formatEmailValidation', () => {
  it('reads Not checked when no validation ran, never a verified state', () => {
    expect(formatEmailValidation(undefined)).toBe(EMAIL_NOT_CHECKED);
    expect(formatEmailValidation(makeTrace({ emailValidation: '' }))).toBe('Not checked');
    expect(formatEmailValidation(makeTrace({ emailValidation: '   ' }))).toBe('Not checked');
    expect(EMAIL_NOT_CHECKED).not.toMatch(/verified|valid|clean/i);
  });

  it('keeps an honest stored value as it is', () => {
    expect(formatEmailValidation(makeTrace({ emailValidation: 'Unverified' }))).toBe('Unverified');
    expect(formatEmailValidation(makeTrace({ emailValidation: 'No email located' }))).toBe('No email located');
    expect(formatEmailValidation(makeTrace({ emailValidation: EMAIL_FOUND_ON_WEBSITE }))).toBe(EMAIL_FOUND_ON_WEBSITE);
  });

  it('shows a scraped email as found on the website and unverified', () => {
    expect(EMAIL_FOUND_ON_WEBSITE).toBe('Found on website, not verified');
    expect(EMAIL_GUESSED_FROM_DOMAIN).toBe('Guessed from domain, not verified');
  });

  it('rewrites the claims older builds stored without any check', () => {
    const scraped = makeTrace({ emailValidation: 'Website Scraped & Verified' });
    const grounding = makeTrace({ emailValidation: 'Grounding Verified' });
    const csv = makeTrace({ emailValidation: 'Valid & Deliverable (98% Score)' });

    expect(formatEmailValidation(scraped)).toBe(EMAIL_FOUND_ON_WEBSITE);
    expect(formatEmailValidation(grounding)).toBe(EMAIL_NOT_CHECKED);
    expect(formatEmailValidation(csv)).toBe('Unverified');
  });

  it('turns every old claim into wording that says no check ran', () => {
    const honest = [EMAIL_FOUND_ON_WEBSITE, EMAIL_NOT_CHECKED, 'Unverified'];
    const stored = ['Website Scraped & Verified', 'Grounding Verified', 'Valid & Deliverable (98% Score)'];

    for (const emailValidation of stored) {
      expect(honest).toContain(formatEmailValidation(makeTrace({ emailValidation })));
    }
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
