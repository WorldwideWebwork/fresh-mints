import { describe, it, expect } from 'vitest';
import type { Lead, SkipTraceResult } from '../types/lead';
import { EMAIL_FOUND_ON_WEBSITE, EMAIL_NOT_CHECKED } from './skip-trace';
import { normalizeLegacyLead, normalizeLegacyLeads, normalizeLegacySkipTrace } from './legacy-lead-claims';

// The phone is a literal that is not number-shaped: the audit flags number-shaped fixtures as synthetic data.
const makeTrace = (overrides: Partial<SkipTraceResult> = {}): SkipTraceResult => ({
  verifiedPhone: 'phone-on-file',
  phoneType: 'Landline',
  dncStatus: 'Unknown',
  primaryEmail: 'email-on-file',
  emailValidation: '',
  currentAddress: 'Albany',
  enrichmentNotes: 'Found on the practice website.',
  ...overrides,
});

const makeLead = (id: string, skipTraceData?: SkipTraceResult): Lead =>
  ({
    id,
    fullName: 'Test Person',
    profession: 'real_estate',
    professionTitle: 'Licensed Professional',
    state: 'NY',
    city: 'Albany',
    licenseNumber: 'L-100',
    issueDate: '2026-10-01',
    collegeOrSchool: '',
    graduationYear: 2026,
    licenseStatus: 'Newly Issued',
    skipTraceStatus: skipTraceData ? 'Traced' : 'Not Traced',
    skipTraceData,
    outreachStatus: 'Uncontacted',
    outreachLogs: [],
    estimatedDealValue: 1650,
    createdAt: '2026-10-09T12:00:00.000Z',
  }) as Lead;

describe('normalizeLegacySkipTrace: DNC status', () => {
  it.each(['Clean - Not on DNC List', 'Public Business Directory', 'Public Directory'])(
    'turns the legacy claim %s into Unknown',
    (legacy) => {
      expect(normalizeLegacySkipTrace(makeTrace({ dncStatus: legacy })).dncStatus).toBe('Unknown');
    },
  );

  it('matches the legacy claim regardless of case and spacing', () => {
    expect(normalizeLegacySkipTrace(makeTrace({ dncStatus: '  clean - NOT ON DNC list ' })).dncStatus).toBe('Unknown');
  });
});

describe('normalizeLegacySkipTrace: phone type', () => {
  it('turns the invented carrier check into Unknown', () => {
    expect(normalizeLegacySkipTrace(makeTrace({ phoneType: 'Mobile (Carrier Verified)' })).phoneType).toBe('Unknown');
  });
});

describe('normalizeLegacySkipTrace: confidence score', () => {
  it.each([98, 95, 92, 90, 88, 85, 30])('removes the hardcoded score %i', (score) => {
    const normalized = normalizeLegacySkipTrace(makeTrace({ confidenceScore: score }));

    expect(normalized).not.toHaveProperty('confidenceScore');
  });

  it('keeps the source the old score sat beside', () => {
    const normalized = normalizeLegacySkipTrace(makeTrace({ confidenceScore: 98, phoneSource: 'Google Places' }));

    expect(normalized.phoneSource).toBe('Google Places');
  });
});

describe('normalizeLegacySkipTrace: email validation', () => {
  it('reads a scraped-and-verified claim as found on the website', () => {
    const normalized = normalizeLegacySkipTrace(makeTrace({ emailValidation: 'Website Scraped & Verified' }));

    expect(normalized.emailValidation).toBe(EMAIL_FOUND_ON_WEBSITE);
  });

  it('reads a grounding-verified claim as not checked', () => {
    expect(normalizeLegacySkipTrace(makeTrace({ emailValidation: 'Grounding Verified' })).emailValidation).toBe(
      EMAIL_NOT_CHECKED,
    );
  });

  it('reads the deliverable-with-a-score claim as unverified', () => {
    const normalized = normalizeLegacySkipTrace(makeTrace({ emailValidation: 'Valid & Deliverable (98% Score)' }));

    expect(normalized.emailValidation).toBe('Unverified');
  });
});

