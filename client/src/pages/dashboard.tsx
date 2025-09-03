import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import EmailList from "@/components/dashboard/email-list";
import AIResponsePanel from "@/components/dashboard/ai-response-panel";
import AnalyticsPanel from "@/components/dashboard/analytics-panel";
import { useEmails } from "@/hooks/use-emails";
import { useAnalytics } from "@/hooks/use-analytics";
import type { Email } from "@shared/schema";

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
    await refetchEmails();
  };

  return (
    <div className="min-h-screen flex bg-background" data-testid="dashboard-page">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header onSyncEmails={handleSyncEmails} />
        
        <section className="p-6">
          <StatsCards 
            stats={analytics?.stats as EmailStats | undefined} 
            isLoading={analyticsLoading} 
          />
        </section>

        <section className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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

            <div className="space-y-6">
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
      </main>
    </div>
  );
}
