interface ContentPreviewProps {
  content?: string;
  wordCount?: number;
  isLoading: boolean;
}

export function ContentPreview({ content, wordCount, isLoading }: ContentPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <i className="fas fa-eye text-slate-600"></i>
          Content Preview
          <span className="text-sm font-normal text-slate-500">(First 1000 characters)</span>
        </h3>
      </div>
      
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="animate-pulse space-y-4" data-testid="content-loading">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        )}
        
        {/* Content Display */}
        {!isLoading && content && (
          <div className="prose prose-slate max-w-none" data-testid="content-display">
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
              {content}
            </p>
            
            {wordCount && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <i className="fas fa-file-alt"></i>
                    <span data-testid="text-word-count">Word Count: {wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span>Valid Content</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !content && (
          <div className="text-center py-12 text-slate-500" data-testid="content-empty">
            <i className="fas fa-file-alt text-4xl mb-4 text-slate-300"></i>
            <p>Enter a URL above to preview the content</p>
          </div>
        )}
      </div>
    </div>
  );
}
