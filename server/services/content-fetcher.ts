import * as cheerio from 'cheerio';

export interface ContentResult {
  content: string;
  wordCount: number;
  fetchTime: number;
  isValid: boolean;
}

export async function fetchAndValidateContent(url: string): Promise<ContentResult> {
  const startTime = Date.now();
  
  try {
    // Validate URL format
    new URL(url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KeywordExtractor/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $('script, style, nav, header, footer, aside').remove();
    
    // Extract main content - try common content selectors
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.content',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '.main-content'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0 && element.text().trim().length > content.length) {
        content = element.text().trim();
      }
    }
    
    // Fallback to body content if no specific content found
    if (!content || content.length < 100) {
      content = $('body').text().trim();
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    const fetchTime = Date.now() - startTime;
    const wordCount = content.split(/\s+/).length;
    
    // Validate content quality
    const isValid = content.length >= 100 && wordCount >= 20;
    
    if (!isValid) {
      throw new Error('Content too short or insufficient for keyword extraction');
    }
    
    return {
      content: content.slice(0, 50000), // Limit content length for API
      wordCount,
      fetchTime,
      isValid
    };
    
  } catch (error) {
    const fetchTime = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the URL took too long to respond');
      }
      throw new Error(`Failed to fetch content: ${error.message}`);
    }
    
    throw new Error('Failed to fetch content: Unknown error');
  }
}

export function getContentPreview(content: string, maxLength: number = 1000): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.slice(0, maxLength) + '...';
}
