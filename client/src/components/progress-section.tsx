import { useMemo } from "react";

interface ProgressSectionProps {
  progress: number;
}

export function ProgressSection({ progress }: ProgressSectionProps) {
  const steps = useMemo(() => [
    { id: 1, label: "Fetching Content", icon: "fas fa-download" },
    { id: 2, label: "Processing with AI", icon: "fas fa-brain" },
    { id: 3, label: "Validating Results", icon: "fas fa-check-circle" }
  ], []);

  const currentStep = Math.floor((progress / 100) * steps.length) + 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <i className="fas fa-tasks text-blue-600"></i>
        Extraction Progress
      </h3>
      
      <div className="space-y-4">
        {/* Progress Steps */}
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.id < currentStep 
                  ? 'bg-blue-600 text-white' 
                  : step.id === currentStep 
                    ? 'bg-blue-600 text-white animate-pulse' 
                    : 'bg-slate-200 text-slate-500'
              }`}>
                {step.id < currentStep ? (
                  <i className="fas fa-check"></i>
                ) : step.id === currentStep ? (
                  <i className="fas fa-spinner animate-spin"></i>
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-sm font-medium ${
                step.id === currentStep ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
            data-testid="progress-bar"
          ></div>
        </div>
        
        <div className="text-sm text-slate-600" data-testid="progress-status">
          Processing content... (Step {currentStep} of {steps.length})
        </div>
      </div>
    </div>
  );
}
