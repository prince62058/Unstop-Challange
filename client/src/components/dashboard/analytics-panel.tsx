import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsPanelProps {
  analytics?: {
    sentiment?: {
      positive: number;
      negative: number;
      neutral: number;
    };
    categories?: Array<{ category: string; count: number }>;
  };
  isLoading: boolean;
}

export default function AnalyticsPanel({ analytics, isLoading }: AnalyticsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-panel">
      {/* Email Analytics */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4" data-testid="analytics-title">Email Analytics</h3>
          
          {/* Sentiment Distribution */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Sentiment Distribution</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Positive</span>
                  </div>
                  <span className="text-sm font-medium" data-testid="sentiment-positive-percentage">
                    {analytics?.sentiment?.positive || 0}%
                  </span>
                </div>
                <Progress 
                  value={analytics?.sentiment?.positive || 0} 
                  className="h-2"
                  data-testid="progress-positive-sentiment"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                    <span className="text-sm">Neutral</span>
                  </div>
                  <span className="text-sm font-medium" data-testid="sentiment-neutral-percentage">
                    {analytics?.sentiment?.neutral || 0}%
                  </span>
                </div>
                <Progress 
                  value={analytics?.sentiment?.neutral || 0} 
                  className="h-2 bg-muted"
                  data-testid="progress-neutral-sentiment"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <span className="text-sm">Negative</span>
                  </div>
                  <span className="text-sm font-medium" data-testid="sentiment-negative-percentage">
                    {analytics?.sentiment?.negative || 0}%
                  </span>
                </div>
                <Progress 
                  value={analytics?.sentiment?.negative || 0} 
                  className="h-2"
                  data-testid="progress-negative-sentiment"
                />
              </div>
            </div>
          </div>

          {/* Response Time Stats */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Response Time</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="text-sm font-medium" data-testid="response-time-average">2.4 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fastest</span>
                <span className="text-sm font-medium text-green-500" data-testid="response-time-fastest">12 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Urgent Avg</span>
                <span className="text-sm font-medium text-primary" data-testid="response-time-urgent">45 minutes</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Top Categories</h4>
            <div className="space-y-2">
              {analytics?.categories && analytics.categories.length > 0 ? (
                analytics.categories.slice(0, 4).map((category, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between"
                    data-testid={`category-${index}`}
                  >
                    <span className="text-sm">{category.category}</span>
                    <span className="text-sm font-medium">{category.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No category data available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-bulk-response"
            >
              <i className="fas fa-magic mr-2"></i>
              Bulk Generate Responses
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-export-analytics"
            >
              <i className="fas fa-download mr-2"></i>
              Export Analytics
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-configure-filters"
            >
              <i className="fas fa-filter mr-2"></i>
              Configure Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
