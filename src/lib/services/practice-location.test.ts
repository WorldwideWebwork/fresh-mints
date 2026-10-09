import { describe, it, expect } from 'vitest';
import { cleanLocationPart, formatPracticeLocation } from './practice-location';

describe('cleanLocationPart', () => {
  it('trims surrounding whitespace from a present value', () => {
    expect(cleanLocationPart('  Tempe ')).toBe('Tempe');
  });

  it('returns an empty string for undefined, null and blank input', () => {
    expect(cleanLocationPart(undefined)).toBe('');
    expect(cleanLocationPart(null)).toBe('');
    expect(cleanLocationPart('')).toBe('');
    expect(cleanLocationPart(' \t\n ')).toBe('');
  });
});

describe('formatPracticeLocation', () => {
  it('joins city and state with a comma when both are present', () => {
    expect(formatPracticeLocation('Tempe', 'AZ')).toBe('Tempe, AZ');
  });

  it('returns only the city when the state is missing', () => {
    expect(formatPracticeLocation('Tempe', undefined)).toBe('Tempe');
  });

  it('returns only the state when the city is missing', () => {
    expect(formatPracticeLocation(undefined, 'AZ')).toBe('AZ');
  });

  it('returns an empty string when neither is present, never a dangling comma', () => {
    expect(formatPracticeLocation(undefined, undefined)).toBe('');
  });

  it('treats whitespace-only inputs as missing', () => {
    expect(formatPracticeLocation('   ', 'AZ')).toBe('AZ');
    expect(formatPracticeLocation('Tempe', '\t')).toBe('Tempe');
    expect(formatPracticeLocation('  ', '\n ')).toBe('');
  });

  it('trims each part before joining', () => {
    expect(formatPracticeLocation('  Tempe ', ' AZ  ')).toBe('Tempe, AZ');
  });

  it('treats runtime nulls and empty strings from imported data as missing', () => {
    expect(formatPracticeLocation(null as unknown as string, 'AZ')).toBe('AZ');
    expect(formatPracticeLocation('', '')).toBe('');
  });
});
