/**
 * Credential copy for the practice website preview.
 *
 * Every value comes from the lead. A missing value is never invented: inline
 * mentions are omitted, and the credentials list shows a placeholder that reads
 * as a slot to fill in ("Your license number"), never as a real credential.
 */
import type { Lead } from '../types/lead';

type CredentialSource = Partial<Pick<Lead, 'licenseNumber' | 'collegeOrSchool' | 'graduationYear' | 'licenseStatus'>>;

export interface PracticeCredentials {
  readonly licenseNumber: string;
  readonly school: string;
  readonly graduationYear: string;
  readonly licenseStatus: string;
}

export interface CredentialRow {
  readonly label: string;
  readonly value: string;
  readonly isPlaceholder: boolean;
}

export interface CredentialsHeading {
  readonly title: string;
  readonly subtitle: string;
  readonly buttonLabel: string;
}

export const CREDENTIAL_PLACEHOLDERS = {
  licenseNumber: 'Your license number',
  school: 'Your school',
  graduationYear: 'Your graduation year',
} as const;

/** Trims text; undefined, null, non-strings and whitespace-only input become "". */
export function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** A four-digit year as text, or "" for missing, zero and malformed input. */
export function cleanGraduationYear(value: unknown): string {
  const year = typeof value === 'string' ? Number(value.trim()) : value;
  const isWholeNumber = typeof year === 'number' && Number.isInteger(year);
  if (!isWholeNumber) return '';
  const hasFourDigits = year >= 1000 && year <= 9999;
  return hasFourDigits ? String(year) : '';
}

/** Reads the lead's credential fields; anything missing stays "". */
export function readPracticeCredentials(lead: CredentialSource | null | undefined): PracticeCredentials {
  return {
    licenseNumber: cleanText(lead?.licenseNumber),
    school: cleanText(lead?.collegeOrSchool),
    graduationYear: cleanGraduationYear(lead?.graduationYear),
    licenseStatus: cleanText(lead?.licenseStatus),
  };
}

const realRow = (label: string, value: string): CredentialRow => ({ label, value, isPlaceholder: false });

const rowOrPlaceholder = (label: string, value: string, placeholder: string): CredentialRow =>
  value ? realRow(label, value) : { label, value: placeholder, isPlaceholder: true };

/**
 * Rows for the credentials modal. License, school and graduation year always
 * appear, as a placeholder when missing. Jurisdiction and registry status are
 * omitted when missing, since a placeholder status would still read as a claim.
 */
export function buildCredentialRows(credentials: PracticeCredentials, jurisdiction: string): CredentialRow[] {
  const { licenseNumber, school, graduationYear, licenseStatus } = credentials;
  const rows = [rowOrPlaceholder('Official License Number', licenseNumber, CREDENTIAL_PLACEHOLDERS.licenseNumber)];
  if (jurisdiction) rows.push(realRow('Regulatory Jurisdiction', jurisdiction));
  rows.push(rowOrPlaceholder('Education / School', school, CREDENTIAL_PLACEHOLDERS.school));
  rows.push(rowOrPlaceholder('Graduation Year', graduationYear, CREDENTIAL_PLACEHOLDERS.graduationYear));
  if (licenseStatus) rows.push(realRow('Registry Status', licenseStatus));
  return rows;
}

/** Claims verification only when no row in the list is a placeholder. */
export function describeCredentialsHeading(rows: readonly CredentialRow[]): CredentialsHeading {
  const hasPlaceholder = rows.some((row) => row.isPlaceholder);
  if (hasPlaceholder) {
    return {
      title: 'Board Credentials',
      subtitle: 'Placeholder fields show where your details will appear.',
      buttonLabel: 'Credentials',
    };
  }
  return {
    title: 'Verified Board Credentials',
    subtitle: 'Official state regulatory registry records',
    buttonLabel: 'Verified Credentials',
  };
}

/** Footer credit line: the license claim appears only when there is a license number. */
export function formatLicenseFooter(licenseNumber: string, location: string): string {
  const licenseLabel = licenseNumber ? `Verified State License #${licenseNumber}` : '';
  return [licenseLabel, location].filter((part) => part.length > 0).join(' • ');
}
