import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractionRequestSchema, type ExtractionResponse, type HealthCheck, type ApiStats } from "@shared/schema";
import { fetchAndValidateContent, getContentPreview } from "./services/content-fetcher";
import { extractKeywordsWithAI, checkGeminiHealth } from "./services/gemini";
import { extractKeywordsFallback } from "./services/fallback-extractor";
import rateLimit from "express-rate-limit";

// Rate limiting
const extractionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: "Too many extraction requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 health checks per minute
  message: { error: "Too many health check requests." },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy setting for Replit environment
  app.set('trust proxy', true);
  
  // Health check endpoint
  app.get("/api/health", healthLimiter, async (req, res) => {
    try {
      const startTime = Date.now();
      const geminiStatus = await checkGeminiHealth();
      const responseTime = Date.now() - startTime;
      
      const health: HealthCheck = {
        status: geminiStatus.status === 'available' ? 'healthy' : 
                geminiStatus.status === 'rate_limited' ? 'degraded' : 'unhealthy',
        responseTime,
        lastChecked: new Date().toISOString(),
        geminiApiStatus: geminiStatus.status,
      };
      
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        geminiApiStatus: 'unavailable',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Extract keywords endpoint
  app.post("/api/extract-keywords", extractionLimiter, async (req, res) => {
    const startTime = Date.now();
    let extractionMethod: 'ai' | 'fallback' = 'ai';
    
    try {
      const { url, text, inputType } = extractionRequestSchema.parse(req.body);
      
      // Update API stats - request started
      const currentStats = await storage.getApiStats();
      await storage.updateApiStats({
        ...currentStats,
        totalRequests: currentStats.totalRequests + 1,
      });
      
      // Get content either from URL or directly from text
      let contentResult;
      let content: string;
      
      if (inputType === 'url' && url) {
        // Fetch and validate content from URL
        contentResult = await fetchAndValidateContent(url);
        content = contentResult.content;
      } else if (inputType === 'text' && text) {
        // Use provided text directly, validate it meets minimum requirements
        const wordCount = text.split(/\s+/).length;
        const isValid = text.length >= 100 && wordCount >= 20;
        
        if (!isValid) {
          throw new Error('Text content too short or insufficient for keyword extraction');
        }
        
        content = text.slice(0, 50000); // Limit content length for API
        contentResult = {
          content,
          wordCount,
          fetchTime: 0,
          isValid: true
        };
      } else {
        throw new Error('Invalid input: must provide either URL or text content');
      }
      
      let keywordResult;
      let confidenceScore = 0;
      
      try {
        // Try AI extraction first
        keywordResult = await extractKeywordsWithAI(content);
        confidenceScore = keywordResult.confidenceScore;
        extractionMethod = 'ai';
      } catch (aiError) {
        console.warn('AI extraction failed, using fallback:', aiError);
        // Fallback to rule-based extraction
        keywordResult = extractKeywordsFallback(content);
        confidenceScore = keywordResult.confidenceScore;
        extractionMethod = 'fallback';
      }
      
      const extractionTime = Date.now() - startTime;
      
      // Save extraction to storage
      const extraction = await storage.createExtraction({
        url: url ?? null,
        content,
        inputType,
        serviceSearches: keywordResult.serviceSearches,
        pricingSearches: keywordResult.pricingSearches,
        conditionSearches: keywordResult.conditionSearches,
        platformSearches: keywordResult.platformSearches,
        healthcareSearches: keywordResult.healthcareSearches,
        announcementSearches: keywordResult.announcementSearches,
        extractionMethod,
        confidenceScore,
        extractionTime,
      });
      
      // Update API stats - successful request
      await storage.updateApiStats({
        ...currentStats,
        totalRequests: currentStats.totalRequests + 1,
        successfulRequests: currentStats.successfulRequests + 1,
        totalResponseTime: currentStats.totalResponseTime + extractionTime,
      });
      
      const totalKeywords = extraction.serviceSearches.length + 
                          extraction.pricingSearches.length + 
                          extraction.conditionSearches.length + 
                          extraction.platformSearches.length + 
                          extraction.healthcareSearches.length + 
                          extraction.announcementSearches.length;

      const response: ExtractionResponse = {
        id: extraction.id,
        url: extraction.url || undefined,
        content: getContentPreview(extraction.content, 1000),
        inputType: extraction.inputType as 'url' | 'text',
        serviceSearches: extraction.serviceSearches,
        pricingSearches: extraction.pricingSearches,
        conditionSearches: extraction.conditionSearches,
        platformSearches: extraction.platformSearches,
        healthcareSearches: extraction.healthcareSearches,
        announcementSearches: extraction.announcementSearches,
        extractionMethod: extraction.extractionMethod as 'ai' | 'fallback' | 'enhanced',
        confidenceScore: extraction.confidenceScore ?? undefined,
        extractionTime: extraction.extractionTime,
        stats: {
          wordCount: contentResult.wordCount,
          totalKeywords,
          keywordsByCategory: {
            'service-searches': extraction.serviceSearches.length,
            'pricing-searches': extraction.pricingSearches.length,
            'condition-searches': extraction.conditionSearches.length,
            'platform-searches': extraction.platformSearches.length,
            'healthcare-searches': extraction.healthcareSearches.length,
            'announcement-searches': extraction.announcementSearches.length,
          },
        },
      };
      
      res.json(response);
      
    } catch (error) {
      const extractionTime = Date.now() - startTime;
      
      // Update API stats - failed request
      const currentStats = await storage.getApiStats();
      await storage.updateApiStats({
        ...currentStats,
        totalRequests: currentStats.totalRequests + 1,
        failedRequests: currentStats.failedRequests + 1,
        totalResponseTime: currentStats.totalResponseTime + extractionTime,
      });
      
      console.error('Extraction error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('URL')) {
          res.status(400).json({ error: 'Invalid URL format or URL not accessible' });
        } else if (error.message.includes('timeout')) {
          res.status(408).json({ error: 'Request timeout - the URL took too long to respond' });
        } else if (error.message.includes('quota') || error.message.includes('rate')) {
          res.status(429).json({ error: 'API rate limit exceeded. Please try again later.' });
        } else {
          res.status(500).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'An unexpected error occurred during extraction' });
      }
    }
  });

  // Fetch content endpoint (for preview) - only for URL inputs
  app.post("/api/fetch-content", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        throw new Error('URL is required');
      }
      const contentResult = await fetchAndValidateContent(url);
      
      res.json({
        content: getContentPreview(contentResult.content, 1000),
        wordCount: contentResult.wordCount,
        fetchTime: contentResult.fetchTime,
        isValid: contentResult.isValid,
      });
      
    } catch (error) {
      console.error('Content fetch error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch content' 
      });
    }
  });

  // API statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getApiStats();
      const recentExtractions = await storage.getRecentExtractions(5);
      
      const successRate = stats.totalRequests > 0 
        ? Math.round((stats.successfulRequests / stats.totalRequests) * 100 * 10) / 10 
        : 100;
      
      const avgResponseTime = stats.successfulRequests > 0 
        ? Math.round((stats.totalResponseTime / stats.successfulRequests) / 10) / 100 
        : 0;
      
      const apiStats: ApiStats = {
        totalRequests: stats.totalRequests,
        successRate,
        avgResponseTime,
        rateLimitStatus: 'Safe',
        recentActivity: recentExtractions.map(extraction => ({
          url: extraction.url ? new URL(extraction.url).hostname : extraction.inputType === 'text' ? 'Direct Text' : 'Unknown',
          timestamp: extraction.createdAt.toISOString(),
          success: true,
          method: extraction.extractionMethod,
        })),
      };
      
      res.json(apiStats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
