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
  
  // Enhanced patterns for comprehensive extraction of complete phrases
  const headlinePatterns = /^.{20,200}$|\b[A-Z][^.!?]{20,200}/gm;
  const announcementPatterns = /[^.!?]*\b(announces?|launches?|introduces?|releases?|unveils?|expands?|partners?|acquires?)\b[^.!?]*/gi;
  const companyActionPatterns = /[^.!?]*\b[A-Z][a-zA-Z\s&]{2,50}\b[^.!?]*\b(announces?|launches?|introduces?|partners?|expands?|acquires?|develops?|creates?)[^.!?]*/gi;
  const dateEventPatterns = /[^.!?]*\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}[^.!?]*|\d{1,2}\/\d{1,2}\/\d{4}[^.!?]*|Q[1-4]\s+\d{4}[^.!?]*|\d{4}\s+(conference|summit|event|meeting)[^.!?]*/gi;
  const productPatterns = /[^.!?]*\b[A-Z][a-zA-Z\s]{2,50}\b[^.!?]*\b(platform|service|product|solution|technology|software|application|system)[^.!?]*/gi;
  const quotePatterns = /"[^"]{30,300}"/g;
  const financialPatterns = /[^.!?]*\$[\d,]+\.?\d*\s?(million|billion|thousand)?[^.!?]*|[^.!?]*\d+%\s+(growth|increase|decrease)[^.!?]*|[^.!?]*revenue[^.!?]*\$[\d,]+[^.!?]*|[^.!?]*funding[^.!?]*\$[\d,]+[^.!?]*/gi;
  const locationPatterns = /[^.!?]*\b[A-Z][a-z]+,?\s+[A-Z]{2}\b[^.!?]*|[^.!?]*\b[A-Z][a-z]+\s+[A-Z][a-z]+\b[^.!?]*|[^.!?]*headquarters[^.!?]*[A-Z][a-z\s,]+[^.!?]*/gi;
  
  // Extract complete sentences and meaningful phrases
  const extractCompletePhrases = (text: string): string[] => {
    // Get complete sentences
    const completeSentences = text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length >= 30 && s.length <= 300);
    
    // Get meaningful clauses (text between commas that form complete thoughts)
    const meaningfulClauses = text.split(',')
      .map(clause => clause.trim())
      .filter(clause => clause.length >= 30 && clause.length <= 200 && /\b(the|a|an|this|that|these|those|our|their|his|her)\b/i.test(clause));
    
    return [...completeSentences, ...meaningfulClauses];
  };
  
  const completePhrases = extractCompletePhrases(content);
  
  // Extract by categories with complete phrase focus
  const headlinePhrases = [
    ...extractMatches(content, headlinePatterns),
    ...completePhrases.filter(p => p.length <= 150)
  ].filter(phrase => phrase.length >= 30 && phrase.length <= 300);
  
  const keyAnnouncements = [
    ...extractMatches(content, announcementPatterns),
    ...sentences.filter(s => /\b(announces?|launches?|introduces?)\b/i.test(s) && s.length >= 30)
  ].filter(announcement => announcement.length >= 30 && announcement.length <= 300);
  
  const companyActions = [
    ...extractMatches(content, companyActionPatterns),
    ...sentences.filter(s => /\b(partners?|expands?|acquires?)\b/i.test(s) && s.length >= 30)
  ].filter(action => action.length >= 30 && action.length <= 300);
  
  const datesAndEvents = [
    ...extractMatches(content, dateEventPatterns),
    ...sentences.filter(s => /\b(conference|summit|event|meeting|quarter)\b/i.test(s) && s.length >= 30)
  ].filter(event => event.length >= 30 && event.length <= 300);
  
  const productServiceNames = [
    ...extractMatches(content, productPatterns),
    ...completePhrases.filter(p => /\b(platform|service|product|solution|technology)\b/i.test(p))
  ].filter(product => product.length >= 30 && product.length <= 300);
  
  const executiveQuotes = [
    ...extractMatches(content, quotePatterns),
    ...sentences.filter(s => (s.includes('said') || s.includes('stated')) && s.length >= 30)
  ].filter(quote => quote.length >= 30 && quote.length <= 300);
  
  const financialMetrics = [
    ...extractMatches(content, financialPatterns),
    ...sentences.filter(s => /\b(revenue|funding|growth|\$|%)\b/i.test(s) && s.length >= 30)
  ].filter(metric => metric.length >= 30 && metric.length <= 300);
  
  const locations = [
    ...extractMatches(content, locationPatterns),
    ...sentences.filter(s => /\b(headquarters|based in|located)\b/i.test(s) && s.length >= 30)
  ].filter(location => location.length >= 30 && location.length <= 300);
  
  // Remove duplicates, ensure quality phrases, and clean up
  const dedupe = (arr: string[]): string[] => {
    return Array.from(new Set(
      arr
        .filter(item => item && item.length >= 30 && item.length <= 300)
        .map(item => item.trim().replace(/^[^a-zA-Z]*|[^a-zA-Z]*$/g, '')) // Remove leading/trailing non-letters
        .filter(item => item && /^[A-Z]/.test(item)) // Must start with capital letter
    ));
  };
  
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