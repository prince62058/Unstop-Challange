import { useAnalytics } from "@/hooks/use-analytics";
import StatsCards from "@/components/dashboard/stats-cards";
import AnalyticsPanel from "@/components/dashboard/analytics-panel";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface AnalyticsData {
  stats?: {
    totalEmails: number;
    urgentEmails: number;
    resolvedEmails: number;
    pendingEmails: number;
  };
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  categories?: Array<{ category: string | null; count: number }>;
}

export default function Analytics() {
  const { 
    data: analytics,
    isLoading: analyticsLoading 
  } = useAnalytics() as { data: AnalyticsData; isLoading: boolean };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Insights and metrics for your email management
          </p>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <StatsCards 
            totalEmails={analytics?.stats?.totalEmails || 0}
            urgentEmails={analytics?.stats?.urgentEmails || 0}
            resolvedEmails={analytics?.stats?.resolvedEmails || 0}
            pendingEmails={analytics?.stats?.pendingEmails || 0}
            loading={analyticsLoading}
          />

          {/* Analytics Panel */}
          <AnalyticsPanel analytics={analytics} loading={analyticsLoading} />

          {/* Additional Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-clock text-blue-500"></i>
                Response Time Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Response Time</span>
                  <span className="font-semibold text-blue-600">2.4 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Urgent Email Response</span>
                  <span className="font-semibold text-green-600">24 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Resolution Rate</span>
                  <span className="font-semibold text-purple-600">87%</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-users text-green-500"></i>
                Customer Satisfaction
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Satisfaction Score</span>
                  <span className="font-semibold text-green-600">4.6/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Positive Feedback</span>
                  <span className="font-semibold text-blue-600">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Repeat Issues</span>
                  <span className="font-semibold text-orange-600">8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}