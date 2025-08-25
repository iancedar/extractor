export interface FallbackKeywordResult {
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

export function extractKeywordsFallback(content: string): FallbackKeywordResult {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = content.toLowerCase().split(/\s+/);
  
  // Enhanced patterns for comprehensive extraction
  const headlinePatterns = /^.{20,100}$|\b[A-Z][^.!?]{20,100}/gm;
  const announcementPatterns = /\b(announces?|launches?|introduces?|releases?|unveils?|expands?|partners?|acquires?)\b[^.!?]{10,150}/gi;
  const companyActionPatterns = /\b[A-Z][a-zA-Z\s&]{2,30}\b\s+(announces?|launches?|introduces?|partners?|expands?|acquires?|develops?|creates?)[^.!?]{5,100}/gi;
  const dateEventPatterns = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|Q[1-4]\s+\d{4}|\d{4}\s+(conference|summit|event|meeting)/gi;
  const productPatterns = /\b[A-Z][a-zA-Z\s]{2,40}\b\s+(platform|service|product|solution|technology|software|application|system)/gi;
  const quotePatterns = /"[^"]{20,200}"/g;
  const financialPatterns = /\$[\d,]+\.?\d*\s?(million|billion|thousand)?|\d+%\s+(growth|increase|decrease)|revenue\s+of\s+\$[\d,]+|funding\s+of\s+\$[\d,]+/gi;
  const locationPatterns = /\b[A-Z][a-z]+,?\s+[A-Z]{2}\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+\b|headquarters\s+in\s+[A-Z][a-z\s,]+/gi;
  
  // Extract N-grams for better phrase coverage
  const extractNGrams = (text: string, n: number): string[] => {
    const words = text.split(/\s+/).filter(word => word.length > 2);
    const ngrams: string[] = [];
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      if (ngram.length >= 10 && ngram.length <= 100) {
        ngrams.push(ngram);
      }
    }
    return ngrams;
  };
  
  // Extract meaningful phrases
  const bigrams = extractNGrams(content, 2);
  const trigrams = extractNGrams(content, 3);
  const fourgrams = extractNGrams(content, 4);
  
  // Enhanced frequency analysis with phrases
  const phraseFreq: { [key: string]: number } = {};
  [...bigrams, ...trigrams, ...fourgrams].forEach(phrase => {
    const cleanPhrase = phrase.toLowerCase().trim();
    if (cleanPhrase.length >= 10) {
      phraseFreq[cleanPhrase] = (phraseFreq[cleanPhrase] || 0) + 1;
    }
  });
  
  const topPhrases = Object.entries(phraseFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 50)
    .map(([phrase]) => phrase);
  
  // Extract by categories with enhanced patterns
  const headlinePhrases = [
    ...extractMatches(content, headlinePatterns).slice(0, 15),
    ...topPhrases.slice(0, 10)
  ].filter(phrase => phrase.length >= 10 && phrase.length <= 100);
  
  const keyAnnouncements = [
    ...extractMatches(content, announcementPatterns).slice(0, 15),
    ...sentences.filter(s => /\b(announces?|launches?|introduces?)\b/i.test(s)).slice(0, 10)
  ].filter(announcement => announcement.length >= 20);
  
  const companyActions = [
    ...extractMatches(content, companyActionPatterns).slice(0, 15),
    ...sentences.filter(s => /\b(partners?|expands?|acquires?)\b/i.test(s)).slice(0, 10)
  ].filter(action => action.length >= 15);
  
  const datesAndEvents = [
    ...extractMatches(content, dateEventPatterns).slice(0, 15),
    ...sentences.filter(s => /\b(conference|summit|event|meeting|quarter)\b/i.test(s)).slice(0, 10)
  ];
  
  const productServiceNames = [
    ...extractMatches(content, productPatterns).slice(0, 15),
    ...topPhrases.filter(p => /\b(platform|service|product|solution|technology)\b/i.test(p)).slice(0, 10)
  ];
  
  const executiveQuotes = [
    ...extractMatches(content, quotePatterns).slice(0, 15),
    ...sentences.filter(s => s.includes('said') || s.includes('stated')).slice(0, 10)
  ];
  
  const financialMetrics = [
    ...extractMatches(content, financialPatterns).slice(0, 15),
    ...sentences.filter(s => /\b(revenue|funding|growth|\$|%)\b/i.test(s)).slice(0, 10)
  ];
  
  const locations = [
    ...extractMatches(content, locationPatterns).slice(0, 15),
    ...sentences.filter(s => /\b(headquarters|based in|located)\b/i.test(s)).slice(0, 10)
  ];
  
  // Remove duplicates and ensure minimum length
  const dedupe = (arr: string[]): string[] => Array.from(new Set(arr.filter(item => item && item.length >= 5)));
  
  const result = {
    headlinePhrases: dedupe(headlinePhrases).slice(0, 15),
    keyAnnouncements: dedupe(keyAnnouncements).slice(0, 15),
    companyActions: dedupe(companyActions).slice(0, 15),
    datesAndEvents: dedupe(datesAndEvents).slice(0, 15),
    productServiceNames: dedupe(productServiceNames).slice(0, 15),
    executiveQuotes: dedupe(executiveQuotes).slice(0, 15),
    financialMetrics: dedupe(financialMetrics).slice(0, 15),
    locations: dedupe(locations).slice(0, 15)
  };
  
  // Calculate confidence score based on extraction quality
  const totalExtracted = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
  const confidenceScore = Math.min(90, Math.max(50, totalExtracted * 1.2));
  
  return {
    ...result,
    confidenceScore
  };
}

function extractMatches(content: string, pattern: RegExp): string[] {
  const matches = content.match(pattern) || [];
  return matches
    .map(match => match.trim())
    .filter(match => match.length > 0)
    .slice(0, 20); // Increased limit for more comprehensive extraction
}