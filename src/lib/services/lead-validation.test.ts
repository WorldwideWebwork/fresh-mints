import { describe, it, expect } from 'vitest';
import type { Lead } from '../types/lead';
import { getProfessionConfig } from '../types/profession';
import { validateNewLead } from './lead-validation';

const valid = { fullName: 'Jane Doe', profession: 'nursing', state: 'CA', city: 'Fresno', licenseNumber: 'RN-99001' } as const;

const FIXED_NOW = new Date('2026-10-07T12:00:00.000Z');

// Existing leads only matter here by licenseNumber; this keeps the casts in one place.
const leadsWith = (rows: Array<Partial<Lead>>): Lead[] => rows as Lead[];

describe('validateNewLead', () => {
  it('accepts a complete lead and defaults its deal value from the profession', () => {
    const res = validateNewLead({ ...valid }, []);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.lead.estimatedDealValue).toBeGreaterThan(0);
  });

  it('requires fullName, profession, state and licenseNumber', () => {
    const res = validateNewLead({ city: 'Fresno' }, []);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(Object.keys(res.errors).sort()).toEqual(['fullName', 'licenseNumber', 'profession', 'state']);
  });

  // Review Focus 4
  it('rejects a licenseNumber that already exists', () => {
    const existing = leadsWith([{ licenseNumber: 'RN-99001' }]);
    const res = validateNewLead({ ...valid }, existing);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.licenseNumber).toMatch(/already/i);
  });

  it('rejects a state code that is not a real US state', () => {
    const res = validateNewLead({ ...valid, state: 'ZZ' }, []);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.state).toBeTruthy();
  });

  describe('required fields', () => {
    it('treats whitespace-only values as missing', () => {
      const res = validateNewLead({ ...valid, fullName: '   ', licenseNumber: '\t' }, []);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(Object.keys(res.errors).sort()).toEqual(['fullName', 'licenseNumber']);
    });

    it('does not require city', () => {
      const { city: _city, ...withoutCity } = valid;
      expect(validateNewLead(withoutCity, []).ok).toBe(true);
    });
  });

  describe('profession', () => {
    it('rejects a profession key that is not configured instead of falling back to real estate', () => {
      const res = validateNewLead({ ...valid, profession: 'astronaut' as any }, []);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.errors.profession).toBeTruthy();
    });

    it('takes the default deal value from that profession config', () => {
      const res = validateNewLead({ ...valid, profession: 'dental' }, []);
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.lead.estimatedDealValue).toBe(getProfessionConfig('dental').averageWebsiteValue);
    });

    it('keeps a positive deal value supplied by the caller', () => {
      const res = validateNewLead({ ...valid, estimatedDealValue: 9000 }, []);
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.lead.estimatedDealValue).toBe(9000);
    });

    it('replaces a non-positive deal value with the profession default', () => {
      const res = validateNewLead({ ...valid, estimatedDealValue: 0 }, []);
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.lead.estimatedDealValue).toBe(getProfessionConfig('nursing').averageWebsiteValue);
    });
  });

  describe('state', () => {
    it('normalises a lowercase or padded state code to uppercase', () => {
      const res = validateNewLead({ ...valid, state: ' ca ' }, []);
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.lead.state).toBe('CA');
    });

    it('accepts every state code in the canonical list, not just California', () => {
      const res = validateNewLead({ ...valid, state: 'WY' }, []);
      expect(res.ok).toBe(true);
    });
  });

  describe('duplicate licenseNumber', () => {
    it('ignores case and surrounding whitespace when comparing', () => {
      const existing = leadsWith([{ licenseNumber: ' rn-99001 ' }]);
      const res = validateNewLead({ ...valid }, existing);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.errors.licenseNumber).toMatch(/already/i);
    });

    it('accepts a licenseNumber that differs from every existing lead', () => {
      const existing = leadsWith([{ licenseNumber: 'RN-11111' }, { licenseNumber: 'RN-22222' }]);
      expect(validateNewLead({ ...valid }, existing).ok).toBe(true);
    });

    it('tolerates existing leads that carry no licenseNumber', () => {
      const existing = leadsWith([{}, { licenseNumber: undefined }]);
      expect(validateNewLead({ ...valid }, existing).ok).toBe(true);
    });
  });

  describe('issueDate', () => {
    it('accepts a real ISO calendar date', () => {
      const res = validateNewLead({ ...valid, issueDate: '2026-08-20' }, []);
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.lead.issueDate).toBe('2026-08-20');
    });

    it('rejects text that is not an ISO date', () => {
      const res = validateNewLead({ ...valid, issueDate: '08/20/2026' }, []);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.errors.issueDate).toBeTruthy();
    });

    it('rejects an ISO-shaped date that does not exist on the calendar', () => {
      const res = validateNewLead({ ...valid, issueDate: '2026-02-30' }, []);
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.errors.issueDate).toBeTruthy();
    });
  });

  describe('result lead', () => {
    it('marks the lead as manually entered and stamps createdAt from the supplied clock', () => {
      const res = validateNewLead({ ...valid }, [], FIXED_NOW);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.lead.leadSource).toBe('manual');
        expect(res.lead.createdAt).toBe('2026-10-07T12:00:00.000Z');
      }
    });

    it('trims text fields it returns', () => {
      const res = validateNewLead({ ...valid, fullName: '  Jane Doe ', city: ' Fresno ', licenseNumber: ' RN-99001 ' }, []);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.lead.fullName).toBe('Jane Doe');
        expect(res.lead.city).toBe('Fresno');
        expect(res.lead.licenseNumber).toBe('RN-99001');
      }
    });

    it('leaves blank optional fields out rather than inventing values for them', () => {
      const res = validateNewLead({ fullName: 'Jane Doe', profession: 'nursing', state: 'CA', licenseNumber: 'RN-99001', city: '  ', collegeOrSchool: '', issueDate: '' }, []);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.lead).not.toHaveProperty('city');
        expect(res.lead).not.toHaveProperty('collegeOrSchool');
        expect(res.lead).not.toHaveProperty('issueDate');
        expect(res.lead).not.toHaveProperty('graduationYear');
      }
    });

    it('does not mutate its input', () => {
      const input = { ...valid, fullName: ' Jane Doe ' };
      const snapshot = { ...input };
      validateNewLead(input, []);
      expect(input).toEqual(snapshot);
    });
  });
});
