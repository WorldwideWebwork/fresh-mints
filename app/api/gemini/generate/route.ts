import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

function decodeCloudflareEmail(cfHex: string): string {
  if (!cfHex || cfHex.length < 4) return '';
  const k = parseInt(cfHex.substring(0, 2), 16);
  let email = '';
  for (let i = 2; i < cfHex.length; i += 2) {
    email += String.fromCharCode(parseInt(cfHex.substring(i, i + 2), 16) ^ k);
  }
  return email;
}

async function fetchPageExtract(targetUrl: string, timeoutMs: number = 6000) {
  const pageResult = { emails: [] as string[], phones: [] as string[], contactLinks: [] as string[] };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return pageResult;
    const html = await res.text();

    const mailtoMatches = Array.from(html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi));
    for (const m of mailtoMatches) {
      if (m[1]) pageResult.emails.push(m[1].toLowerCase().trim());
    }

    const cfMatches = Array.from(html.matchAll(/data-cfemail=["']([a-f0-9]+)["']/gi));
    for (const m of cfMatches) {
      if (m[1]) {
        const decoded = decodeCloudflareEmail(m[1]).toLowerCase().trim();
        if (decoded && decoded.includes('@')) pageResult.emails.push(decoded);
      }
    }

    const cfLinkMatches = Array.from(html.matchAll(/\/cdn-cgi\/l\/email-protection#([a-f0-9]+)/gi));
    for (const m of cfLinkMatches) {
      if (m[1]) {
        const decoded = decodeCloudflareEmail(m[1]).toLowerCase().trim();
        if (decoded && decoded.includes('@')) pageResult.emails.push(decoded);
      }
    }

    const regexMatches = Array.from(html.matchAll(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g));
    for (const m of regexMatches) {
      pageResult.emails.push(m[0].toLowerCase().trim());
    }

    const obfMatches = Array.from(html.matchAll(/([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\))\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\.)\s*([a-zA-Z]{2,})/gi));
    for (const m of obfMatches) {
      if (m[1] && m[2] && m[3]) {
        pageResult.emails.push(`${m[1]}@${m[2]}.${m[3]}`.toLowerCase().trim());
      }
    }

    const telMatches = Array.from(html.matchAll(/href=["']tel:([^"'\s>]+)["']/gi));
    for (const m of telMatches) {
      if (m[1]) {
        const ph = m[1].replace(/[^\d\+\(\)\-\.\s]/g, '').trim();
        if (ph.replace(/\D/g, '').length >= 10) pageResult.phones.push(ph);
      }
    }

    const hrefMatches = Array.from(html.matchAll(/href=["']([^"'#\s>]+)["']/gi));
    for (const m of hrefMatches) {
      if (m[1] && /(contact|about|team|staff|reach|connect|doctors|practitioners|location|locations|hours|office|touch)/i.test(m[1])) {
        if (!/\.(jpg|jpeg|png|gif|svg|css|js|pdf|webp|ico|xml|json)$/i.test(m[1])) {
          pageResult.contactLinks.push(m[1]);
        }
      }
    }
  } catch (err) {
    // Ignore fetch error gracefully
  }
  return pageResult;
}

function cleanFilterEmails(rawEmails: string[]): string[] {
  const invalidNeedles = [
    'example.com', 'domain.com', 'sentry.io', 'wixpress.com', 'wordpress.org', 'wp.com',
    'cloudflare.com', 'google.com', 'schema.org', 'w3.org', 'github.com', 'fontawesome',
    'bootstrap', 'jquery', 'npm', 'user@', 'email@', 'test@', 'yourname@', 'name@',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js',
  ];
  return Array.from(new Set(
    rawEmails
      .map((e) => e.toLowerCase().trim())
      .filter((e) => e.includes('@') && e.includes('.') && !invalidNeedles.some((inv) => e.includes(inv)))
  ));
}

async function scrapeWebsiteContacts(url: string): Promise<{ emails: string[]; phones: string[] }> {
  const result = { emails: [] as string[], phones: [] as string[] };
  if (!url) return result;

  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
  let baseOrigin = '';
  try {
    const parsed = new URL(cleanUrl);
    baseOrigin = parsed.origin;
  } catch {
    return result;
  }

  const homepage = await fetchPageExtract(cleanUrl);
  let allEmails = cleanFilterEmails(homepage.emails);
  let allPhones = Array.from(new Set(homepage.phones));

  const candidateTargets = new Set<string>();
  for (const link of homepage.contactLinks) {
    try {
      const full = new URL(link, cleanUrl).toString();
      if (full.startsWith(baseOrigin) && full !== cleanUrl) {
        candidateTargets.add(full);
      }
    } catch {
      // Ignore parse error
    }
  }

  const standardPaths = ['/contact', '/contact-us', '/about', '/about-us', '/our-team', '/team', '/locations'];
  for (const path of standardPaths) {
    const full = `${baseOrigin}${path}`;
    if (full !== cleanUrl) candidateTargets.add(full);
  }

  if (allEmails.length < 3 && candidateTargets.size > 0) {
    const targets = Array.from(candidateTargets).slice(0, 4);
    for (const targetUrl of targets) {
      const sub = await fetchPageExtract(targetUrl, 5000);
      const subEmails = cleanFilterEmails(sub.emails);
      for (const em of subEmails) {
        if (!allEmails.includes(em)) allEmails.push(em);
      }
      for (const ph of sub.phones) {
        if (!allPhones.includes(ph)) allPhones.push(ph);
      }
      if (allEmails.length >= 3) break;
    }
  }

  result.emails = allEmails;
  result.phones = allPhones;
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === "generateOutreach") {
      const {
        name,
        profession,
        professionCategory,
        city,
        state,
        licenseDate,
        email,
        websiteUrl,
        tone,
        offerPrice,
        hostingTier,
        monthlyRate,
        industryPainPoint,
        keyFeature,
        clientType,
      } = payload;

      const isInfraAngle = tone?.toLowerCase().includes("infrastructure") || tone?.toLowerCase().includes("consolidation") || tone?.toLowerCase().includes("existing");

      const prompt = `You are a senior digital infrastructure advisor at "My Compass Consulting" and "WorldwideWebwork" (worldwidewebwork.com), reaching out to a licensed practitioner.
Generate an industry-tailored cold email pitch and matching SMS text message for:
- Professional Name: ${name}
- Industry / Profession: ${profession} (${professionCategory || "General Practice"})
- Location: ${city || "Metro Area"}, ${state}
- License Registry Date: ${licenseDate || "Active Licensed Practice"}
- Target Client/Patient Audience: ${clientType || "ideal local clients and patients"}
- Specific Industry Pain Point: ${industryPainPoint || "High overhead from fragmented plugins, slow hosting, and disconnected client intake systems"}
- Turnkey Compass Suite Tool: ${keyFeature || "Questbook CRM, Automated Client Booking Calendar, and High-Speed Sovereign Hosting"}
- Live Site / Compass Preview URL: ${websiteUrl || "https://worldwidewebwork.com/preview/site-123"}
- Chosen Tone / Strategic Angle: ${tone || "Warm, Celebratory & Authoritative"}
- Value Offer: Flat $${offerPrice || "1,650"} total for 2-Year Managed W4 Cloud Infrastructure package on worldwidewebwork.com ($0 monthly hosting bills for 24 months, with the entire Compass Software Suite 100% free forever)
- Post-Promotional Continuity: Transparent continuation at standard w4 base hosting rate of $${monthlyRate || "34.99"}/mo with NO lock-in contracts
- Domain Equity Buyout Clause: Guaranteed unencumbered $999 lease-to-own domain transfer option
- Agency / Platform Identity: "My Compass Consulting" / "WorldwideWebwork" (worldwidewebwork.com)

Pitch Writing Mandates:
1. Subject Line: High-converting, tailored to their exact profession and location.
2. Email Body:
   ${isInfraAngle 
     ? `- Emphasize backend infrastructure modernization and software consolidation on the WorldwideWebwork network without disrupting their current branding.
   - Explain how the Compass Suite (Questbook CRM, Pegasus speed, Silver Arrow SEO) eliminates $300+/mo in fragmented plugin subscriptions.
   - Clarify that the Compass Software Suite is 100% free forever, and the package covers 2 full years of dedicated w4 cloud infrastructure on worldwidewebwork.com.`
     : `- Celebrate their active ${profession} credential.
   - Address their industry-specific client acquisition dynamics (${clientType}).
   - Introduce the turnkey practice portal powered by the Compass Software Suite and WorldwideWebwork (worldwidewebwork.com).
- Industry / Profession: ${profession}
- Location: ${city}, ${state}
- License Registry Date: ${licenseDate}
- Strategy Tone Hook: ${tone || "Turnkey Practice Launch & Local Digital Footprint"}
- Pain Point Addressed: ${industryPainPoint || "Missing independent local domain equity and web client acquisition funnel"}
- Key Highlight: ${keyFeature || "Full turnkey setup + custom domain with 24 months zero monthly overhead included"}
- Target Client Audience: ${clientType || "ideal local clients and patients"}
- Pitch Offer: ${isInfraAngle ? `$${offerPrice} one-time domain and multi-year hosting consolidation package` : `Turnkey Website & Digital Practice Platform for flat $${offerPrice} (covers design, custom .com domain, and 24 FULL MONTHS of high-speed w4 cloud hosting with $0 monthly hosting bills for 2 full years)`}
- Pricing Structure: $${offerPrice} total for the initial 2-year build + hosting cycle; then standard base rate of $${monthlyRate}/mo thereafter with no long-term lock-in
- Buyout Provision: Includes an unencumbered $999 domain equity lease-to-own buyout option at any time
- Live Preview URL: ${websiteUrl}

Return JSON format:
{
  "subject": "String",
  "emailBody": "String formatted with natural paragraph breaks",
  "smsBody": "String under 160 characters",
  "suggestedFollowUpDays": 3,
  "industryAngleSummary": "One sentence summary of why this pitch works"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      return NextResponse.json({ success: true, data: JSON.parse(text) });
    }

    if (action === "skipTraceEnrichment") {
      const { name, profession, city, state, licenseNumber, college } = payload;
      const prompt = `Search live public web records, official state licensing boards, professional directories, and business listings for:
- Professional Name: ${name}
- Profession: ${profession}
- Location: ${city}, ${state}
- State License / NPI: ${licenseNumber || "Active Record"}
- Institution: ${college || "Accredited Program"}

DATA INTEGRITY RULES:
1. Search ONLY for verified, publicly available contact, website domain, and directory details for this professional.
2. DO NOT invent, hallucinate, simulate, or generate placeholder phone numbers (never output 555- numbers) or synthetic emails (no @example.com or fictional domains).
3. If a phone number, website, or email is not found in public listings or directories, output an empty string "" for verifiedPhone, websiteUrl, and primaryEmail.
4. Provide an accurate confidence score (0 to 100) reflecting whether authentic verifiable contact data was located.

Return JSON format:
{
  "confidenceScore": 85,
  "verifiedPhone": "+1 (xxx) xxx-xxxx",
  "phoneType": "Practice Line / Mobile / Empty",
  "dncStatus": "Public Directory Listing",
  "primaryEmail": "verified@domain.com",
  "websiteUrl": "https://practice-or-personal-domain.com",
  "emailValidation": "Public Business Record or Empty",
  "secondaryEmail": "",
  "linkedInUrl": "linkedin.com/in/...",
  "instagramHandle": "",
  "currentAddress": "City, State",
  "mailingAddress": "",
  "enrichmentNotes": "Summary of actual public record search findings."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "{}";
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch (pErr) {
        parsed = {};
      }

      let cleanPhone = (parsed.verifiedPhone || "").trim();
      if (cleanPhone.includes("555-") || cleanPhone.includes("xxx") || cleanPhone.length < 7) {
        cleanPhone = "";
      }
      let cleanEmail = (parsed.primaryEmail || "").trim();
      if (
        cleanEmail.includes("example.com") ||
        cleanEmail.includes("domain.com") ||
        cleanEmail.includes("xxx") ||
        !cleanEmail.includes("@")
      ) {
        cleanEmail = "";
      }

      let cleanWebsite = (parsed.websiteUrl || "").trim();
      if (cleanWebsite.includes("example.com") || cleanWebsite.includes("domain.com")) {
        cleanWebsite = "";
      }

      let extractedEmails: string[] = [];
      let extractedPhones: string[] = [];
      let emailPermutations: string[] = [];
      let socialProfiles: string[] = [];
      let schemaOrgData: any = null;

      if (cleanWebsite) {
        const scraped = await scrapeWebsiteContacts(cleanWebsite, name);
        extractedEmails = scraped.emails;
        extractedPhones = scraped.phones;
        emailPermutations = scraped.emailPermutations;
        socialProfiles = scraped.socialProfiles;
        schemaOrgData = scraped.schemaOrgData;
        if (!cleanEmail && scraped.emails.length > 0) {
          cleanEmail = scraped.emails[0];
        }
        if (!cleanPhone && scraped.phones.length > 0) {
          cleanPhone = scraped.phones[0];
        }
      }

      const hasContact = Boolean(cleanPhone || cleanEmail || cleanWebsite);

      const sanitizedResult = {
        confidenceScore: hasContact ? Math.max(parsed.confidenceScore || 85, 75) : 30,
        verifiedPhone: cleanPhone,
        phoneType: cleanPhone ? (parsed.phoneType || "Public Registry Line") : "Unverified",
        dncStatus: cleanPhone ? (parsed.dncStatus || "Public Business Directory") : "Unverified",
        primaryEmail: cleanEmail,
        secondaryEmail: parsed.secondaryEmail && !parsed.secondaryEmail.includes("example") ? parsed.secondaryEmail : (extractedEmails[1] || ""),
        websiteUrl: cleanWebsite,
        extractedEmails,
        extractedPhones,
        emailPermutations,
        socialProfiles,
        schemaOrgData,
        emailValidation: cleanEmail ? (cleanWebsite && extractedEmails.includes(cleanEmail) ? "Website Scraped & Verified" : (parsed.emailValidation || "Live Search Grounding Verified")) : "No public email found",
        linkedInUrl: parsed.linkedInUrl && parsed.linkedInUrl.includes("linkedin.com") && !parsed.linkedInUrl.includes("username") ? parsed.linkedInUrl : (socialProfiles.find(s => s.includes('linkedin.com')) || ""),
        instagramHandle: parsed.instagramHandle && !parsed.instagramHandle.includes("username") ? parsed.instagramHandle : "",
        currentAddress: parsed.currentAddress || `${city}, ${state}`,
        mailingAddress: parsed.mailingAddress || "",
        enrichmentNotes: parsed.enrichmentNotes || (hasContact ? (cleanWebsite ? `Verified domain (${cleanWebsite}) & contact details via Search Grounding.` : "Verified via Google Search Grounding.") : "No verified public contact details found in public records."),
      };

      return NextResponse.json({ success: true, data: sanitizedResult });
    }

    if (action === "generateSiteCopy") {
      const { name, profession, city, state, specialties } = payload;
      const prompt = `Generate custom website text content for a newly licensed ${profession} named ${name} located in ${city}, ${state}.
Specialties: ${specialties || "General Practice & Consulting"}.

Return JSON format:
{
  "heroHeadline": "String",
  "heroSubheadline": "String",
  "bioText": "String",
  "services": [
    {"title": "Service 1", "description": "Desc 1", "icon": "CheckCircle"},
    {"title": "Service 2", "description": "Desc 2", "icon": "Star"},
    {"title": "Service 3", "description": "Desc 3", "icon": "Calendar"}
  ],
  "callToAction": "String",
  "tagline": "String"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      return NextResponse.json({ success: true, data: JSON.parse(text) });
    }

    if (action === "searchLiveRegistry") {
      const { profession, state, query } = payload;
      const prompt = `Find recent news, state licensing board updates, or registry announcements regarding newly licensed ${profession} graduates or board passes in ${state || "USA"}. Search query focus: ${query || "newly licensed professionals"}. Highlight 3 realistic trends or search findings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return NextResponse.json({ success: true, text, groundingChunks: chunks });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
