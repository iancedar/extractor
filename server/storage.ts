import { type Extraction, type InsertExtraction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createExtraction(extraction: Omit<InsertExtraction, 'id' | 'createdAt'>): Promise<Extraction>;
  getExtraction(id: string): Promise<Extraction | undefined>;
  getRecentExtractions(limit?: number): Promise<Extraction[]>;
  updateApiStats(stats: { 
    totalRequests: number; 
    successfulRequests: number; 
    failedRequests: number; 
    totalResponseTime: number; 
  }): Promise<void>;
  getApiStats(): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalResponseTime: number;
  }>;
}

export class MemStorage implements IStorage {
  private extractions: Map<string, Extraction>;
  private apiStats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalResponseTime: number;
  };

  constructor() {
    this.extractions = new Map();
    this.apiStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
    };
  }

  async createExtraction(extraction: Omit<InsertExtraction, 'id' | 'createdAt'>): Promise<Extraction> {
    const id = randomUUID();
    const newExtraction: Extraction = {
      ...extraction,
      url: extraction.url ?? null,
      confidenceScore: extraction.confidenceScore ?? null,
      id,
      createdAt: new Date(),
    };
    this.extractions.set(id, newExtraction);
    return newExtraction;
  }

  async getExtraction(id: string): Promise<Extraction | undefined> {
    return this.extractions.get(id);
  }

  async getRecentExtractions(limit: number = 10): Promise<Extraction[]> {
    return Array.from(this.extractions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async updateApiStats(stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalResponseTime: number;
  }): Promise<void> {
    this.apiStats = { ...stats };
  }

  async getApiStats(): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalResponseTime: number;
  }> {
    return { ...this.apiStats };
  }
}

export const storage = new MemStorage();
