import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ExtractionResponse } from "@shared/schema";

interface DebugPanelProps {
  result?: ExtractionResponse;
  rawContent?: string;
  onToggle: () => void;
  isVisible: boolean;
}

export function DebugPanel({ result, rawContent, onToggle, isVisible }: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'response' | 'analysis'>('content');

  if (!result) return null;

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50">
      <div className="p-4 border-b border-orange-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
            <i className="fas fa-bug"></i>
            Debug Information
          </h4>
          <Button 
            onClick={onToggle} 
            variant="ghost" 
            size="sm"
            className="text-orange-600 hover:text-orange-800"
          >
            {isVisible ? 'Hide' : 'Show'} Debug Info
          </Button>
        </div>
      </div>
      
      {isVisible && (
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1 text-xs rounded ${
                activeTab === 'content' 
                  ? 'bg-orange-200 text-orange-800' 
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              Raw Content
            </button>
            <button
              onClick={() => setActiveTab('response')}
              className={`px-3 py-1 text-xs rounded ${
                activeTab === 'response' 
                  ? 'bg-orange-200 text-orange-800' 
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              API Response
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1 text-xs rounded ${
                activeTab === 'analysis' 
                  ? 'bg-orange-200 text-orange-800' 
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              Quality Analysis
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'content' && (
              <div className="bg-white p-3 rounded border text-xs font-mono">
                <div className="text-orange-700 font-semibold mb-2">
                  First 500 characters of fetched content:
                </div>
                <div className="text-slate-700 whitespace-pre-wrap">
                  {rawContent?.slice(0, 500) || result.content}
                  {(rawContent?.length || result.content.length) > 500 && '...'}
                </div>
              </div>
            )}

            {activeTab === 'response' && (
              <div className="bg-white p-3 rounded border text-xs font-mono">
                <div className="text-orange-700 font-semibold mb-2">
                  Raw extraction results:
                </div>
                <pre className="text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify({
                    extractionMethod: result.extractionMethod,
                    confidenceScore: result.confidenceScore,
                    extractionTime: result.extractionTime,
                    totalKeywords: result.stats.totalKeywords,
                    keywordsByCategory: result.stats.keywordsByCategory
                  }, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="bg-white p-3 rounded border text-xs">
                <div className="text-orange-700 font-semibold mb-2">
                  Quality Analysis:
                </div>
                <div className="space-y-2 text-slate-700">
                  {Object.entries({
                    'Headline Phrases': result.headlinePhrases,
                    'Key Announcements': result.keyAnnouncements,
                    'Company Actions': result.companyActions,
                    'Dates & Events': result.datesAndEvents,
                    'Products & Services': result.productServiceNames,
                    'Executive Quotes': result.executiveQuotes,
                    'Financial Metrics': result.financialMetrics,
                    'Locations': result.locations
                  }).map(([category, keywords]) => {
                    const avgLength = keywords.length > 0 
                      ? Math.round(keywords.reduce((sum, k) => sum + k.length, 0) / keywords.length)
                      : 0;
                    
                    const avgWords = keywords.length > 0
                      ? Math.round(keywords.reduce((sum, k) => sum + k.split(' ').length, 0) / keywords.length)
                      : 0;

                    return (
                      <div key={category} className="flex justify-between">
                        <span>{category}:</span>
                        <span>{keywords.length} phrases (avg: {avgWords} words, {avgLength} chars)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}