import { useState } from "react";
import { useEmails } from "@/hooks/use-emails";
import EmailCard from "@/components/dashboard/email-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

interface ProcessedEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  receivedAt: Date;
  priority: "urgent" | "normal";
  sentiment: "positive" | "negative" | "neutral";
  category: string;
  extractedInfo: any;
  hasResponse: boolean;
  generatedResponse?: string;
}

export default function Emails() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "urgent" | "normal">("all");
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null);

  const { 
    data: emails = [], 
    isLoading: emailsLoading 
  } = useEmails({
    query: searchQuery || undefined,
    priority: priorityFilter === "all" ? undefined : priorityFilter
  }) as { data: ProcessedEmail[]; isLoading: boolean };

  const handleEmailSelect = (email: ProcessedEmail) => {
    setSelectedEmail(email);
  };

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
            Email Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all incoming emails
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value as "all" | "urgent" | "normal")}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {/* Email List */}
      <div className="grid gap-4">
        {emailsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : emails.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <i className="fas fa-inbox text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">No emails found</h3>
            <p className="text-muted-foreground">Click "Sync Emails" to load sample data</p>
          </div>
        ) : (
          emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onClick={() => handleEmailSelect(email)}
              isSelected={selectedEmail?.id === email.id}
            />
          ))
        )}
      </div>
    </div>
  );
}