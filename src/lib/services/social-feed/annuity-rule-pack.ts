import { FUNNEL_LINK_PLACEHOLDER } from './funnel-link';
import type { SocialRulePreset } from './rule-presets';

/** The reply always ends with this line, exactly. */
export const ANNUITY_DISCLOSURE = "Disclosure: I'm a licensed insurance agent.";

/**
 * Compliance-sensitive: teach first, then offer the guide. No guarantee, no "safe money", no
 * carrier or product name, no rate or return figure, no tax claim. Keep it that way when editing:
 * annuity-rule-pack.test.ts fails on the banned words. {funnel_link} sits on its own line so the
 * dispatcher can drop that line when no guide page URL is set and the disclosure still ends the reply.
 */
const TEACHING_PARAGRAPH = [
  'Hi {author}, this is general education, not advice for your situation.',
  'An annuity is a contract with an insurance company: you hand over a lump sum or a series of payments, and the contract spells out when and how income is paid back to you.',
  'The common types are immediate, fixed, fixed indexed and variable, and they differ in how growth is credited and how much flexibility you keep.',
  'Before comparing any of them, check the surrender period, the fees, and what happens to the remaining balance if you pass away.',
].join(' ');

const GUIDE_OFFER = `A plain-English guide to those questions is here if it helps: ${FUNNEL_LINK_PLACEHOLDER}`;

export const ANNUITY_PITCH_TEMPLATE = [TEACHING_PARAGRAPH, GUIDE_OFFER, ANNUITY_DISCLOSURE].join('\n\n');

/** Finance-class and spreadsheet questions: "annuity" there is a formula, not a retirement decision. */
const FINANCE_CLASS_NEGATIVE_KEYWORDS = [
  'annuity formula',
  'annuity due',
  'ordinary annuity',
  'growing annuity',
  'present value of an annuity',
  'future value of an annuity',
  'time value of money',
  'perpetuity',
  'homework',
  'excel formula',
  'pmt function',
];

/** Loan repayment maths and the annuity-style loans some countries sell. */
const LOAN_NEGATIVE_KEYWORDS = [
  'amortization',
  'amortisation',
  'annuity loan',
  'annuity mortgage',
  'annuity repayment',
];

/**
 * UK pension and ISA posts, which are a different market and different rules. Matching is by
 * substring, so a bare "isa" or "sipp" is avoided: both sit inside ordinary words and place names.
 */
const UK_NEGATIVE_KEYWORDS = [
  '£',
  'hmrc',
  'uk pension',
  'workplace pension',
  'nhs pension',
  'national insurance',
  'stocks and shares isa',
  'stocks & shares isa',
  'cash isa',
  'lifetime isa',
  'isa allowance',
  'my sipp',
  'sipp pension',
  'pension credit',
  'flexi-access',
];

/** A different product with different licensing. */
const OTHER_PRODUCT_NEGATIVE_KEYWORDS = ['structured settlement'];

/**
 * An opt-in rule pack for annuity questions, added from Social Radar like the education preset.
 * Nothing seeds it. Reddit needs the Reddit connector set up before its feed returns posts; the
 * scan reports that per platform and the other two platforms still run.
 *
 * The guide link comes from the guide page URL in Social Radar Settings (not set here), and carries
 * utm_source, utm_medium=social_reply, utm_campaign (the rule id), fm_thread and fm_reply.
 */
export const ANNUITY_RULE_PACK: SocialRulePreset = {
  name: 'Annuity questions (education + guide link)',
  keywords: [
    'annuity',
    'annuities',
    'MYGA',
    'fixed indexed annuity',
    'CD vs annuity',
    'retirement income',
    'lump sum pension',
  ],
  negativeKeywords: [
    ...FINANCE_CLASS_NEGATIVE_KEYWORDS,
    ...LOAN_NEGATIVE_KEYWORDS,
    ...UK_NEGATIVE_KEYWORDS,
    ...OTHER_PRODUCT_NEGATIVE_KEYWORDS,
  ],
  platforms: ['reddit', 'youtube', 'stack_exchange'],
  targetSubreddits: ['retirement', 'personalfinance', 'financialplanning', 'annuities'],
  minIntentScore: 50,
  isActive: true,
  autoConvertToCrm: false,
  pitchTemplate: ANNUITY_PITCH_TEMPLATE,
  appendFunnelLink: false,
  attributeFunnelLink: true,
};