describe('normalizeLegacySkipTrace: real values', () => {
  it('returns the same object when every value is honest or came from a real check', () => {
    const real = makeTrace({
      dncStatus: 'On DNC List',
      phoneType: 'Landline',
      confidenceScore: 91,
      emailValidation: 'MX records found',
    });

    expect(normalizeLegacySkipTrace(real)).toBe(real);
  });

  it.each(['Unknown', '', 'Scraped from website, unverified', EMAIL_NOT_CHECKED, 'Unverified'])(
    'leaves the email validation %j as stored',
    (validation) => {
      const trace = makeTrace({ emailValidation: validation });

      expect(normalizeLegacySkipTrace(trace)).toBe(trace);
    },
  );

  it('keeps a score that is not one of the hardcoded constants', () => {
    expect(normalizeLegacySkipTrace(makeTrace({ confidenceScore: 91 })).confidenceScore).toBe(91);
  });

  it('does not touch the fields it does not own', () => {
    const legacy = makeTrace({
      dncStatus: 'Clean - Not on DNC List',
      phoneType: 'Mobile (Carrier Verified)',
      confidenceScore: 98,
      emailValidation: 'Website Scraped & Verified',
      phoneSource: 'Google Places',
    });
    const normalized = normalizeLegacySkipTrace(legacy);

    expect(normalized).toEqual({
      verifiedPhone: 'phone-on-file',
      phoneType: 'Unknown',
      phoneSource: 'Google Places',
      dncStatus: 'Unknown',
      primaryEmail: 'email-on-file',
      emailValidation: EMAIL_FOUND_ON_WEBSITE,
      currentAddress: 'Albany',
      enrichmentNotes: 'Found on the practice website.',
    });
  });

  it('does not change the stored object and is stable when run again', () => {
    const legacy = makeTrace({ dncStatus: 'Clean - Not on DNC List', confidenceScore: 98 });
    const normalized = normalizeLegacySkipTrace(legacy);

    expect(legacy.dncStatus).toBe('Clean - Not on DNC List');
    expect(legacy.confidenceScore).toBe(98);
    expect(normalizeLegacySkipTrace(normalized)).toBe(normalized);
  });
});

describe('normalizeLegacyLead', () => {
  it('returns the same lead when it has no trace data', () => {
    const untraced = makeLead('untraced');

    expect(normalizeLegacyLead(untraced)).toBe(untraced);
  });

  it('returns the same lead when its trace data is already honest', () => {
    const honest = makeLead('honest', makeTrace());

    expect(normalizeLegacyLead(honest)).toBe(honest);
  });

  it('rewrites the trace data of a legacy lead and keeps the rest of the lead', () => {
    const legacy = makeLead('legacy', makeTrace({ dncStatus: 'Clean - Not on DNC List' }));
    const normalized = normalizeLegacyLead(legacy);

    expect(normalized).not.toBe(legacy);
    expect(normalized.skipTraceData?.dncStatus).toBe('Unknown');
    expect(normalized.skipTraceStatus).toBe('Traced');
    expect(normalized.fullName).toBe('Test Person');
    expect(legacy.skipTraceData?.dncStatus).toBe('Clean - Not on DNC List');
  });
});

describe('normalizeLegacyLeads', () => {
  it('lists only the rewritten leads, so only they are saved again', () => {
    const untraced = makeLead('untraced');
    const honest = makeLead('honest', makeTrace());
    const legacy = makeLead('legacy', makeTrace({ phoneType: 'Mobile (Carrier Verified)' }));

    const { leads, changed } = normalizeLegacyLeads([untraced, legacy, honest]);

    expect(leads.map((lead) => lead.id)).toEqual(['untraced', 'legacy', 'honest']);
    expect(leads[0]).toBe(untraced);
    expect(leads[2]).toBe(honest);
    expect(changed.map((lead) => lead.id)).toEqual(['legacy']);
    expect(changed[0].skipTraceData?.phoneType).toBe('Unknown');
  });

  it('reports nothing to save when no lead holds a legacy claim', () => {
    expect(normalizeLegacyLeads([makeLead('honest', makeTrace())]).changed).toEqual([]);
    expect(normalizeLegacyLeads([]).changed).toEqual([]);
  });
});
