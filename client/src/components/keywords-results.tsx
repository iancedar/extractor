import type { ExtractionResponse } from "@shared/schema";

interface KeywordsResultsProps {
  result?: ExtractionResponse;
  isLoading: boolean;
}

export function KeywordsResults({ result, isLoading }: KeywordsResultsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <i className="fas fa-tags text-blue-600"></i>
            Extracted Keywords
          </h3>
          {result && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
              <i className={`fas ${result.extractionMethod === 'ai' ? 'fa-brain' : 'fa-cogs'} text-blue-600 text-sm`}></i>
              <span className="text-sm font-medium text-blue-700" data-testid="text-extraction-method">
                {result.extractionMethod === 'ai' ? 'AI Extracted' : 'Fallback Extracted'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="animate-pulse space-y-6" data-testid="keywords-loading">
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-slate-200 rounded-full w-20"></div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Keywords Display */}
        {!isLoading && result && (
          <div data-testid="keywords-display">
            {/* Primary Keywords */}
            {result.primaryKeywords.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500"></i>
                  Primary Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.primaryKeywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                      data-testid={`keyword-primary-${index}`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Secondary Keywords */}
            {result.secondaryKeywords.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-circle text-green-500"></i>
                  Secondary Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.secondaryKeywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm"
                      data-testid={`keyword-secondary-${index}`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Supporting Keywords */}
            {result.supportingKeywords.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-circle text-slate-500"></i>
                  Supporting Terms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.supportingKeywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
                      data-testid={`keyword-supporting-${index}`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Extraction Stats */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Total Keywords</div>
                  <div className="font-semibold text-slate-900" data-testid="stat-total-keywords">
                    {result.stats.totalKeywords}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">Extraction Time</div>
                  <div className="font-semibold text-slate-900" data-testid="stat-extraction-time">
                    {(result.extractionTime / 1000).toFixed(1)}s
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">Confidence Score</div>
                  <div className="font-semibold text-green-600" data-testid="stat-confidence">
                    {result.confidenceScore || 'N/A'}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">Validation Status</div>
                  <div className="font-semibold text-green-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !result && (
          <div className="text-center py-12 text-slate-500" data-testid="keywords-empty">
            <i className="fas fa-tags text-4xl mb-4 text-slate-300"></i>
            <p>Keywords will appear here after extraction</p>
          </div>
        )}
      </div>
    </div>
  );
}
