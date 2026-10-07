import { describe, it, expect } from 'vitest';
import { US_STATES, STATE_FILTER_OPTIONS, STATE_MODAL_OPTIONS, getMajorCities } from './states';

const EXPECTED_FULL_NAMES_BY_CODE: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

describe('US_STATES', () => {
  it('covers all 50 states with unique codes', () => {
    expect(US_STATES).toHaveLength(50);
    expect(new Set(US_STATES.map((s) => s.code)).size).toBe(50);
  });

  // External reference data: a literal table is the right oracle, not a tautology.
  it('maps every USPS state code to its exact fullName', () => {
    const fullNamesByCode = Object.fromEntries(US_STATES.map((s) => [s.code, s.fullName]));
    expect(fullNamesByCode).toEqual(EXPECTED_FULL_NAMES_BY_CODE);
  });

  it('never repeats a fullName under a different code', () => {
    const fullNames = US_STATES.map((s) => s.fullName);
    expect(new Set(fullNames).size).toBe(fullNames.length);
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

  it('returns the curated cities for states that carry them', () => {
    expect(getMajorCities('AZ')).toContain('Phoenix');
    expect(getMajorCities('CA')).toContain('Los Angeles');
    expect(getMajorCities('NY')).toContain('Brooklyn');
    expect(getMajorCities('OR')).toContain('Bend');
  });

  it('keeps every majorCities list well formed: an array, no blank or duplicate cities', () => {
    for (const state of US_STATES) {
      expect(Array.isArray(state.majorCities)).toBe(true);
      expect(state.majorCities.every((city) => city.trim().length > 0)).toBe(true);
      expect(new Set(state.majorCities).size).toBe(state.majorCities.length);
    }
  });

  it('still carries curated city data for at least one state', () => {
    expect(US_STATES.some((s) => s.majorCities.length > 0)).toBe(true);
  });
});

describe('getMajorCities', () => {
  it('returns an empty array for a code that is not a state', () => {
    expect(getMajorCities('ZZ')).toEqual([]);
  });

  it('returns an empty array for every state that carries no city data', () => {
    const statesWithoutCities = US_STATES.filter((s) => s.majorCities.length === 0);
    for (const state of statesWithoutCities) {
      expect(getMajorCities(state.code)).toEqual([]);
    }
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
