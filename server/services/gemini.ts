import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export interface KeywordExtractionResult {
  headlinePhrases: string[];
  keyAnnouncements: string[];
  companyActions: string[];
  datesAndEvents: string[];
  productServiceNames: string[];
  executiveQuotes: string[];
  financialMetrics: string[];
  locations: string[];
  confidenceScore: number;
}

export async function extractKeywordsWithAI(content: string): Promise<KeywordExtractionResult> {
  try {
    const systemPrompt = `You are a professional keyword extraction specialist. Analyze this press release and extract complete, meaningful phrases that someone could use to search for this exact press release in ChatGPT, Claude, or Gemini.

Extract COMPLETE, READABLE phrases in these categories. Each phrase should be a natural, searchable sentence or phrase:

COMPANY & ANNOUNCEMENT:
- Extract the main company announcement (complete sentence)
- Company name and what they're launching/announcing
- Business model and service description

PRODUCTS & SERVICES:
- Full product/service names and descriptions
- Key features and benefits mentioned
- Platform or technology descriptions

EXECUTIVE INFORMATION:
- Complete executive quotes (full sentences)
- Executive names and titles
- Company spokesperson information

BUSINESS DETAILS:
- Target market and customer segments
- Pricing and availability information
- Geographic markets and locations

INDUSTRY CONTEXT:
- Healthcare sector and industry terms
- Competitive advantages mentioned
- Market positioning statements

TECHNICAL DETAILS:
- Technology platform descriptions
- Service delivery methods
- Integration capabilities

FORMAT REQUIREMENTS:
- Each keyword should be 5-25 words long
- Must be complete, readable phrases
- No fragments or incomplete sentences
- No repetition of the same information
- Each phrase should be unique and searchable

Return clean, complete phrases like:
- 'Simple Consult launches affordable virtual healthcare consultation platform'
- 'Delaware-based digital healthcare provider targets routine medical services'
- 'Benjamin Domingo announces mission to simplify healthcare access'

DO NOT return fragments like 'digital healthcare2w' or 'the service2w'

Respond with JSON in this exact format:
{
  "headlinePhrases": ["complete phrase 1", "complete phrase 2", ...],
  "keyAnnouncements": ["full announcement 1", "full announcement 2", ...],
  "companyActions": ["company action phrase 1", "company action phrase 2", ...],
  "datesAndEvents": ["date/event phrase 1", "date/event phrase 2", ...],
  "productServiceNames": ["product description 1", "service description 2", ...],
  "executiveQuotes": ["complete executive quote 1", "executive quote 2", ...],
  "financialMetrics": ["financial detail 1", "financial detail 2", ...],
  "locations": ["location detail 1", "location detail 2", ...],
  "confidenceScore": 95
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            headlinePhrases: { 
              type: "array", 
              items: { type: "string" }
            },
            keyAnnouncements: { 
              type: "array", 
              items: { type: "string" }
            },
            companyActions: { 
              type: "array", 
              items: { type: "string" }
            },
            datesAndEvents: { 
              type: "array", 
              items: { type: "string" }
            },
            productServiceNames: { 
              type: "array", 
              items: { type: "string" }
            },
            executiveQuotes: { 
              type: "array", 
              items: { type: "string" }
            },
            financialMetrics: { 
              type: "array", 
              items: { type: "string" }
            },
            locations: { 
              type: "array", 
              items: { type: "string" }
            },
            confidenceScore: { type: "number" }
          },
          required: ["headlinePhrases", "keyAnnouncements", "companyActions", "datesAndEvents", "productServiceNames", "executiveQuotes", "financialMetrics", "locations", "confidenceScore"]
        }
      },
      contents: content,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const result: KeywordExtractionResult = JSON.parse(rawJson);
    
    // Validate that all keywords exist in the content
    const allKeywords = [
      ...result.headlinePhrases,
      ...result.keyAnnouncements,
      ...result.companyActions,
      ...result.datesAndEvents,
      ...result.productServiceNames,
      ...result.executiveQuotes,
      ...result.financialMetrics,
      ...result.locations
    ];
    
    const contentLower = content.toLowerCase();
    const validKeywords = allKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    if (validKeywords.length < allKeywords.length * 0.7) {
      throw new Error("Too many keywords not found in content");
    }
    
    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to extract keywords with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkGeminiHealth(): Promise<{ status: 'available' | 'unavailable' | 'rate_limited', responseTime: number }> {
  const startTime = Date.now();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Health check - respond with 'OK'",
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.text?.includes('OK')) {
      return { status: 'available', responseTime };
    } else {
      return { status: 'unavailable', responseTime };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.message?.includes('quota') || error.message?.includes('rate')) {
      return { status: 'rate_limited', responseTime };
    }
    
    return { status: 'unavailable', responseTime };
  }
}
