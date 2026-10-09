import { describe, it, expect } from 'vitest';
import {
  CREDENTIAL_PLACEHOLDERS,
  buildCredentialRows,
  cleanGraduationYear,
  cleanText,
  describeCredentialsHeading,
  formatLicenseFooter,
  readPracticeCredentials,
} from './practice-credentials';

const EMPTY_CREDENTIALS = { licenseNumber: '', school: '', graduationYear: '', licenseStatus: '' };

const FULL_CREDENTIALS = {
  licenseNumber: 'TX-55012',
  school: 'UT Health San Antonio',
  graduationYear: '2019',
  licenseStatus: 'Active Board Pass',
};

describe('cleanText', () => {
  it('trims surrounding whitespace from a present value', () => {
    expect(cleanText('  TX-55012 ')).toBe('TX-55012');
  });

  it('returns an empty string for undefined, null, blanks and non-strings', () => {
    for (const value of [undefined, null, '', ' \t\n ', 42, {}]) {
      expect(cleanText(value)).toBe('');
    }
  });
});

describe('cleanGraduationYear', () => {
  it('returns a four-digit year as text', () => {
    expect(cleanGraduationYear(2019)).toBe('2019');
    expect(cleanGraduationYear(' 2019 ')).toBe('2019');
  });

  it('treats missing, zero and malformed years as missing', () => {
    for (const value of [undefined, null, 0, NaN, '', '  ', 'soon', 19.5, 123, 20190]) {
      expect(cleanGraduationYear(value)).toBe('');
    }
  });
});

describe('readPracticeCredentials', () => {
  it('returns only empty strings when there is no lead, never an invented credential', () => {
    expect(readPracticeCredentials(null)).toEqual(EMPTY_CREDENTIALS);
    expect(readPracticeCredentials(undefined)).toEqual(EMPTY_CREDENTIALS);
  });

  it('returns only empty strings for a lead whose credential fields are blank or zero', () => {
    const lead = { licenseNumber: '  ', collegeOrSchool: '', graduationYear: 0 };
    expect(readPracticeCredentials(lead)).toEqual(EMPTY_CREDENTIALS);
  });

  it("returns the lead's own trimmed values when present", () => {
    const lead = {
      licenseNumber: ' TX-55012 ',
      collegeOrSchool: 'UT Health San Antonio ',
      graduationYear: 2019,
      licenseStatus: 'Active Board Pass' as const,
    };
    expect(readPracticeCredentials(lead)).toEqual(FULL_CREDENTIALS);
  });
});

describe('buildCredentialRows', () => {
  it('lists every real value and marks none as a placeholder', () => {
    const rows = buildCredentialRows(FULL_CREDENTIALS, 'San Antonio, TX');
    expect(rows.map((row) => row.value)).toEqual([
      'TX-55012',
      'San Antonio, TX',
      'UT Health San Antonio',
      '2019',
      'Active Board Pass',
    ]);
    expect(rows.some((row) => row.isPlaceholder)).toBe(false);
  });

  it('shows labelled placeholders for a missing license, school and graduation year', () => {
    const rows = buildCredentialRows(EMPTY_CREDENTIALS, '');
    expect(rows).toEqual([
      { label: 'Official License Number', value: CREDENTIAL_PLACEHOLDERS.licenseNumber, isPlaceholder: true },
      { label: 'Education / School', value: CREDENTIAL_PLACEHOLDERS.school, isPlaceholder: true },
      { label: 'Graduation Year', value: CREDENTIAL_PLACEHOLDERS.graduationYear, isPlaceholder: true },
    ]);
  });

  it('omits the jurisdiction and registry status rows rather than inventing them', () => {
    const labels = buildCredentialRows(EMPTY_CREDENTIALS, '').map((row) => row.label);
    expect(labels).not.toContain('Regulatory Jurisdiction');
    expect(labels).not.toContain('Registry Status');
  });

  it('uses placeholders that cannot be read as a real license number', () => {
    for (const placeholder of Object.values(CREDENTIAL_PLACEHOLDERS)) {
      expect(placeholder).toMatch(/^Your /);
      expect(placeholder).not.toMatch(/\d/);
    }
  });
});

describe('describeCredentialsHeading', () => {
  it('keeps the verified wording when every row is a real value', () => {
    const heading = describeCredentialsHeading(buildCredentialRows(FULL_CREDENTIALS, 'San Antonio, TX'));
    expect(heading.title).toBe('Verified Board Credentials');
    expect(heading.buttonLabel).toBe('Verified Credentials');
  });

  it('drops every claim of verification when any row is a placeholder', () => {
    const rows = buildCredentialRows({ ...FULL_CREDENTIALS, school: '' }, 'San Antonio, TX');
    const heading = describeCredentialsHeading(rows);
    expect(heading.title).not.toMatch(/verified/i);
    expect(heading.subtitle).not.toMatch(/verified|official/i);
    expect(heading.buttonLabel).not.toMatch(/verified/i);
    expect(heading.subtitle).toMatch(/placeholder/i);
  });
});

describe('formatLicenseFooter', () => {
  it('joins the license and the location when both are present', () => {
    expect(formatLicenseFooter('TX-55012', 'San Antonio, TX')).toBe(
      'Verified State License #TX-55012 • San Antonio, TX'
    );
  });

  it('shows only the license when the location is missing', () => {
    expect(formatLicenseFooter('TX-55012', '')).toBe('Verified State License #TX-55012');
  });

  it('shows only the location, with no license claim, when the license is missing', () => {
    expect(formatLicenseFooter('', 'San Antonio, TX')).toBe('San Antonio, TX');
  });

  it('returns an empty string when neither is present', () => {
    expect(formatLicenseFooter('', '')).toBe('');
  });
});
