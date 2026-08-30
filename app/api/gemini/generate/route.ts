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
   - Clearly present the 2-Year Infrastructure Package ($0 monthly fees for 24 months).`}
   - Embed the live preview URL with a clear call-to-action.
   - Professional sign-off from "My Compass Consulting | worldwidewebwork.com".
3. SMS Text Message:
   - High-impact mobile message under 160 characters with recipient name, key benefit (2 yrs w4 hosting / Compass Suite), and preview link.

Return JSON strictly matching this structure:
{
  "subject": "String",
  "emailBody": "String formatted with natural paragraph breaks",
  "smsBody": "String under 160 characters",
  "suggestedFollowUpDays": 3,
  "industryAngleSummary": "One sentence summary of the pitch hook"
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
1. Search ONLY for verified, publicly available contact and directory details for this professional.
2. DO NOT invent, hallucinate, simulate, or generate placeholder phone numbers (never output 555- numbers) or synthetic emails (no @example.com or fictional domains).
3. If a phone number or email is not found in public listings or directories, output an empty string "" for verifiedPhone and primaryEmail.
4. Provide an accurate confidence score (0 to 100) reflecting whether authentic verifiable contact data was located.

Return JSON format:
{
  "confidenceScore": 85,
  "verifiedPhone": "+1 (xxx) xxx-xxxx",
  "phoneType": "Practice Line / Mobile / Empty",
  "dncStatus": "Public Directory Listing",
  "primaryEmail": "verified@domain.com",
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

      // Strict sanitization: ensure no mock, placeholder, or 555 numbers leak
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

      const hasContact = Boolean(cleanPhone || cleanEmail);

      const sanitizedResult = {
        confidenceScore: hasContact ? Math.max(parsed.confidenceScore || 85, 75) : 30,
        verifiedPhone: cleanPhone,
        phoneType: cleanPhone ? (parsed.phoneType || "Public Registry Line") : "Unverified",
        dncStatus: cleanPhone ? (parsed.dncStatus || "Public Business Directory") : "Unverified",
        primaryEmail: cleanEmail,
        emailValidation: cleanEmail ? (parsed.emailValidation || "Live Search Grounding Verified") : "No public email found",
        secondaryEmail: parsed.secondaryEmail && !parsed.secondaryEmail.includes("example") ? parsed.secondaryEmail : "",
        linkedInUrl: parsed.linkedInUrl && parsed.linkedInUrl.includes("linkedin.com") && !parsed.linkedInUrl.includes("username") ? parsed.linkedInUrl : "",
        instagramHandle: parsed.instagramHandle && !parsed.instagramHandle.includes("username") ? parsed.instagramHandle : "",
        currentAddress: parsed.currentAddress || `${city}, ${state}`,
        mailingAddress: parsed.mailingAddress || "",
        enrichmentNotes: parsed.enrichmentNotes || (hasContact ? "Verified via Google Search Grounding." : "No verified public contact details found in public records."),
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
