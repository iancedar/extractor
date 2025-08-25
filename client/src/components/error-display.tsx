import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onUseFallback: () => void;
}

export function ErrorDisplay({ error, onRetry, onUseFallback }: ErrorDisplayProps) {
  const isRateLimit = error.includes('rate limit') || error.includes('quota');
  const isApiError = error.includes('API') || error.includes('Gemini');

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-8 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="fas fa-exclamation-triangle text-red-600"></i>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Extraction Failed</h3>
          <p className="text-red-700 mb-4" data-testid="text-error-message">
            {error}
          </p>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              data-testid="button-retry"
            >
              <i className="fas fa-redo mr-2"></i>
              Retry Extraction
            </Button>
            {isApiError && (
              <Button 
                onClick={onUseFallback}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                data-testid="button-fallback"
              >
                <i className="fas fa-cogs mr-2"></i>
                Use Fallback Method
              </Button>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-red-100 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-1">Troubleshooting Tips:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify the URL is accessible and contains valid content</li>
              {isRateLimit && <li>• Try again in a few minutes if rate limited</li>}
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
