import React from 'react';
import {
  DollarSign,
  Info,
  TrendingUp,
  Scale,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Home,
  HeartPulse,
  Wrench,
  UserCheck,
  Building2,
  X,
  ArrowRight,
  Flame,
  Globe,
  Server,
  Zap,
} from 'lucide-react';
import { PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface ValuationExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineValue: number;
  totalLeads: number;
}

export const ValuationExplainerModal: React.FC<ValuationExplainerModalProps> = ({
  isOpen,
  onClose,
  pipelineValue,
  totalLeads,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="valuation-explainer-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        id="valuation-explainer-modal-content"
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  Unit Economics & Commission Model
                </h2>
                <Badge variant="info" size="sm">
                  My Compass Consulting
                </Badge>
              </div>
              <p className="text-xs text-stone-500">
                w4 Hosting Tiers • $300 Rep Commissions • 2-Year Launch Flat Rates • $999 Domain Equity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 text-stone-800 text-sm">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Total Pipeline Deal Volume
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5">
                ${pipelineValue.toLocaleString()} Gross Pipeline
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Calculated across <strong>{totalLeads}</strong> active newly licensed practitioner leads in Fresh Mints CRM.
              </p>
            </div>
            <div className="bg-white/90 border border-emerald-200 rounded-xl p-3 text-center sm:text-right shrink-0 shadow-xs">
              <p className="text-[11px] text-stone-500 font-medium">Avg Contract Value</p>
              <p className="text-base font-bold text-emerald-700">
                ${totalLeads > 0 ? Math.round(pipelineValue / totalLeads).toLocaleString() : '1,650'} / package
              </p>
            </div>
          </div>

          {/* $300 Rep Incentive Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                  <Flame className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-stone-900 text-sm">
                  Cold Caller Incentive Structure ($300 Cash / Closed Lead)
                </h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                By setting 2-year flat rates between <strong>$1,250 and $3,950</strong>, you can offer cold callers a guaranteed <strong>$300 commission per closed deal</strong>. If a caller books or closes 1 lead per hour, they earn an effective <strong>$300/hour</strong>, creating an irresistible outbound incentive.
              </p>
            </div>
          </div>

          {/* w4 Hosting Tiers Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600" />
                w4 Hosting Tiers & Unit Margin Analysis
              </h4>
              <span className="text-xs text-stone-500">Includes Compass Software Suite</span>
            </div>

            <div className="border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 text-xs font-bold text-stone-600 grid grid-cols-12 gap-2">
                <span className="col-span-3">Tier / Plan</span>
                <span className="col-span-2 text-right">Base / Mo</span>
                <span className="col-span-2 text-right">2-Yr Package</span>
                <span className="col-span-2 text-right">Caller Bounty</span>
                <span className="col-span-3 text-right">Net Profit / Deal</span>
              </div>
              <div className="divide-y divide-stone-100 text-xs">
                {Object.values(W4_HOSTING_PLANS).map((plan) => (
                  <div key={plan.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-stone-50/50 transition-colors">
                    <div className="col-span-3">
                      <span className="font-bold text-stone-900 block">{plan.name}</span>
                      <span className="text-[11px] text-stone-500 line-clamp-1">{plan.description}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-stone-600">
                      ${plan.monthlyBaseRate.toFixed(2)}/mo
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-stone-900">
                      ${plan.twoYearFlatPackagePrice.toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-amber-700">
                      ${plan.callerCommission.toLocaleString()}
                    </div>
                    <div className="col-span-3 text-right font-mono font-bold text-emerald-700">
                      +${plan.netConsultingProfit.toFixed(2)}
                      <span className="text-[10px] text-stone-400 block font-sans">
                        after $300 rep + w4 cost
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Domain Buyout & Lease-to-Own Clause */}
          <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50 space-y-2.5">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              $999 Domain Asset Lease-To-Own Buyout
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              My Compass Consulting purchases and registers the practitioner&apos;s clean .com domain, retaining registrar ownership while licensing it as part of the turnkey 2-year package. If the client ever wants full registrar transfer and unencumbered DNS equity ownership, they can purchase their domain outright for <strong>$999</strong>, creating an additional high-margin monetization event.
            </p>
          </div>

          {/* Key Strategic Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-white border border-stone-200/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Zero Friction Launch Offer
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Newly licensed practitioners hate monthly recurring software bills during their first months. Pitching 24 months completely prepaid removes friction and closes fast.
              </p>
            </div>

            <div className="p-3.5 bg-white border border-stone-200/80 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Month 25+ Continuous MRR
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                After month 24, all sites automatically continue at their base w4 hosting rate ($14.99–$129.99/mo), building a durable recurring revenue stream.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/60 flex justify-end sticky bottom-0 z-10">
          <Button variant="primary" size="md" onClick={onClose}>
            Close Breakdown
          </Button>
        </div>
      </div>
    </div>
  );
};
