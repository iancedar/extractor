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
    const systemPrompt = `Analyze this press release content thoroughly and extract comprehensive searchable keywords and phrases that actually exist in the text. Extract MORE keywords to ensure complete coverage.

Extract detailed, searchable keywords in these categories. For each category, provide 10-15 keywords minimum:

1. HEADLINE PHRASES (extract ALL significant 2-8 word phrases from headlines, subheadings, and titles)
2. KEY ANNOUNCEMENTS (extract MULTIPLE complete sentences and partial sentences about announcements, launches, partnerships, expansions)
3. COMPANY ACTIONS (extract ALL instances of company name + actions, including: launches, announces, partners, acquires, expands, introduces, develops, creates)
4. DATES & EVENTS (extract ALL temporal references: specific dates, quarters, years, timeframes, event names, conference names)
5. PRODUCT/SERVICE NAMES (extract ALL product names, service names, platform names, technology names, brand names mentioned)
6. EXECUTIVE QUOTES (extract MULTIPLE meaningful phrases from all quoted executives, spokespersons, leaders)
7. FINANCIAL/METRICS (extract ALL financial data: funding amounts, revenue figures, growth percentages, user numbers, market size, valuations)
8. LOCATIONS (extract ALL geographic references: cities, states, countries, regions, headquarters, office locations, market areas)

ENHANCED EXTRACTION RULES:
- Extract 10-15 keywords per category minimum
- Each keyword should be 2-20 words long (allow longer phrases)
- Include variations and synonyms from the text
- Extract both complete sentences and meaningful partial phrases
- Include industry-specific terminology that appears
- Extract competitor names and partner company names
- Include technical terms and product features mentioned
- Extract target market descriptions and customer segments

Be thorough and comprehensive - better to extract more relevant keywords than miss important searchable phrases.

Respond with JSON in this exact format:
{
  "headlinePhrases": ["phrase1", "phrase2", ...],
  "keyAnnouncements": ["announcement1", "announcement2", ...],
  "companyActions": ["action1", "action2", ...],
  "datesAndEvents": ["date1", "event1", ...],
  "productServiceNames": ["product1", "service1", ...],
  "executiveQuotes": ["quote1", "quote2", ...],
  "financialMetrics": ["metric1", "figure1", ...],
  "locations": ["location1", "location2", ...],
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
