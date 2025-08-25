export interface FallbackKeywordResult {
  serviceSearches: string[];
  pricingSearches: string[];
  conditionSearches: string[];
  platformSearches: string[];
  healthcareSearches: string[];
  announcementSearches: string[];
  confidenceScore: number;
}

export function extractKeywordsFallback(content: string): FallbackKeywordResult {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = content.toLowerCase().split(/\s+/);
  
  // Brand name blacklist for filtering
  const brandNameBlacklist = [
    'simple consult', 'benjamin domingo', 'dover', 'delaware', 'globe newswire',
    'businesswire', 'pr newswire', 'reuters', 'yahoo finance'
  ];

  // Patterns for extracting short search terms (2-6 words)
  const servicePatterns = /\b(virtual|online|telehealth|digital)\s+(healthcare|medical|consultation|platform)\b/gi;
  const pricingPatterns = /\$\d+\s+(consultation|visit|service)|flat\s+fee|affordable|insurance\s+free/gi;
  const conditionPatterns = /\b(UTI|acne|blood pressure|prescription refill|minor health|routine medical)\b/gi;
  const platformPatterns = /\b(online platform|virtual service|telehealth app|digital healthcare|mobile health)\b/gi;
  const healthcarePatterns = /\b(healthcare launch|medical service|virtual care|online medicine|digital health)\b/gi;
  const announcementPatterns = /\b(new service|platform launch|healthcare expansion|medical innovation)\b/gi;
  
  // Helper function to filter keywords by length and brand names
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

  // Extract short search queries by category
  const serviceSearches = [
    ...extractMatches(content, servicePatterns),
    'virtual healthcare consultations',
    'online medical platform',
    'telehealth urgent care',
    'digital healthcare service'
  ];
  
  const pricingSearches = [
    ...extractMatches(content, pricingPatterns),
    'affordable medical consultations',
    'flat fee healthcare',
    'insurance free telehealth',
    'low cost virtual care'
  ];
  
  const conditionSearches = [
    ...extractMatches(content, conditionPatterns),
    'online prescription refills',
    'virtual urgent care',
    'telehealth minor conditions',
    'online medical treatment'
  ];
  
  const platformSearches = [
    ...extractMatches(content, platformPatterns),
    'virtual healthcare platform',
    'online medical service',
    'telehealth app',
    'digital health platform'
  ];
  
  const healthcareSearches = [
    ...extractMatches(content, healthcarePatterns),
    'virtual medical care',
    'online healthcare platform',
    'telehealth service launch',
    'digital health innovation'
  ];
  
  const announcementSearches = [
    ...extractMatches(content, announcementPatterns),
    'healthcare platform launch',
    'new telehealth service',
    'virtual care expansion',
    'medical service announcement'
  ];
  
  const result = {
    serviceSearches: filterKeywords(serviceSearches),
    pricingSearches: filterKeywords(pricingSearches),
    conditionSearches: filterKeywords(conditionSearches),
    platformSearches: filterKeywords(platformSearches),
    healthcareSearches: filterKeywords(healthcareSearches),
    announcementSearches: filterKeywords(announcementSearches)
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