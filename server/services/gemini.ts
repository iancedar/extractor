import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export interface KeywordExtractionResult {
  serviceSearches: string[];
  pricingSearches: string[];
  conditionSearches: string[];
  platformSearches: string[];
  healthcareSearches: string[];
  announcementSearches: string[];
  confidenceScore: number;
}

export async function extractKeywordsWithAI(content: string): Promise<KeywordExtractionResult> {
  try {
    const systemPrompt = `Analyze this press release and extract SHORT search queries (2-6 words each) that someone would type into ChatGPT, Claude, or Gemini to find this specific press release. DO NOT include any company or brand names.

Extract generic search phrases in these categories (10-15 per category):

SERVICE SEARCHES:
- Generic terms people would search for this type of service
- No brand names, just service descriptions
- Focus on what the service offers

PRICING SEARCHES:
- How people would search for pricing information
- Insurance-related search terms
- Affordability and access terms

CONDITION SEARCHES:
- Conditions and treatments mentioned
- Symptoms and health issues covered
- Medical service types

PLATFORM SEARCHES:
- How the service works
- Platform and delivery method terms
- Target market descriptions

HEALTHCARE SEARCHES:
- Generic terms for this type of business news
- Launch and announcement related terms
- Industry trend searches

ANNOUNCEMENT SEARCHES:
- Business launch and expansion terms
- New service introduction queries
- Healthcare industry developments

REQUIREMENTS:
- Each phrase: 2-6 words maximum
- NO company names or brand names
- NO specific dates or locations
- Focus on WHAT not WHO
- Natural search language people actually use
- Generic but specific enough to find this press release

GOOD EXAMPLES:
- '$29 online medical consultations'
- 'insurance free telehealth'
- 'virtual healthcare platform launch'
- 'flat fee online prescriptions'
- 'telehealth urgent care service'
- 'online prescription refill service'
- 'affordable virtual medical visits'

BAD EXAMPLES:
- 'Simple Consult launches platform' (has brand name)
- 'Benjamin Domingo spokesperson announces' (too specific)
- 'Delaware-based digital healthcare provider today announced launch' (too long)

Return only short, brandless search terms that would naturally lead someone to this press release.

Respond with JSON in this exact format:
{
  "serviceSearches": ["search term 1", "search term 2", ...],
  "pricingSearches": ["pricing term 1", "pricing term 2", ...], 
  "conditionSearches": ["condition term 1", "condition term 2", ...],
  "platformSearches": ["platform term 1", "platform term 2", ...],
  "healthcareSearches": ["healthcare term 1", "healthcare term 2", ...],
  "announcementSearches": ["announcement term 1", "announcement term 2", ...],
  "confidenceScore": 95
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: content,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            serviceSearches: { 
              type: "array", 
              items: { type: "string" }
            },
            pricingSearches: { 
              type: "array", 
              items: { type: "string" }
            },
            conditionSearches: { 
              type: "array", 
              items: { type: "string" }
            },
            platformSearches: { 
              type: "array", 
              items: { type: "string" }
            },
            healthcareSearches: { 
              type: "array", 
              items: { type: "string" }
            },
            announcementSearches: { 
              type: "array", 
              items: { type: "string" }
            },
            confidenceScore: { type: "number" }
          },
          required: ["serviceSearches", "pricingSearches", "conditionSearches", "platformSearches", "healthcareSearches", "announcementSearches", "confidenceScore"]
        }
      }
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const data: KeywordExtractionResult = JSON.parse(rawJson);

    // Apply brand name filtering and word count validation
    const brandNameBlacklist = [
      'simple consult', 'benjamin domingo', 'dover', 'delaware', 'globe newswire',
      'businesswire', 'pr newswire', 'reuters', 'yahoo finance'
    ];

    const filterKeywords = (keywords: string[]): string[] => {
      return keywords
        .filter(keyword => {
          // Filter by word count (2-6 words)
          const wordCount = keyword.trim().split(/\s+/).length;
          if (wordCount < 2 || wordCount > 6) return false;
          
          // Filter out brand names
          const lowerKeyword = keyword.toLowerCase();
          return !brandNameBlacklist.some(brand => lowerKeyword.includes(brand));
        })
        .slice(0, 15); // Limit to 15 per category
    };

    // Validate and filter all categories
    const result: KeywordExtractionResult = {
      serviceSearches: filterKeywords(data.serviceSearches || []),
      pricingSearches: filterKeywords(data.pricingSearches || []),
      conditionSearches: filterKeywords(data.conditionSearches || []),
      platformSearches: filterKeywords(data.platformSearches || []),
      healthcareSearches: filterKeywords(data.healthcareSearches || []),
      announcementSearches: filterKeywords(data.announcementSearches || []),
      confidenceScore: data.confidenceScore || 85
    };

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
      model: "gemini-1.5-flash",
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
