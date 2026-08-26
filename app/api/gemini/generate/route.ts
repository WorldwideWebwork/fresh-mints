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

      const prompt = `You are a senior practice launch advisor at "My Compass Consulting", reaching out to a newly licensed practitioner.
Generate an industry-tailored cold email pitch and matching SMS text message for:
- Professional Name: ${name}
- Industry / Profession: ${profession} (${professionCategory || "General Practice"})
- Location: ${city || "Metro Area"}, ${state}
- License Registry Date: ${licenseDate || "Recently Issued Active Board Pass"}
- Target Client/Patient Audience: ${clientType || "ideal local clients and patients"}
- Specific Industry Pain Point: ${industryPainPoint || "Establishing immediate local trust and patient acquisition without huge tech overhead"}
- Turnkey Compass Suite Tool: ${keyFeature || "Automated Consultation Intake & Client Booking Calendar"}
- Live Site Preview URL: ${websiteUrl || "https://freshmints.ai.studio/preview/site-123"}
- Chosen Tone / Strategic Angle: ${tone || "Warm, Celebratory & Authoritative"}
- 2-Year Hosting Package Offer: Flat $${offerPrice || "1,650"} total (covers entire build, custom .com domain, and 24 FULL MONTHS of high-speed w4 cloud hosting & SSL encryption with $0 monthly hosting bills for 2 full years)
- Post-Promotional Continuity: Transparent continuation at standard w4 base hosting rate of $${monthlyRate || "34.99"}/mo with NO lock-in contracts
- Domain Equity Buyout Clause: Guaranteed unencumbered $999 lease-to-own domain transfer option
- Agency / Sender Identity: "My Compass Consulting" (Practice Launch Solutions)

Pitch Writing Mandates:
1. Subject Line: High-converting, tailored to their exact profession and city/state milestone.
2. Email Body:
   - Celebrate their newly active ${profession} credential.
   - Address their industry-specific client acquisition dynamics (${clientType}).
   - Introduce the personalized practice web portal powered by Compass Software Suite and My Compass Consulting.
   - Clearly present the 2-Year Hosting Package: $${offerPrice || "1,650"} flat covering 24 months of zero monthly hosting fees on w4 cloud infrastructure, custom domain registration, transparent rollover rate ($${monthlyRate || "34.99"}/mo), and the $999 domain buyout equity clause.
   - Embed the live preview URL with clear call-to-action.
   - Professional sign-off from "My Compass Consulting".
3. SMS Text Message:
   - High-impact mobile message under 160 characters with recipient name, profession milestone, 2-yr hosting highlight, and preview link.

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
      const prompt = `Perform a simulated public record skip-trace and background analysis for:
- Full Name: ${name}
- Profession: ${profession}
- Location: ${city}, ${state}
- License #: ${licenseNumber || "State Active Record"}
- University/School: ${college || "State Accredited Program"}

Generate plausible, realistic public record skip-trace findings for outreach purposes:
- Phone number (mobile with carrier type, landline)
- Email addresses (personal & work/practice format)
- Social media profiles (LinkedIn handle, Instagram handle)
- Mailing address & residence history
- Skip trace confidence score (85-99%)
- Recommended outreach channel (Email, Phone, SMS, LinkedIn)

Return JSON format:
{
  "confidenceScore": 94,
  "verifiedPhone": "+1 (xxx) xxx-xxxx",
  "phoneType": "Mobile (Verizon Wireless)",
  "dncStatus": "Clean - Not on DNC List",
  "primaryEmail": "name@domain.com",
  "emailValidation": "Deliverable (100% Score)",
  "secondaryEmail": "name.work@gmail.com",
  "linkedInUrl": "linkedin.com/in/username",
  "instagramHandle": "@username.pro",
  "currentAddress": "123 Main St, City, State ZIP",
  "mailingAddress": "PO Box or Street",
  "enrichmentNotes": "Summary of public record match details."
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
