import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function run() {
  const targetProf = "beauty";
  const targetState = "AZ";
  const searchQuery = "newly licensed professionals 2026";
  const label = "Cosmetology & Esthetics";
  const targetLimit = 20;

  const prompt = `Search live official state licensing records, board pass public lists, or accredited school graduation directories for ${label} in state: ${targetState}.
Query details: ${searchQuery || "newly licensed professionals 2026"}.

Find up to ${Math.min(targetLimit, 20)} real, authentic newly licensed professionals.

MANDATORY DATA INTEGRITY RULES:
1. ONLY return real, authentic records found in live public search results.
2. DO NOT invent, hallucinate, or generate placeholder/mock phone numbers (NEVER return 555- numbers) or synthetic emails.
3. If phone or email is not verified from search results, return null or empty string for those fields.

Return ONLY valid JSON format matching:
{
  "leads": [
    {
      "fullName": "Real Professional Name",
      "city": "Real City in ${targetState}",
      "licenseNumber": "Official State License Number or N/A",
      "issueDate": "YYYY-MM-DD",
      "collegeOrSchool": "Real Accredited Institution or Board",
      "phone": null,
      "email": null
    }
  ]
}`;

  console.log("--- Inspecting full response with responseMimeType + googleSearch ---");
  try {
    const res1 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    });
    console.log("res1:", JSON.stringify(res1, null, 2));
  } catch (e) {
    console.log("res1 err:", e);
  }

  console.log("--- Inspecting response WITHOUT responseMimeType (natural text with JSON prompt) ---");
  try {
    const res2 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    console.log("res2 text:", res2.text);
    console.log("res2 grounding:", JSON.stringify(res2.candidates?.[0]?.groundingMetadata, null, 2));
  } catch (e) {
    console.log("res2 err:", e);
  }
}

run();
