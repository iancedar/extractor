import { useState } from "react";
import { UrlInput } from "@/components/url-input";
import { ProgressSection } from "@/components/progress-section";
import { ContentPreview } from "@/components/content-preview";
import { KeywordsResults } from "@/components/keywords-results";
import { ApiStatistics } from "@/components/api-statistics";
import { ErrorDisplay } from "@/components/error-display";
import { ApiHealthStatus } from "@/components/api-health-status";
import { useKeywordExtraction } from "@/hooks/use-keyword-extraction";

export default function Home() {
  const [url, setUrl] = useState("");
  const { 
    extractKeywords, 
    isLoading, 
    progress, 
    error, 
    result, 
    retry,
    useFallback,
    extractMore
  } = useKeywordExtraction();

  const handleExtract = async () => {
    if (url.trim()) {
      await extractKeywords(url);
    }
  };

  return (
    <div className="bg-slate-50 font-inter text-slate-800 antialiased min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-key text-white text-sm"></i>
                </div>
                Press Release Keyword Extractor
              </h1>
              <p className="text-slate-600 mt-1">Extract 50-100 comprehensive keywords from press releases across 8 detailed categories</p>
            </div>
            
            <ApiHealthStatus />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* URL Input Section */}
        <UrlInput 
          url={url}
          onUrlChange={setUrl}
          onExtract={handleExtract}
          isLoading={isLoading}
          data-testid="url-input-section"
        />

        {/* Progress Section */}
        {isLoading && (
          <ProgressSection 
            progress={progress}
            data-testid="progress-section"
          />
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Content Preview Panel */}
          <ContentPreview 
            content={result?.content}
            wordCount={result?.stats?.wordCount}
            isLoading={isLoading}
            data-testid="content-preview"
          />

          {/* Keywords Results Panel */}
          <KeywordsResults 
            result={result}
            isLoading={isLoading}
            onExtractMore={extractMore}
            data-testid="keywords-results"
          />
        </div>

        {/* API Statistics Panel */}
        <ApiStatistics data-testid="api-statistics" />

        {/* Error Display Panel */}
        {error && (
          <ErrorDisplay 
            error={error}
            onRetry={retry}
            onUseFallback={useFallback}
            data-testid="error-display"
          />
        )}
        
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <p>&copy; 2024 Press Release Keyword Extractor. Built with Gemini AI.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-sm text-slate-600">
                <span className="font-medium">Security:</span> API keys encrypted, rate limited, validated
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium">Performance:</span> Average response time monitored
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
