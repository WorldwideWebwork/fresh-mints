import type { Lead } from '../types/lead';
import type { ProfessionCategory } from '../types/profession';
import { getProfessionConfig } from '../types/profession';
import { W4_HOSTING_PLANS, type W4HostingTier } from '../types/hosting';
import { isPositiveNumber } from './lead-validation';

export interface ValuationBreakdown {
  dealValue: number;
  profession: ProfessionCategory;
  hostingTier: W4HostingTier;
  twoYearFlatPackagePrice: number;
  callerCommission: number;
  twoYearHostingCost: number;
  twoYearDomainCost: number;
  netConsultingProfit: number;
  usedProfessionDefault: boolean;
}

// A deal value only counts when the rep or an import actually recorded one.
export const hasOwnDealValue = (lead: Lead): boolean => isPositiveNumber(lead.estimatedDealValue);

/**
 * Explain a lead's deal value: which profession and hosting tier it was priced on,
 * and what the standard package leaves the consultancy after its three costs.
 *
 * Every figure except `dealValue` is read from the live config, never recomputed
 * here: the profession decides the tier (PROFESSION_CONFIGS) and the tier decides
 * the package price, commission, hosting, domain and net profit (W4_HOSTING_PLANS).
 * The margin figures describe the standard package. They do not move with a
 * custom `dealValue`.
 *
 * `usedProfessionDefault` is true when either default was needed: the lead had no
 * usable value so the profession average stood in, or the lead's profession is not
 * a mapped category so real_estate stood in.
 */
export function buildValuationBreakdown(lead: Lead): ValuationBreakdown {
  const profession = getProfessionConfig(lead.profession);
  const plan = W4_HOSTING_PLANS[profession.hostingTier];

  // Stage 1: atomic concepts
  const isValueFromLead = hasOwnDealValue(lead);
  const isProfessionFallback = profession.id !== lead.profession;

  // Stage 2: unified decision
  const usedProfessionDefault = !isValueFromLead || isProfessionFallback;
  const dealValue = isValueFromLead ? lead.estimatedDealValue : profession.averageWebsiteValue;

  return {
    dealValue,
    profession: profession.id,
    hostingTier: plan.id,
    twoYearFlatPackagePrice: plan.twoYearFlatPackagePrice,
    callerCommission: plan.callerCommission,
    twoYearHostingCost: plan.twoYearHostingCost,
    twoYearDomainCost: plan.twoYearDomainCost,
    netConsultingProfit: plan.netConsultingProfit,
    usedProfessionDefault,
  };
}
