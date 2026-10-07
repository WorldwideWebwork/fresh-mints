import type { Lead } from '../types/lead';
import { PROFESSION_CONFIGS } from '../types/profession';
import { W4_HOSTING_PLANS } from '../types/hosting';
import { hasOwnDealValue, type ValuationBreakdown } from './valuation-breakdown';

export interface ValuationRow {
  label: string;
  value: string;
  hint?: string;
  isEmphasized?: boolean;
}

export interface ValuationSections {
  deal: ValuationRow[];
  margin: ValuationRow[];
}

export interface ValuationNotice {
  id: 'value-defaulted' | 'profession-defaulted' | 'differs-from-package';
  badge: string;
  message: string;
  variant: 'warning' | 'info';
}

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatUsd = (amount: number): string => USD.format(amount);

/**
 * Turn a breakdown into the labelled rows a rep reads aloud. Amounts are shown as
 * positive figures under "Less:" labels so the sign never has to be inferred.
 */
export function buildValuationRows(breakdown: ValuationBreakdown): ValuationSections {
  const profession = PROFESSION_CONFIGS[breakdown.profession];
  const plan = W4_HOSTING_PLANS[breakdown.hostingTier];

  return {
    deal: [
      { label: 'Lead deal value', value: formatUsd(breakdown.dealValue), isEmphasized: true },
      { label: 'Profession', value: profession.label },
      { label: 'Hosting tier', value: plan.name },
    ],
    margin: [
      { label: `${plan.name} 2-year package`, value: formatUsd(breakdown.twoYearFlatPackagePrice) },
      { label: 'Less: caller commission', value: formatUsd(breakdown.callerCommission) },
      {
        label: 'Less: 2-year hosting cost',
        value: formatUsd(breakdown.twoYearHostingCost),
        hint: `${formatUsd(plan.wholesaleMonthlyCost)}/mo wholesale`,
      },
      { label: 'Less: 2-year domain cost', value: formatUsd(breakdown.twoYearDomainCost) },
      { label: 'Net consulting profit', value: formatUsd(breakdown.netConsultingProfit), isEmphasized: true },
    ],
  };
}

// A lead loaded from old storage can carry no profession at all.
const describeRecordedProfession = (lead: Lead): string => {
  const recorded = String(lead.profession ?? '').trim();
  const hasRecordedProfession = recorded.length > 0;
  if (!hasRecordedProfession) return 'none recorded';
  return `"${recorded}"`;
};

/**
 * Say, in plain words, which parts of the breakdown are assumptions rather than
 * facts about this lead. Empty when nothing was assumed and the deal value is the
 * standard package price.
 */
export function buildValuationNotices(lead: Lead, breakdown: ValuationBreakdown): ValuationNotice[] {
  const professionLabel = PROFESSION_CONFIGS[breakdown.profession].label;
  const plan = W4_HOSTING_PLANS[breakdown.hostingTier];

  // Stage 1: atomic concepts
  const isValueDefaulted = !hasOwnDealValue(lead);
  const isProfessionDefaulted = breakdown.profession !== lead.profession;
  const differsFromPackage = breakdown.dealValue !== breakdown.twoYearFlatPackagePrice;

  const notices: ValuationNotice[] = [];

  if (isValueDefaulted) {
    notices.push({
      id: 'value-defaulted',
      badge: 'Profession average',
      message: `No deal value is recorded for this lead, so ${formatUsd(breakdown.dealValue)} is the average for ${professionLabel}.`,
      variant: 'warning',
    });
  }

  if (isProfessionDefaulted) {
    notices.push({
      id: 'profession-defaulted',
      badge: 'Default profession',
      message: `This lead's profession (${describeRecordedProfession(lead)}) is not a mapped category, so ${professionLabel} pricing was used.`,
      variant: 'warning',
    });
  }

  if (differsFromPackage) {
    notices.push({
      id: 'differs-from-package',
      badge: 'Differs from package',
      message: `The deal value (${formatUsd(breakdown.dealValue)}) differs from the standard ${plan.name} package price (${formatUsd(breakdown.twoYearFlatPackagePrice)}). The margin below is for the standard package and is not recalculated for this deal value.`,
      variant: 'info',
    });
  }

  return notices;
}
