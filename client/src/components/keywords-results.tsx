import type { ExtractionResponse } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DebugPanel } from "./debug-panel";

interface KeywordsResultsProps {
  result?: ExtractionResponse;
  isLoading: boolean;
  onExtractMore?: () => void;
  rawContent?: string;
}

const categoryConfig = {
  serviceSearches: { 
    label: "Service Searches", 
    icon: "fas fa-stethoscope", 
    bgColor: "bg-blue-50", 
    textColor: "text-blue-700", 
    borderColor: "border-blue-200",
    hoverColor: "hover:bg-blue-100",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  pricingSearches: { 
    label: "Pricing Searches", 
    icon: "fas fa-dollar-sign", 
    bgColor: "bg-green-50", 
    textColor: "text-green-700", 
    borderColor: "border-green-200",
    hoverColor: "hover:bg-green-100",
    badgeColor: "bg-green-100 text-green-700"
  },
  conditionSearches: { 
    label: "Condition Searches", 
    icon: "fas fa-pills", 
    bgColor: "bg-red-50", 
    textColor: "text-red-700", 
    borderColor: "border-red-200",
    hoverColor: "hover:bg-red-100",
    badgeColor: "bg-red-100 text-red-700"
  },
  platformSearches: { 
    label: "Platform Searches", 
    icon: "fas fa-laptop-medical", 
    bgColor: "bg-purple-50", 
    textColor: "text-purple-700", 
    borderColor: "border-purple-200",
    hoverColor: "hover:bg-purple-100",
    badgeColor: "bg-purple-100 text-purple-700"
  },
  healthcareSearches: { 
    label: "Healthcare Searches", 
    icon: "fas fa-heart", 
    bgColor: "bg-pink-50", 
    textColor: "text-pink-700", 
    borderColor: "border-pink-200",
    hoverColor: "hover:bg-pink-100",
    badgeColor: "bg-pink-100 text-pink-700"
  },
  announcementSearches: { 
    label: "Announcement Searches", 
    icon: "fas fa-bullhorn", 
    bgColor: "bg-orange-50", 
    textColor: "text-orange-700", 
    borderColor: "border-orange-200",
    hoverColor: "hover:bg-orange-100",
    badgeColor: "bg-orange-100 text-orange-700"
  }
};

export function KeywordsResults({ result, isLoading, onExtractMore, rawContent }: KeywordsResultsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLengthFilter, setSelectedLengthFilter] = useState("all");
  const [showDebug, setShowDebug] = useState(false);

  const filterKeywords = (keywords: string[]) => {
    let filtered = keywords;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Length filter
    if (selectedLengthFilter !== "all") {
      filtered = filtered.filter(keyword => {
        const wordCount = keyword.split(' ').length;
        switch (selectedLengthFilter) {
          case "short": return wordCount >= 2 && wordCount <= 3;
          case "medium": return wordCount >= 4 && wordCount <= 5;
          case "long": return wordCount === 6;
          default: return true;
        }
      });
    }
    
    return filtered;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <i className="fas fa-search text-blue-600"></i>
            Short Search Queries (2-6 Words)
          </h3>
          {result && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
              <i className={`fas ${result.extractionMethod === 'ai' ? 'fa-brain' : result.extractionMethod === 'enhanced' ? 'fa-magic' : 'fa-cogs'} text-blue-600 text-sm`}></i>
              <span className="text-sm font-medium text-blue-700" data-testid="text-extraction-method">
                {result.extractionMethod === 'ai' ? 'AI Enhanced' : 
                 result.extractionMethod === 'enhanced' ? 'Advanced Extraction' : 'Fallback Method'}
              </span>
            </div>
          )}
        </div>
        
        {result && (
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
                data-testid="input-keyword-search"
              />
              <select 
                value={selectedLengthFilter}
                onChange={(e) => setSelectedLengthFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                data-testid="select-length-filter"
              >
                <option value="all">All lengths</option>
                <option value="short">Short (2-3 words)</option>
                <option value="medium">Medium (4-5 words)</option>
                <option value="long">Long (6 words)</option>
              </select>
            </div>
            {onExtractMore && (
              <Button
                onClick={onExtractMore}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                data-testid="button-extract-more"
              >
                <i className="fas fa-plus"></i>
                Extract More
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="animate-pulse space-y-6" data-testid="keywords-loading">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="h-8 bg-slate-200 rounded-full w-24"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Keywords Display */}
        {!isLoading && result && (
          <div data-testid="keywords-display">
            {/* Total Keywords Display */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600" data-testid="stat-total-keywords">
                  {result.stats.totalKeywords}
                </div>
                <div className="text-sm text-slate-600">Total Search Queries Generated</div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 text-xs text-center">
                <div>
                  <div className="font-medium text-slate-700">Extraction Time</div>
                  <div className="text-blue-600" data-testid="stat-extraction-time">
                    {(result.extractionTime / 1000).toFixed(1)}s
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-700">Confidence</div>
                  <div className="text-green-600" data-testid="stat-confidence">
                    {result.confidenceScore || 'N/A'}%
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-700">Word Count</div>
                  <div className="text-purple-600">
                    {result.stats.wordCount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-slate-700">Categories</div>
                  <div className="text-orange-600">8</div>
                </div>
              </div>
            </div>

            {/* Category Sections */}
            {Object.entries(categoryConfig).map(([key, config]) => {
              const keywords = result[key as keyof typeof result] as string[];
              const filteredKeywords = filterKeywords(keywords || []);
              
              if (!filteredKeywords.length) return null;
              
              return (
                <div key={key} className="mb-6">
                  <h4 className={`text-sm font-semibold ${config.textColor} mb-3 flex items-center gap-2`}>
                    <i className={`${config.icon} text-slate-500`}></i>
                    {config.label}
                    <span className={`text-xs ${config.badgeColor} px-2 py-1 rounded-full`}>
                      {filteredKeywords.length}
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filteredKeywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className={`${config.bgColor} ${config.textColor} px-3 py-1.5 rounded-lg text-sm ${config.borderColor} ${config.hoverColor} border transition-colors cursor-pointer`}
                        data-testid={`keyword-${key}-${index}`}
                        title={`${keyword.split(' ').length} words`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Category Distribution */}
            <div className="bg-slate-50 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Search Query Distribution</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const count = result.stats.keywordsByCategory?.[key.replace(/([A-Z])/g, '-$1').toLowerCase()] || 0;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-slate-600">{config.label}</span>
                      <span className={`font-medium ${config.textColor}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !result && (
          <div className="text-center py-12 text-slate-500" data-testid="keywords-empty">
            <i className="fas fa-tags text-4xl mb-4 text-slate-300"></i>
            <p className="text-lg font-medium mb-2">No Search Queries Yet</p>
            <p>Enter a press release URL above to generate short, brandless search queries people would use to find this press release</p>
          </div>
        )}

        {/* Debug Panel */}
        {result && (
          <DebugPanel
            result={result}
            rawContent={rawContent}
            isVisible={showDebug}
            onToggle={() => setShowDebug(!showDebug)}
          />
        )}
      </div>
    </div>
  );
}
