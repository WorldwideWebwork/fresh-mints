import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Copy,
  Mail,
  MessageSquare,
  PhoneCall,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Flame,
  Briefcase,
  Layers,
  Award,
  Magnet,
  ShieldAlert,
} from 'lucide-react';
import { Lead, PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import {
  generateFallbackOutreach,
  generateColdCallScript,
  OUTREACH_TEMPLATES,
  INDUSTRY_PITCH_PROFILES,
} from '../../services/outreach-generator';
import { getPreviewLink } from '../../services/website-templates';

interface OutreachComposerModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLogSent: (
    leadId: string,
    log: {
      type: 'email' | 'sms';
      subject?: string;
      content: string;
      status: 'sent';
      toneUsed: string;
    }
  ) => void;
}

export const OutreachComposerModal: React.FC<OutreachComposerModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLogSent,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('industry_board_pass');

  const offerPrice = lead?.websiteConfig?.offerPrice || lead?.estimatedDealValue || 1650;

  const initialFallback = lead
    ? generateFallbackOutreach(lead, selectedTemplate, offerPrice)
    : { subject: '', emailBody: '', smsBody: '' };

  const [subject, setSubject] = useState(initialFallback.subject);
  const [emailBody, setEmailBody] = useState(initialFallback.emailBody);
  const [smsBody, setSmsBody] = useState(initialFallback.smsBody);
  const [channel, setChannel] = useState<'email' | 'sms' | 'call'>('email');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleTemplateChange = (newTemplate: string) => {
    setSelectedTemplate(newTemplate);
    if (lead) {
      const fallback = generateFallbackOutreach(
        lead,
        newTemplate,
        lead.websiteConfig?.offerPrice || lead.estimatedDealValue || 1650
      );
      setSubject(fallback.subject);
      setEmailBody(fallback.emailBody);
      setSmsBody(fallback.smsBody);
    }
  };

  if (!isOpen || !lead) return null;

  const profMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
  const industryProfile = INDUSTRY_PITCH_PROFILES[lead.profession] || INDUSTRY_PITCH_PROFILES.real_estate;
  const hostingPlan = W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze;
  const coldCallScript = generateColdCallScript(lead, offerPrice);
  const siteSlug = lead.websiteConfig?.previewSlug || lead.id;
  const previewUrl = getPreviewLink(siteSlug);

  const handleInsertToken = (token: string) => {
    if (channel === 'email') {
      setEmailBody((prev) => `${prev}\n${token}`);
    } else if (channel === 'sms') {
      setSmsBody((prev) => `${prev} ${token}`);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setSentSuccess(false);

    try {
      const targetTone = OUTREACH_TEMPLATES.find((t) => t.id === selectedTemplate)?.tone || 'Warm & Congratulatory';

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateOutreach',
          payload: {
            name: lead.fullName,
            profession: lead.professionTitle,
            professionCategory: industryProfile.industryLabel,
            city: lead.city,
            state: lead.state,
            licenseDate: lead.issueDate,
            email: lead.skipTraceData?.primaryEmail,
            websiteUrl: previewUrl,
            tone: targetTone,
            offerPrice: offerPrice,
            hostingTier: hostingPlan.name,
            monthlyRate: hostingPlan.monthlyBaseRate,
            industryPainPoint: industryProfile.primaryPainPoint,
            keyFeature: industryProfile.keySoftwareFeature,
            clientType: industryProfile.clientType,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.subject) setSubject(json.data.subject);
          if (json.data.emailBody) setEmailBody(json.data.emailBody);
          if (json.data.smsBody) setSmsBody(json.data.smsBody);
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('AI generation error, staying with local template', err);
    }

    const fallback = generateFallbackOutreach(
      lead,
      selectedTemplate,
      offerPrice
    );
    setSubject(fallback.subject);
    setEmailBody(fallback.emailBody);
    setSmsBody(fallback.smsBody);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    let textToCopy = '';
    if (channel === 'email') {
      textToCopy = `Subject: ${subject}\n\n${emailBody}`;
    } else if (channel === 'sms') {
      textToCopy = smsBody;
    } else {
      textToCopy = `COLD CALL SCRIPT FOR ${lead.fullName} (${lead.professionTitle})\n` +
        `INDUSTRY: ${industryProfile.industryLabel}\n\n` +
        `OPENING:\n${coldCallScript.openingHook}\n\n` +
        `VALUE PITCH:\n${coldCallScript.valuePitch}\n\n` +
        `2-YEAR LAUNCH OFFER:\n${coldCallScript.twoYearOffer}\n\n` +
        `DOMAIN LEASE-TO-OWN CLAUSE:\n${coldCallScript.domainEquityClause}\n\n` +
        `REBUTTALS:\n` +
        coldCallScript.objections.map((o) => `Q: ${o.objection}\nA: ${o.rebuttal}`).join('\n\n');
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAndLog = () => {
    onLogSent(lead.id, {
      type: channel === 'call' ? 'sms' : channel,
      subject: channel === 'email' ? subject : `Call / Pitch to ${lead.fullName}`,
      content: channel === 'email' ? emailBody : channel === 'sms' ? smsBody : `Completed cold call pitch. Offer: $${offerPrice} (w4 ${hostingPlan.name}).`,
      status: 'sent',
      toneUsed: selectedTemplate,
    });

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  const recipientEmail = lead.skipTraceData?.primaryEmail || 'No verified email (run skip trace)';
  const recipientPhone = lead.skipTraceData?.verifiedPhone || 'No verified phone (run skip trace)';
  const isSmsOverLimit = smsBody.length > 160;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">
                  Pitch {lead.fullName}
                </h2>
                <Badge variant="success" size="sm">
                  ${offerPrice.toLocaleString()} Flat 2-Yr Package
                </Badge>
                <span className="text-[11px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  My Compass Consulting
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Industry-Tailored Pitch Studio • <strong>{lead.professionTitle}</strong> ({lead.city}, {lead.state})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Target Contact Bar with Caller Commission Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span className="text-stone-500">Direct Phone:</span>
                <span className="font-bold text-stone-900">{recipientPhone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-sky-600" />
                <span className="text-stone-500">Email:</span>
                <span className="font-semibold text-stone-800">{recipientEmail}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-xs shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              Caller Bounty: $300.00 Cash / Close
            </div>
          </div>

          {/* Industry Pitch Intelligence Card */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Industry Intelligence ({industryProfile.industryLabel})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                  Client Type: {industryProfile.clientType}
                </span>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  2-Yr w4 {hostingPlan.name} ($0/mo)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-stone-200/80">
                <span className="text-stone-500 text-[10px] font-semibold uppercase block">Industry Hook</span>
                <p className="text-stone-800 text-[11px] font-medium leading-relaxed">
                  {industryProfile.primaryPainPoint}
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200/80">
                <span className="text-stone-500 text-[10px] font-semibold uppercase block">Turnkey Software Feature</span>
                <p className="text-teal-900 text-[11px] font-semibold leading-relaxed">
                  {industryProfile.keySoftwareFeature}
                </p>
              </div>
            </div>
          </div>

          {/* Pitch Channel & Template Strategy */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Pitch Channel
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setChannel('call')}
                    className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
                      channel === 'call' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Script
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
                      channel === 'email' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-colors ${
                      channel === 'sms' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> SMS Text
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Industry Pitch Strategy
                </label>
                <div className="relative">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 px-3 py-2 focus:ring-2 focus:ring-teal-600 focus:outline-none appearance-none"
                  >
                    {OUTREACH_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Template Card Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {OUTREACH_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateChange(template.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                        {template.badge}
                      </span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {template.name.split(' (')[0]}
                    </span>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                      {template.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Generator & Fast Variable Insertion Bar */}
          {channel !== 'call' && (
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-400" />
                  Quick Insert Tokens:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAI}
                  isLoading={isGenerating}
                  icon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                >
                  Regenerate with Gemini AI
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleInsertToken(previewUrl)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-mono transition-colors"
                >
                  🔗 [Preview Link]
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertToken(`$${offerPrice.toLocaleString()} Flat 2-Year Package`)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-mono transition-colors"
                >
                  🏷️ [2-Year Offer]
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertToken(`My Compass Consulting`)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-mono transition-colors"
                >
                  🧭 [My Compass Consulting]
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertToken(`$999 domain lease-to-own buyout option`)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-mono transition-colors"
                >
                  🛡️ [Domain Equity Clause]
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertToken(industryProfile.keySoftwareFeature)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-mono transition-colors"
                >
                  ⚡ [Compass Tool]
                </button>
              </div>
            </div>
          )}

          {/* Channel Views */}
          {channel === 'call' ? (
            <div className="space-y-4">
              {/* Cold Call Battlecard */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    Step 1: Opening Hook & Brand Introduction
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">My Compass Consulting</span>
                </div>
                <p className="text-xs text-stone-800 bg-white p-3 rounded-lg border border-emerald-100 font-medium leading-relaxed">
                  {coldCallScript.openingHook}
                </p>

                <div className="pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Step 2: Industry Client Acquisition & Secured Portal Pitch
                  </span>
                  <p className="text-xs text-stone-800 bg-white p-3 rounded-lg border border-emerald-100 leading-relaxed">
                    {coldCallScript.valuePitch}
                  </p>
                </div>

                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="font-bold text-stone-900 block">The 2-Year Promotional Rate</span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">{coldCallScript.twoYearOffer}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
                    <span className="font-bold text-stone-900 block">$999 Domain Equity Clause</span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">{coldCallScript.domainEquityClause}</p>
                  </div>
                </div>
              </div>

              {/* Objections & Rebuttals Accordion */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/60 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Common Objections & Quick Caller Rebuttals
                </h4>
                <div className="space-y-2">
                  {coldCallScript.objections.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-stone-200/80 space-y-1 text-xs">
                      <p className="font-bold text-stone-800">Lead: {item.objection}</p>
                      <p className="text-emerald-700 font-medium leading-relaxed">You: {item.rebuttal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : channel === 'email' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg text-sm text-stone-900 px-3.5 py-2 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Email Message Body
                </label>
                <textarea
                  rows={9}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg text-sm text-stone-900 p-3.5 focus:ring-2 focus:ring-teal-600 focus:outline-none font-sans leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                SMS Text Message
              </label>
              <textarea
                rows={4}
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg text-sm text-stone-900 p-3.5 focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono text-xs"
              />
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-stone-400">Standard SMS character limit: 160</span>
                <span className={`font-semibold ${isSmsOverLimit ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {smsBody.length} / 160 characters {isSmsOverLimit ? '(Multi-segment SMS)' : '(1 segment)'}
                </span>
              </div>
            </div>
          )}

          {sentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Outreach logged! Pipeline status updated to &quot;Outreach Sent&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleCopy} icon={<Copy className="w-3.5 h-3.5" />}>
            {copied ? 'Copied to Clipboard!' : channel === 'call' ? 'Copy Full Script' : 'Copy Message'}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSendAndLog}
              icon={<Send className="w-4 h-4" />}
            >
              {channel === 'call' ? 'Log Call Outcome' : 'Log & Send Outreach'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


