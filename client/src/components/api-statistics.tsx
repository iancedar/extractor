import { useQuery } from "@tanstack/react-query";
import type { ApiStats } from "@shared/schema";

export function ApiStatistics() {
  const { data: stats, isLoading } = useQuery<ApiStats>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-8">
        <div className="p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-50 rounded-lg p-4">
                <div className="h-10 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-8">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <i className="fas fa-chart-line text-purple-600"></i>
          API Statistics & Performance
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Stat Cards */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-blue-600"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900" data-testid="stat-total-requests">
                  {stats.totalRequests.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Total Requests</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900" data-testid="stat-success-rate">
                  {stats.successRate}%
                </div>
                <div className="text-sm text-green-700">Success Rate</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-tachometer-alt text-purple-600"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900" data-testid="stat-avg-response">
                  {stats.avgResponseTime}s
                </div>
                <div className="text-sm text-purple-700">Avg Response</div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-orange-600"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-900" data-testid="stat-rate-limit">
                  {stats.rateLimitStatus}
                </div>
                <div className="text-sm text-orange-700">Rate Limit</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {stats.recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg text-sm"
                  data-testid={`activity-${index}`}
                >
                  <i className={`fas ${activity.success ? 'fa-check-circle text-green-500' : 'fa-exclamation-triangle text-yellow-500'}`}></i>
                  <span className="text-slate-600">
                    {activity.success ? 'Extracted keywords from' : 'Failed to process'}
                  </span>
                  <span className="font-medium text-slate-900">{activity.url}</span>
                  <span className="text-slate-500 ml-auto">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
