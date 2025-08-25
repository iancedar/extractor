import { useQuery } from "@tanstack/react-query";
import type { HealthCheck } from "@shared/schema";

export function ApiHealthStatus() {
  const { data: health, isLoading } = useQuery<HealthCheck>({
    queryKey: ['/api/health'],
    refetchInterval: 60000, // Check every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-700">Checking...</span>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const statusConfig = {
    healthy: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      dotColor: 'bg-green-500',
      textColor: 'text-green-700',
      label: 'API Healthy'
    },
    degraded: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      dotColor: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      label: 'API Degraded'
    },
    unhealthy: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      dotColor: 'bg-red-500',
      textColor: 'text-red-700',
      label: 'API Unhealthy'
    }
  };

  const config = statusConfig[health.status];

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 px-3 py-1.5 ${config.bgColor} rounded-full border ${config.borderColor}`}>
        <div className={`w-2 h-2 ${config.dotColor} rounded-full animate-pulse`}></div>
        <span className={`text-sm font-medium ${config.textColor}`} data-testid="text-api-status">
          {config.label}
        </span>
      </div>
      <div className="text-sm text-slate-600">
        <div data-testid="text-response-time">Response: {health.responseTime}ms</div>
        <div data-testid="text-last-checked">
          Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
