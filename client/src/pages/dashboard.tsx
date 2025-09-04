import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import EmailList from "@/components/dashboard/email-list";
import AIResponsePanel from "@/components/dashboard/ai-response-panel";
import AnalyticsPanel from "@/components/dashboard/analytics-panel";
import { useEmails } from "@/hooks/use-emails";
import { useAnalytics } from "@/hooks/use-analytics";
import type { IEmail } from "@shared/schema";

type ProcessedEmail = {
  id: string;
  sender: string;
  subject: string;
  body: string;
  receivedAt: string;
  priority: "urgent" | "normal";
  sentiment: "positive" | "negative" | "neutral";
  category?: string;
  extractedInfo?: any;
  hasResponse?: boolean;
  generatedResponse?: string;
};

type EmailStats = {
  totalEmails: number;
  urgentEmails: number;
  resolvedEmails: number;
  pendingEmails: number;
};

type AnalyticsData = {
  stats?: EmailStats;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  categories?: Array<{ category: string | null; count: number }>;
};

export default function Dashboard() {
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "urgent" | "normal">("all");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");

  const { 
    data: emails = [], 
    isLoading: emailsLoading, 
    refetch: refetchEmails 
  } = useEmails({
    query: searchQuery || undefined,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    sentiment: sentimentFilter === "all" ? undefined : sentimentFilter
  }) as { data: ProcessedEmail[]; isLoading: boolean; refetch: () => Promise<any> };

  const { 
    data: analytics,
    isLoading: analyticsLoading 
  } = useAnalytics() as { data: AnalyticsData; isLoading: boolean };

  const handleEmailSelect = (email: ProcessedEmail) => {
    setSelectedEmail(email);
  };

  const handleSyncEmails = async () => {
    try {
      // Call the sync endpoint to populate database with sample data
      const response = await fetch('/api/emails/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Email sync successful:', result.message);
        // Refresh the email list after syncing
        await refetchEmails();
      } else {
        console.error('Email sync failed:', response.status);
      }
    } catch (error) {
      console.error('Error during email sync:', error);
      // Fallback to just refetching if sync fails
      await refetchEmails();
    }
  };

  return (
    <div className="min-h-screen flex bg-background mobile-stack" data-testid="dashboard-page">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header onSyncEmails={handleSyncEmails} />
        
        {/* White & Pink Hero Section */}
        <section className="px-6 pb-4">
          <div className="glass-card p-6 rounded-xl fade-in bg-gradient-to-r from-pink-50/80 to-rose-50/80 border border-pink-200/50">
            <div className="flex items-center justify-between mobile-stack gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <i className="fas fa-chart-line text-pink-500"></i>
                  Professional Dashboard
                </h2>
                <p className="text-gray-600 text-sm">
                  AI assistant has processed <span className="font-semibold text-pink-600">{analytics?.stats?.totalEmails || 0}</span> emails 
                  and identified <span className="font-semibold text-orange-500">{analytics?.stats?.urgentEmails || 0}</span> urgent items.
                </p>
              </div>
              <div className="flex items-center gap-3 mobile-full">
                <div className="glass-card p-3 rounded-xl bg-pink-100/60 border border-pink-200/50">
                  <i className="fas fa-trending-up text-2xl text-pink-600"></i>
                </div>
                <div className="text-right mobile-hidden">
                  <div className="text-2xl font-bold text-pink-600">+24%</div>
                  <div className="text-xs text-gray-500">vs last week</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="px-6 pb-6 fade-in" style={{animationDelay: '0.2s'}}>
          <StatsCards 
            stats={analytics?.stats as EmailStats | undefined} 
            isLoading={analyticsLoading} 
          />
        </section>

        <section className="px-6 pb-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Email List - Takes more space on larger screens */}
            <div className="xl:col-span-3 fade-in" style={{animationDelay: '0.4s'}}>
              <div className="glass-card p-1 rounded-xl">
                <EmailList
                  emails={emails}
                  isLoading={emailsLoading}
                  onEmailSelect={handleEmailSelect}
                  selectedEmailId={selectedEmail?.id}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  priorityFilter={priorityFilter}
                  onPriorityFilterChange={setPriorityFilter}
                  sentimentFilter={sentimentFilter}
                  onSentimentFilterChange={setSentimentFilter}
                />
              </div>
            </div>

            {/* Side Panels */}
            <div className="space-y-6 fade-in" style={{animationDelay: '0.6s'}}>
              <AIResponsePanel 
                selectedEmail={selectedEmail}
                onResponseSent={() => refetchEmails()}
              />
              <AnalyticsPanel 
                analytics={analytics as { sentiment?: { positive: number; negative: number; neutral: number; }; categories?: Array<{ category: string; count: number; }>; }}
                isLoading={analyticsLoading}
              />
            </div>
          </div>
        </section>

        {/* Quick Actions Footer */}
        <section className="px-6 pb-6">
          <div className="glass-card p-6 rounded-xl fade-in" style={{animationDelay: '0.8s'}}>
            <h3 className="font-semibold mb-4 gradient-text">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="glass-card p-4 rounded-xl hover:shadow-lg transition-all text-center group">
                <i className="fas fa-plus text-2xl text-blue-500 mb-2 group-hover:scale-110 transition-transform"></i>
                <div className="text-sm font-medium">Compose Email</div>
              </button>
              <button className="glass-card p-4 rounded-xl hover:shadow-lg transition-all text-center group">
                <i className="fas fa-filter text-2xl text-green-500 mb-2 group-hover:scale-110 transition-transform"></i>
                <div className="text-sm font-medium">Smart Filter</div>
              </button>
              <button className="glass-card p-4 rounded-xl hover:shadow-lg transition-all text-center group">
                <i className="fas fa-robot text-2xl text-purple-500 mb-2 group-hover:scale-110 transition-transform"></i>
                <div className="text-sm font-medium">AI Insights</div>
              </button>
              <button className="glass-card p-4 rounded-xl hover:shadow-lg transition-all text-center group">
                <i className="fas fa-download text-2xl text-orange-500 mb-2 group-hover:scale-110 transition-transform"></i>
                <div className="text-sm font-medium">Export Data</div>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
