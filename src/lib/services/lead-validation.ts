import type { Lead } from '../types/lead';
import { PROFESSION_CONFIGS, getProfessionConfig } from '../types/profession';
import { US_STATES } from '../types/states';

export type LeadFieldErrors = Record<string, string>;

export type NewLeadValidation =
  | { readonly ok: true; readonly lead: Partial<Lead> }
  | { readonly ok: false; readonly errors: LeadFieldErrors };

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Form fields arrive as loose strings. Anything that is not a string counts as blank.
const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toLicenseKey = (licenseNumber: string | undefined): string => clean(licenseNumber).toUpperCase();

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const isKnownProfession = (key: string): boolean => Object.hasOwn(PROFESSION_CONFIGS, key);

const isKnownStateCode = (code: string): boolean => US_STATES.some((s) => s.code === code);

// Date parsing rolls an impossible day (Feb 30) into the next month, so the
// parsed date must print back as the same string to count as a real day.
const isRealIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  const isParseable = !Number.isNaN(parsed.getTime());
  return isParseable && parsed.toISOString().startsWith(value);
};

const isDuplicateLicense = (licenseKey: string, existing: Lead[]): boolean =>
  existing.some((lead) => toLicenseKey(lead.licenseNumber) === licenseKey);

// Each check returns an error message, or undefined when the value is acceptable.
const checkFullName = (fullName: string): string | undefined =>
  fullName ? undefined : 'Full name is required.';

const checkProfession = (profession: string): string | undefined => {
  if (!profession) return 'Choose a profession.';
  if (!isKnownProfession(profession)) return 'That profession is not recognised.';
  return undefined;
};

const checkState = (state: string): string | undefined => {
  if (!state) return 'Choose the licensed state.';
  if (!isKnownStateCode(state)) return 'That is not a US state code.';
  return undefined;
};

const checkLicenseNumber = (licenseNumber: string, existing: Lead[]): string | undefined => {
  if (!licenseNumber) return 'License number is required.';
  if (isDuplicateLicense(toLicenseKey(licenseNumber), existing)) {
    return 'A lead with this license number already exists.';
  }
  return undefined;
};

const checkIssueDate = (issueDate: string): string | undefined => {
  const isBlank = issueDate === '';
  if (isBlank || isRealIsoDate(issueDate)) return undefined;
  return 'Use a real date in YYYY-MM-DD format.';
};

const collectErrors = (checks: Array<[string, string | undefined]>): LeadFieldErrors =>
  Object.fromEntries(checks.filter((check): check is [string, string] => check[1] !== undefined));

/**
 * Validates a manually entered lead against the canonical profession and state
 * lists and against the leads already held. Pure: the clock is injectable and no
 * store or DOM is touched. Blank optional fields are left off the result so the
 * caller never stores an invented city, school, or date.
 */
export function validateNewLead(
  input: Partial<Lead>,
  existing: Lead[],
  now: Date = new Date(),
): NewLeadValidation {
  const fullName = clean(input.fullName);
  const profession = clean(input.profession);
  const state = clean(input.state).toUpperCase();
  const licenseNumber = clean(input.licenseNumber);
  const city = clean(input.city);
  const collegeOrSchool = clean(input.collegeOrSchool);
  const issueDate = clean(input.issueDate);

  const errors = collectErrors([
    ['fullName', checkFullName(fullName)],
    ['profession', checkProfession(profession)],
    ['state', checkState(state)],
    ['licenseNumber', checkLicenseNumber(licenseNumber, existing)],
    ['issueDate', checkIssueDate(issueDate)],
  ]);

  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) return { ok: false, errors };

  const professionConfig = getProfessionConfig(profession);
  const estimatedDealValue = isPositiveNumber(input.estimatedDealValue)
    ? input.estimatedDealValue
    : professionConfig.averageWebsiteValue;

  return {
    ok: true,
    lead: {
      fullName,
      profession: professionConfig.id,
      state,
      licenseNumber,
      ...(city ? { city } : {}),
      ...(collegeOrSchool ? { collegeOrSchool } : {}),
      ...(issueDate ? { issueDate } : {}),
      estimatedDealValue,
      leadSource: 'manual',
      createdAt: now.toISOString(),
    },
  };
}
