import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const extractions = pgTable("extractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  content: text("content").notNull(),
  serviceSearches: jsonb("service_searches").$type<string[]>().notNull(),
  pricingSearches: jsonb("pricing_searches").$type<string[]>().notNull(),
  conditionSearches: jsonb("condition_searches").$type<string[]>().notNull(),
  platformSearches: jsonb("platform_searches").$type<string[]>().notNull(),
  healthcareSearches: jsonb("healthcare_searches").$type<string[]>().notNull(),
  announcementSearches: jsonb("announcement_searches").$type<string[]>().notNull(),
  extractionMethod: text("extraction_method").notNull(), // 'ai' or 'fallback' or 'enhanced'
  confidenceScore: integer("confidence_score"), // 0-100
  extractionTime: integer("extraction_time").notNull(), // milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiStats = pgTable("api_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalRequests: integer("total_requests").default(0).notNull(),
  successfulRequests: integer("successful_requests").default(0).notNull(),
  failedRequests: integer("failed_requests").default(0).notNull(),
  totalResponseTime: integer("total_response_time").default(0).notNull(), // milliseconds
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const extractionRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const extractionResponseSchema = z.object({
  id: z.string(),
  url: z.string(),
  content: z.string(),
  serviceSearches: z.array(z.string()),
  pricingSearches: z.array(z.string()),
  conditionSearches: z.array(z.string()),
  platformSearches: z.array(z.string()),
  healthcareSearches: z.array(z.string()),
  announcementSearches: z.array(z.string()),
  extractionMethod: z.enum(['ai', 'fallback', 'enhanced']),
  confidenceScore: z.number().optional(),
  extractionTime: z.number(),
  stats: z.object({
    wordCount: z.number(),
    totalKeywords: z.number(),
    keywordsByCategory: z.record(z.number()),
  }),
});

export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  responseTime: z.number(),
  lastChecked: z.string(),
  geminiApiStatus: z.enum(['available', 'unavailable', 'rate_limited']),
});

export const apiStatsSchema = z.object({
  totalRequests: z.number(),
  successRate: z.number(),
  avgResponseTime: z.number(),
  rateLimitStatus: z.string(),
  recentActivity: z.array(z.object({
    url: z.string(),
    timestamp: z.string(),
    success: z.boolean(),
    method: z.string(),
  })),
});

export type ExtractionRequest = z.infer<typeof extractionRequestSchema>;
export type ExtractionResponse = z.infer<typeof extractionResponseSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type ApiStats = z.infer<typeof apiStatsSchema>;
export type Extraction = typeof extractions.$inferSelect;
export type InsertExtraction = typeof extractions.$inferInsert;
