import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DualInputProps {
  onExtract: (data: { inputType: 'url' | 'text'; url?: string; text?: string }) => void;
  isLoading: boolean;
}

export function DualInput({ onExtract, isLoading }: DualInputProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [textValid, setTextValid] = useState<boolean | null>(null);

  const validateUrl = (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setUrlValid(null);
      return;
    }
    
    try {
      new URL(inputUrl);
      setUrlValid(true);
    } catch {
      setUrlValid(false);
    }
  };

  const validateText = (inputText: string) => {
    if (!inputText.trim()) {
      setTextValid(null);
      return;
    }
    
    const wordCount = inputText.split(/\s+/).length;
    const isValid = inputText.length >= 100 && wordCount >= 20;
    setTextValid(isValid);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    validateText(newText);
  };

  const handleExtract = () => {
    if (activeTab === 'url' && urlValid && url.trim()) {
      onExtract({ inputType: 'url', url });
    } else if (activeTab === 'text' && textValid && text.trim()) {
      onExtract({ inputType: 'text', text });
    }
  };

  const isValidForSubmission = activeTab === 'url' ? urlValid : textValid;
  const currentInput = activeTab === 'url' ? url : text;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <i className="fas fa-edit text-blue-600"></i>
        Press Release Input
      </h2>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'text')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="url" className="flex items-center gap-2" data-testid="tab-url">
            <i className="fas fa-link text-sm"></i>
            URL
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2" data-testid="tab-text">
            <i className="fas fa-file-text text-sm"></i>
            Text
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Press Release URL
            </label>
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
                {urlValid === true && (
                  <i className="fas fa-check-circle text-green-500" data-testid="icon-url-valid"></i>
                )}
                {urlValid === false && (
                  <i className="fas fa-exclamation-triangle text-red-500" data-testid="icon-url-invalid"></i>
                )}
                {isLoading && activeTab === 'url' && (
                  <i className="fas fa-spinner animate-spin text-blue-500" data-testid="icon-url-loading"></i>
                )}
              </div>
            </div>
            {urlValid === false && (
              <div className="text-sm text-red-600" data-testid="text-url-error">
                <i className="fas fa-exclamation-circle mr-1"></i>
                Please enter a valid URL format
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Press Release Text
            </label>
            <div className="relative">
              <Textarea
                placeholder="Paste your press release content here (minimum 100 characters, 20 words)..."
                value={text}
                onChange={handleTextChange}
                rows={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500 transition-colors resize-none"
                data-testid="input-text"
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className={`${textValid === false ? 'text-red-600' : 'text-slate-500'}`} data-testid="text-length-info">
                {text.length} characters • {text.split(/\s+/).filter(word => word.length > 0).length} words
                {text.length < 100 && text.length > 0 && (
                  <span className="text-red-600 ml-2">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    Need {100 - text.length} more characters
                  </span>
                )}
              </div>
              {textValid === true && (
                <div className="text-green-600" data-testid="text-valid-indicator">
                  <i className="fas fa-check-circle mr-1"></i>
                  Ready for extraction
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <div className="mt-6">
          <Button
            onClick={handleExtract}
            disabled={!isValidForSubmission || !currentInput.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed w-full sm:w-auto"
            data-testid="button-extract"
          >
            <i className="fas fa-magic"></i>
            <span>
              {isLoading 
                ? 'Generating...' 
                : `Generate Search Queries from ${activeTab === 'url' ? 'URL' : 'Text'}`
              }
            </span>
          </Button>
        </div>
      </Tabs>
    </div>
  );
}