import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onExtract: () => void;
  isLoading: boolean;
}

export function UrlInput({ url, onUrlChange, onExtract, isLoading }: UrlInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateUrl = (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setIsValid(null);
      return;
    }
    
    try {
      new URL(inputUrl);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    onUrlChange(newUrl);
    validateUrl(newUrl);
  };

  const handleExtract = () => {
    if (isValid && url.trim()) {
      onExtract();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <i className="fas fa-link text-blue-600"></i>
        Press Release URL
      </h2>
      
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="url"
            placeholder="https://example.com/press-release"
            value={url}
            onChange={handleUrlChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500 transition-colors pr-12"
            data-testid="input-url"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid === true && (
              <i className="fas fa-check-circle text-green-500" data-testid="icon-valid"></i>
            )}
            {isValid === false && (
              <i className="fas fa-exclamation-triangle text-red-500" data-testid="icon-invalid"></i>
            )}
            {isLoading && (
              <i className="fas fa-spinner animate-spin text-blue-500" data-testid="icon-loading"></i>
            )}
          </div>
        </div>
        
        {isValid === false && (
          <div className="text-sm text-red-600" data-testid="text-error">
            <i className="fas fa-exclamation-circle mr-1"></i>
            Please enter a valid URL format
          </div>
        )}
        
        <Button
          onClick={handleExtract}
          disabled={!isValid || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
          data-testid="button-extract"
        >
          <i className="fas fa-magic"></i>
          <span>{isLoading ? 'Extracting...' : 'Extract Keywords'}</span>
        </Button>
      </div>
    </div>
  );
}
