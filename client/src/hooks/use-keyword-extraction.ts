import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ExtractionRequest, ExtractionResponse } from "@shared/schema";

export function useKeywordExtraction() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResponse | undefined>(undefined);
  const [lastUrl, setLastUrl] = useState<string>("");
  const { toast } = useToast();

  const simulateProgress = useCallback(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      if (currentProgress >= 90) {
        setProgress(90);
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
      }
    }, 200);
    return interval;
  }, []);

  const extractKeywords = useCallback(async (url: string, useFallbackMode: boolean = false) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(undefined);
    setLastUrl(url);

    const progressInterval = simulateProgress();

    try {
      const requestData: ExtractionRequest = { url };
      const response = await apiRequest(
        'POST', 
        '/api/extract-keywords', 
        requestData
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const extractionResult: ExtractionResponse = await response.json();
      setResult(extractionResult);
      
      toast({
        title: "Keywords Extracted Successfully", 
        description: `Generated ${extractionResult.stats.totalKeywords} search queries across 6 categories using ${extractionResult.extractionMethod === 'ai' ? 'AI' : extractionResult.extractionMethod === 'enhanced' ? 'enhanced' : 'fallback'} method`,
      });
      
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Extraction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [simulateProgress, toast]);

  const retry = useCallback(() => {
    if (lastUrl) {
      extractKeywords(lastUrl);
    }
  }, [lastUrl, extractKeywords]);

  const useFallback = useCallback(() => {
    if (lastUrl) {
      extractKeywords(lastUrl, true);
    }
  }, [lastUrl, extractKeywords]);

  const extractMore = useCallback(() => {
    if (lastUrl) {
      // Run enhanced extraction with expanded parameters
      extractKeywords(lastUrl, false);
    }
  }, [lastUrl, extractKeywords]);

  return {
    extractKeywords,
    isLoading,
    progress,
    error,
    result,
    retry,
    useFallback,
    extractMore
  };
}
