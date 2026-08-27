import React, { useState } from 'react';
import {
  Server,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Flame,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info,
  Layers,
  Award,
  ArrowRight,
} from 'lucide-react';
import {
  W4_HOSTING_PLANS,
  PROFESSION_CONFIGS,
  MARKET_PRICE_COMPARISONS,
  TURNKEY_SCOPE_GUARANTEE,
  W4HostingTier,
} from '../../types/lead';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface W4EconomicsViewProps {
  totalLeads: number;
  pipelineValue: number;
}

export const W4EconomicsView: React.FC<W4EconomicsViewProps> = ({
  totalLeads,
  pipelineValue,
}) => {
  const [dealsPerMonth, setDealsPerMonth] = useState<number>(10);
  const [selectedPlanId, setSelectedPlanId] = useState<W4HostingTier>('bronze');

  const selectedPlan = W4_HOSTING_PLANS[selectedPlanId];

  // Simulations based on monthly deals
  const avgPackagePrice = 1850;
  const callerBountyPerDeal = 300;
  const avgHostingCost2Yr = 700;
  const domainCost2Yr = 28;
  const avgNetProfitPerDeal = avgPackagePrice - callerBountyPerDeal - avgHostingCost2Yr - domainCost2Yr;

  const monthlyGrossRevenue = dealsPerMonth * avgPackagePrice;
  const monthlyCallerCommissions = dealsPerMonth * callerBountyPerDeal;
  const monthlyNetConsultingProfit = dealsPerMonth * avgNetProfitPerDeal;
  const annualNetProfit = monthlyNetConsultingProfit * 12;
  const month25RecurringMRR = dealsPerMonth * 12 * 2 * 45; // 24 months of accrued clients paying $45/mo avg

  return (
    <div id="w4-economics-studio" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-stone-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              My Compass Consulting Unit Economics
            </span>
            <Badge variant="info" size="sm">
              w4 Hosting Infrastructure • $300 Rep Bounties
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            2-Year Turnkey Package &amp; Commission Model
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Eliminate startup friction by bundling 24 months of ultra-fast w4 cloud hosting and domain registration into a single flat-rate package. Fund attractive <strong>$300 rep commissions</strong> while capturing healthy net consulting margins and creating high-MRR month 25+ software renewals.
          </p>
        </div>
      </div>

      {/* Interactive Revenue & Commission Calculator */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Agency Profit &amp; Commission Simulator
            </h3>
            <p className="text-xs text-stone-500">
              Calculate caller payouts, net consulting profit, and month 25+ recurring ARR
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-600">
              Closed Deals / Month: <strong className="text-emerald-700 text-sm">{dealsPerMonth}</strong>
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            id="deals-per-month-slider"
            type="range"
            min={1}
            max={50}
            value={dealsPerMonth}
            onChange={(e) => setDealsPerMonth(Number(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>1 deal/mo (Part-time)</span>
            <span>10 deals/mo (1 Outbound Rep)</span>
            <span>25 deals/mo (2-3 Reps)</span>
            <span>50 deals/mo (Agency Scale)</span>
          </div>
        </div>

        {/* Calculated Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <p className="text-[11px] text-stone-500 uppercase font-semibold">Monthly Gross Revenue</p>
            <p className="text-xl sm:text-2xl font-black text-stone-900 mt-1 font-mono">
              ${monthlyGrossRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-stone-500 font-medium block mt-0.5">
              ${(monthlyGrossRevenue * 12).toLocaleString()} annualized
            </span>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
            <p className="text-[11px] text-amber-800 uppercase font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> Rep Commission Payout
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-900 mt-1 font-mono">
              ${monthlyCallerCommissions.toLocaleString()}
            </p>
            <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
              ${dealsPerMonth * 300} / mo cash bounties
            </span>
          </div>

          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
            <p className="text-[11px] text-emerald-800 uppercase font-semibold">Net Consulting Profit</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 font-mono">
              ${monthlyNetConsultingProfit.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
              ${annualNetProfit.toLocaleString()} / yr net profit
            </span>
          </div>

          <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200">
            <p className="text-[11px] text-teal-800 uppercase font-semibold">Month 25+ Base MRR</p>
            <p className="text-xl sm:text-2xl font-black text-teal-900 mt-1 font-mono">
              ${month25RecurringMRR.toLocaleString()}
            </p>
            <span className="text-[11px] text-teal-700 font-medium block mt-0.5">
              24-mo rolling hosting renewals
            </span>
          </div>
        </div>
      </div>

      {/* w4 Hosting Plans Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-600" />
            w4 Hosting Tiers &amp; Package Pricing
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            Click any plan to inspect unit margins
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.values(W4_HOSTING_PLANS).map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 uppercase">{plan.name}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    )}
                  </div>
                  <p className="text-xl font-black text-stone-900 font-mono">
                    ${plan.twoYearFlatPackagePrice.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Base: ${plan.monthlyBaseRate}/mo post-2yr
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Rep Bounty:</span>
                    <span className="font-bold text-amber-700 font-mono">${plan.callerCommission}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Net Profit:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      +${plan.netConsultingProfit.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Plan In-Depth Details */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-stone-900 text-base">{selectedPlan.name} Plan Details</h4>
                <Badge variant="success" size="sm">
                  ${selectedPlan.twoYearFlatPackagePrice.toLocaleString()} Turnkey Package
                </Badge>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{selectedPlan.description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                2-Yr w4 Cost: ${selectedPlan.twoYearHostingCost.toFixed(2)}
              </span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                Net Margin: +${selectedPlan.netConsultingProfit.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Included Compass Suite Features
              </span>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {selectedPlan.includedSuiteFeatures.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h5 className="font-bold text-stone-900 text-xs">$999 Domain Lease-to-Own Equity Clause</h5>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Registrar ownership remains with My Compass Consulting throughout the 2-year package. Clients have the contractual right to buy out and transfer their .com domain into their private account for a one-time <strong>${selectedPlan.domainBuyoutPrice}</strong> transfer fee, unlocking additional high-margin monetization.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Year Market TCO Benchmarks & Turnkey Scope Guarantee */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 text-white space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  2-Year Market Total Cost of Ownership (TCO) Benchmarks
                </h3>
                <p className="text-[11px] text-slate-400">
                  Why our turnkey 2-year package closes deals instantly without price objections
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800">
              TCO Value Armor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(MARKET_PRICE_COMPARISONS).map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="text-xs font-bold text-sky-300">{comp.category}</span>
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/80">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Agency 2-Yr Spend:</span>
                      <span className="text-rose-400 font-mono font-semibold">{comp.agencyCost2Yr}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">DIY 2-Yr Spend:</span>
                      <span className="text-amber-400 font-mono font-semibold">{comp.diyCost2Yr}</span>
                    </div>
                    <div className="flex justify-between py-1 bg-emerald-950/60 px-2 rounded border border-emerald-800/60">
                      <span className="text-emerald-300 font-semibold">Our 2-Yr Package:</span>
                      <span className="text-emerald-400 font-mono font-bold">{comp.compassPackageCost2Yr}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium pt-1">
                    ★ {comp.totalClientSavings}
                  </div>
                </div>

                <ul className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  {comp.dealHighlights.map((hl, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Why Our Deal Is The Best Deal</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {TURNKEY_SCOPE_GUARANTEE.whyOurDealIsBest}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>{TURNKEY_SCOPE_GUARANTEE.title} (No-Price-Match Scope Shield)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {TURNKEY_SCOPE_GUARANTEE.blurb}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
