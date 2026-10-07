import { describe, it, expect } from 'vitest';
import { US_STATES, STATE_FILTER_OPTIONS, STATE_MODAL_OPTIONS, getMajorCities } from './states';

describe('US_STATES', () => {
  it('covers all 50 states with unique codes', () => {
    expect(US_STATES).toHaveLength(50);
    expect(new Set(US_STATES.map((s) => s.code)).size).toBe(50);
  });

  it('gives every state a two-letter code, a fullName and a composed name', () => {
    for (const state of US_STATES) {
      expect(state.code).toMatch(/^[A-Z]{2}$/);
      expect(state.fullName.length).toBeGreaterThan(0);
      expect(state.name).toBe(`${state.fullName} (${state.code})`);
    }
  });

  it('lists states alphabetically by fullName so dropdown labels read in order', () => {
    const fullNames = US_STATES.map((s) => s.fullName);
    const sorted = [...fullNames].sort((a, b) => a.localeCompare(b));
    expect(fullNames).toEqual(sorted);
  });

  it('preserves majorCities for the 20 states that had them', () => {
    expect(getMajorCities('AZ')).toContain('Phoenix');
    expect(getMajorCities('CA')).toContain('Los Angeles');
    expect(getMajorCities('NY')).toContain('Brooklyn');
    expect(getMajorCities('OR')).toContain('Bend');
  });

  it('carries city data for exactly the 20 states that had it, with no blank entries', () => {
    const statesWithCities = US_STATES.filter((s) => s.majorCities.length > 0);
    expect(statesWithCities).toHaveLength(20);
    for (const state of statesWithCities) {
      expect(state.majorCities.every((city) => city.trim().length > 0)).toBe(true);
      expect(new Set(state.majorCities).size).toBe(state.majorCities.length);
    }
  });
});

describe('getMajorCities', () => {
  // Review Focus 1
  it('returns an empty array for a state with no city data', () => {
    expect(getMajorCities('WY')).toEqual([]);
    expect(getMajorCities('ZZ')).toEqual([]);
  });

  it('returns an empty array for an empty or lowercase code rather than throwing', () => {
    expect(getMajorCities('')).toEqual([]);
    expect(getMajorCities('az')).toEqual([]);
  });

  it('returns a copy so callers cannot mutate the canonical city list', () => {
    const cities = getMajorCities('AZ');
    cities.push('Not A Real Place');
    expect(getMajorCities('AZ')).not.toContain('Not A Real Place');
  });
});

describe('STATE_FILTER_OPTIONS', () => {
  it('labels filter options by fullName and leads with an all-states entry', () => {
    expect(STATE_FILTER_OPTIONS[0]).toEqual({ value: 'all', label: 'All US States & Territories' });
    expect(STATE_FILTER_OPTIONS).toHaveLength(51);
    expect(STATE_FILTER_OPTIONS).toContainEqual({ value: 'AZ', label: 'Arizona' });
  });
});

describe('STATE_MODAL_OPTIONS', () => {
  it('omits the all-states entry from modal options', () => {
    expect(STATE_MODAL_OPTIONS).toHaveLength(50);
    expect(STATE_MODAL_OPTIONS.map((o) => o.value)).not.toContain('all');
  });

  it('labels modal options with the composed name that includes the code', () => {
    expect(STATE_MODAL_OPTIONS).toContainEqual({ value: 'AZ', label: 'Arizona (AZ)' });
  });
});
