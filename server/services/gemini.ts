import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export interface KeywordExtractionResult {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  supportingKeywords: string[];
  confidenceScore: number;
}

export async function extractKeywordsWithAI(content: string): Promise<KeywordExtractionResult> {
  try {
    const systemPrompt = `You are an expert at extracting searchable keywords from press releases. 
Analyze the content and extract keywords that would help users find this press release in LLM conversations.

Categorize keywords into:
1. Primary Keywords: Company names, product names, main announcements (4-6 keywords)
2. Secondary Keywords: Industry terms, key people, technical concepts (6-8 keywords)  
3. Supporting Keywords: Dates, locations, supporting details (6-10 keywords)

Only extract keywords that actually exist in the content. Provide a confidence score (0-100).

Respond with JSON in this exact format:
{
  "primaryKeywords": ["keyword1", "keyword2"],
  "secondaryKeywords": ["keyword1", "keyword2"], 
  "supportingKeywords": ["keyword1", "keyword2"],
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
            primaryKeywords: { 
              type: "array", 
              items: { type: "string" }
            },
            secondaryKeywords: { 
              type: "array", 
              items: { type: "string" }
            },
            supportingKeywords: { 
              type: "array", 
              items: { type: "string" }
            },
            confidenceScore: { type: "number" }
          },
          required: ["primaryKeywords", "secondaryKeywords", "supportingKeywords", "confidenceScore"]
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
      ...result.primaryKeywords,
      ...result.secondaryKeywords,
      ...result.supportingKeywords
    ];
    
    const contentLower = content.toLowerCase();
    const validKeywords = allKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    if (validKeywords.length < allKeywords.length * 0.8) {
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
