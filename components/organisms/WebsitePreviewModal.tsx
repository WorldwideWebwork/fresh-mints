import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Globe,
  Smartphone,
  Monitor,
  CheckCircle,
  Copy,
  ExternalLink,
  Send,
  Sparkles,
  Edit3,
  Award,
  ShieldCheck,
  Star,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Flame,
} from 'lucide-react';
import { Lead, WebsitePreviewConfig, PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '../../types/lead';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { getDefaultWebsiteConfig, getPreviewLink } from '../../services/website-templates';

interface WebsitePreviewModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateConfig: (id: string, config: WebsitePreviewConfig) => void;
  onOpenOutreach: (lead: Lead) => void;
}

export const WebsitePreviewModal: React.FC<WebsitePreviewModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateConfig,
  onOpenOutreach,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !lead) return null;

  const siteConfig: WebsitePreviewConfig =
    lead.websiteConfig ||
    getDefaultWebsiteConfig(lead.fullName, lead.profession, lead.city, lead.state, lead.collegeOrSchool);

  const shareableUrl = getPreviewLink(siteConfig.previewSlug);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleColorChange = (color: string) => {
    const updated = { ...siteConfig, primaryColor: color };
    onUpdateConfig(lead.id, updated);
  };

  const handleHeadlineChange = (val: string) => {
    const updated = { ...siteConfig, heroHeadline: val };
    onUpdateConfig(lead.id, updated);
  };

  const profMeta = PROFESSION_CONFIGS[lead.profession] || PROFESSION_CONFIGS.real_estate;
  const hostingPlan = W4_HOSTING_PLANS[profMeta.hostingTier] || W4_HOSTING_PLANS.bronze;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 text-stone-100 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl border border-stone-800">
        {/* Header Bar */}
        <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Practice Portal: {lead.fullName}
                </h2>
                <Badge variant="success" size="sm">
                  ${siteConfig.offerPrice.toLocaleString()} (2-Yr w4 Hosting & Domain)
                </Badge>
                <span className="text-[11px] bg-stone-800 text-teal-300 px-2 py-0.5 rounded border border-stone-700 font-mono">
                  {hostingPlan.name} (${hostingPlan.monthlyBaseRate}/mo post-2yr)
                </span>
                <span className="text-[11px] bg-emerald-900/80 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-700/50 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Rep Bounty: $300
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                My Compass Consulting Pitch Studio • <strong>{lead.professionTitle}</strong> ({lead.city}, {lead.state}) • $999 Domain Buyout Clause
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-stone-800 p-1 rounded-lg border border-stone-700 flex items-center gap-1">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  deviceMode === 'desktop' ? 'bg-teal-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  deviceMode === 'mobile' ? 'bg-teal-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-400" />
              {isEditing ? 'Done Editing' : 'Customize Site'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editing Controls Bar (Collapsible) */}
        {isEditing && (
          <div className="bg-stone-800/90 border-b border-stone-700 p-3 px-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-stone-400 font-semibold uppercase text-[10px] block mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={siteConfig.heroHeadline}
                onChange={(e) => handleHeadlineChange(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded px-2.5 py-1 text-white text-xs focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-stone-400 font-semibold uppercase text-[10px] block mb-1">
                Primary Palette
              </label>
              <div className="flex items-center gap-2">
                {['#0f766e', '#e11d48', '#2563eb', '#1e293b', '#db2777', '#ea580c'].map((col) => (
                  <button
                    key={col}
                    onClick={() => handleColorChange(col)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      siteConfig.primaryColor === col ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-stone-400 font-semibold uppercase text-[10px] block mb-1">
                Offer Pitch Price
              </label>
              <input
                type="number"
                value={siteConfig.offerPrice}
                onChange={(e) =>
                  onUpdateConfig(lead.id, { ...siteConfig, offerPrice: Number(e.target.value) })
                }
                className="w-[120px] bg-stone-900 border border-stone-700 rounded px-2.5 py-1 text-white text-xs"
              />
            </div>
          </div>
        )}

        {/* Live Interactive Website Frame Canvas */}
        <div className="p-4 sm:p-6 bg-stone-950 flex-1 overflow-y-auto flex justify-center">
          <div
            className={`transition-all bg-white text-stone-900 rounded-xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col ${
              deviceMode === 'mobile' ? 'w-[375px] min-h-[667px]' : 'w-full max-w-5xl'
            }`}
          >
            {/* Website Mock Browser Nav */}
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="bg-white border border-stone-300 rounded px-3 py-0.5 text-[11px] font-mono text-stone-600 truncate max-w-xs">
                https://{siteConfig.previewSlug}.licensify.app
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" /> Licensed Professional Site
              </div>
            </div>

            {/* Generated Website Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <header className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    {lead.fullName.charAt(0)}
                  </div>
                  <span className="font-bold text-sm tracking-tight text-stone-900">
                    {lead.fullName}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-stone-600">
                  <span>Services</span>
                  <span>About</span>
                  <span>License</span>
                  <button
                    className="px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    {siteConfig.callToAction}
                  </button>
                </div>
              </header>

              {/* Hero Banner Section */}
              <section className="px-6 py-12 sm:py-16 text-center bg-stone-50 relative overflow-hidden">
                <div className="max-w-2xl mx-auto space-y-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    <Award className="w-3.5 h-3.5" />
                    State Licensed {lead.professionTitle} ({lead.state})
                  </span>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                    {siteConfig.heroHeadline}
                  </h1>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    {siteConfig.heroSubheadline}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      className="px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity"
                      style={{ backgroundColor: siteConfig.primaryColor }}
                    >
                      {siteConfig.callToAction}
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-semibold text-sm shadow-xs">
                      View License Verification
                    </button>
                  </div>
                </div>
              </section>

              {/* Credentials & Trust Bar */}
              <section className="bg-stone-900 text-white py-4 px-6 text-xs flex flex-wrap items-center justify-around gap-4 text-center">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>State License #{lead.licenseNumber}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>{lead.collegeOrSchool} Graduate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Verified Professional Practice</span>
                </div>
              </section>

              {/* Services Section */}
              <section className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-stone-900">Professional Practice Services</h2>
                  <p className="text-xs text-stone-500">
                    Tailored solutions provided in {lead.city}, {lead.state}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {siteConfig.services.map((svc) => (
                    <div
                      key={svc.id}
                      className="border border-stone-200 rounded-xl p-4 bg-white shadow-xs space-y-2 hover:border-stone-300 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg text-white flex items-center justify-center"
                        style={{ backgroundColor: siteConfig.primaryColor }}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-stone-900">{svc.title}</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">{svc.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bio & Contact Section */}
              <section className="bg-stone-50 p-6 sm:p-10 border-t border-stone-200">
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                    <Image
                      src={siteConfig.demoPhotos[0]}
                      alt={lead.fullName}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-bold text-stone-900">About {lead.fullName}</h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {siteConfig.bioText}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-stone-500 pt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" /> {lead.city}, {lead.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" /> Licensed Class of {lead.graduationYear}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              icon={<Copy className="w-3.5 h-3.5" />}
              className="border-stone-700 text-stone-200 hover:bg-stone-800"
            >
              {copiedLink ? 'Preview Link Copied!' : 'Copy Pitch Link'}
            </Button>
            <a
              href={shareableUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-stone-400 hover:text-white flex items-center gap-1 underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live Link
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onOpenOutreach(lead);
              }}
              icon={<Send className="w-4 h-4" />}
            >
              Offer Website To {lead.fullName.split(' ')[0]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
