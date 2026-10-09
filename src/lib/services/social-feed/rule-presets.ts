import type { SocialMonitorRule } from './types';

export type SocialRulePreset = Omit<SocialMonitorRule, 'id' | 'createdAt'>;

/**
 * Compliance-sensitive: education only. No product, carrier, interest rate,
 * return figure, tax claim, the word "guaranteed", or link. This is the safe
 * form while the licensed-sender question is open. Do not add sales language.
 */
const ANNUITY_EDUCATION_TEMPLATE = [
  'Hi {author}, this is general education, not advice for your situation.',
  'Annuities come in four common types:',
  'immediate (turns a lump sum into income that starts right away),',
  'fixed or MYGA (credits interest on terms stated in the contract),',
  'variable (value follows the underlying investments),',
  'and fixed indexed (interest crediting is linked to a market index, within limits set in the contract).',
  'Surrender periods and fees vary by contract, so check both.',
  'Which type fits depends on when income is needed and whether any remaining balance should pass to beneficiaries.',
].join(' ');

/**
 * On Stack Exchange "annuity" is mostly a finance-math term, so these drop textbook and
 * spreadsheet questions and leave people deciding about retirement income.
 */
const ANNUITY_MATH_NEGATIVE_KEYWORDS = [
  'formula',
  'calculate',
  'calculation',
  'present value',
  'future value',
  'duration',
  'excel',
  'homework',
  'amortization',
];

export const ANNUITY_EDUCATION_PRESET: SocialRulePreset = {
  name: 'Annuity questions (education only)',
  keywords: [
    'annuity',
    'annuities',
    'fixed indexed annuity',
    'MYGA',
    'retirement income',
    '401k rollover',
    'TSP rollover',
  ],
  negativeKeywords: [...ANNUITY_MATH_NEGATIVE_KEYWORDS],
  platforms: ['stack_exchange', 'youtube'],
  targetSubreddits: [],
  minIntentScore: 50,
  isActive: true,
  autoConvertToCrm: false,
  pitchTemplate: ANNUITY_EDUCATION_TEMPLATE,
  appendFunnelLink: false,
};

/** Arrays are copied so a rule edited later can never alter the shared preset. */
export const createRuleFromPreset = (preset: SocialRulePreset, now: Date = new Date()): SocialMonitorRule => ({
  ...preset,
  keywords: [...preset.keywords],
  negativeKeywords: [...preset.negativeKeywords],
  platforms: [...preset.platforms],
  ...(preset.targetSubreddits && { targetSubreddits: [...preset.targetSubreddits] }),
  id: `rule-${now.getTime()}`,
  createdAt: now.toISOString(),
});

const normalizeName = (name: string): string => name.trim().toLowerCase();

/** A preset counts as installed when any rule, active or paused, carries its name. */
export const isPresetInstalled = (rules: readonly SocialMonitorRule[], preset: SocialRulePreset): boolean => {
  const presetName = normalizeName(preset.name);
  return rules.some((rule) => normalizeName(rule.name) === presetName);
};
