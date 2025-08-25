export interface FallbackKeywordResult {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  supportingKeywords: string[];
  confidenceScore: number;
}

export function extractKeywordsFallback(content: string): FallbackKeywordResult {
  const words = content.toLowerCase().split(/\s+/);
  const sentences = content.split(/[.!?]+/);
  
  // Common press release terms to identify
  const companyIndicators = /\b(inc|corp|ltd|llc|company|corporation|enterprises|technologies|solutions)\b/gi;
  const productIndicators = /\b(announces?|launches?|introduces?|releases?|unveils?)\s+[\w\s]{1,30}/gi;
  const peopleIndicators = /\b(ceo|president|director|manager|founder|chief)\s+[\w\s]{1,20}/gi;
  const locationIndicators = /\b[A-Z][a-z]+,?\s+[A-Z]{2}\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+/g;
  const dateIndicators = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}/gi;
  
  // Extract potential keywords using frequency analysis
  const wordFreq: { [key: string]: number } = {};
  const minWordLength = 3;
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'
  ]);
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length >= minWordLength && !stopWords.has(cleanWord)) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });
  
  // Sort by frequency
  const frequentWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 30)
    .map(([word]) => word);
  
  // Extract entities
  const companies = extractMatches(content, companyIndicators)
    .map(match => match.replace(/\b(inc|corp|ltd|llc)\b/gi, '').trim())
    .filter(company => company.length > 2);
  
  const products = extractMatches(content, productIndicators)
    .map(match => match.replace(/^(announces?|launches?|introduces?|releases?|unveils?)\s+/i, '').trim())
    .filter(product => product.length > 2);
  
  const people = extractMatches(content, peopleIndicators)
    .filter(person => person.length > 3);
  
  const locations = extractMatches(content, locationIndicators);
  const dates = extractMatches(content, dateIndicators);
  
  // Categorize keywords
  const primaryKeywords = [
    ...companies.slice(0, 2),
    ...products.slice(0, 2),
    ...frequentWords.slice(0, 3)
  ].filter(Boolean).slice(0, 6);
  
  const secondaryKeywords = [
    ...people.slice(0, 2),
    ...frequentWords.slice(3, 10),
  ].filter(Boolean).slice(0, 8);
  
  const supportingKeywords = [
    ...locations.slice(0, 2),
    ...dates.slice(0, 2),
    ...frequentWords.slice(10, 20)
  ].filter(Boolean).slice(0, 10);
  
  // Calculate confidence score based on extraction quality
  const totalExtracted = primaryKeywords.length + secondaryKeywords.length + supportingKeywords.length;
  const confidenceScore = Math.min(85, Math.max(40, totalExtracted * 4));
  
  return {
    primaryKeywords: [...new Set(primaryKeywords)],
    secondaryKeywords: [...new Set(secondaryKeywords)],
    supportingKeywords: [...new Set(supportingKeywords)],
    confidenceScore
  };
}

function extractMatches(content: string, pattern: RegExp): string[] {
  const matches = content.match(pattern) || [];
  return matches
    .map(match => match.trim())
    .filter(match => match.length > 0)
    .slice(0, 5); // Limit results
}
