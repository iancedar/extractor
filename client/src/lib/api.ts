import { apiRequest } from "./queryClient";
import type { ExtractionRequest, ExtractionResponse, HealthCheck, ApiStats } from "@shared/schema";

export const api = {
  extractKeywords: async (data: ExtractionRequest): Promise<ExtractionResponse> => {
    const response = await apiRequest('POST', '/api/extract-keywords', data);
    return response.json();
  },

  fetchContent: async (data: ExtractionRequest) => {
    const response = await apiRequest('POST', '/api/fetch-content', data);
    return response.json();
  },

  getHealth: async (): Promise<HealthCheck> => {
    const response = await apiRequest('GET', '/api/health');
    return response.json();
  },

  getStats: async (): Promise<ApiStats> => {
    const response = await apiRequest('GET', '/api/stats');
    return response.json();
  }
};
