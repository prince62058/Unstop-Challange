import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmailCard from "./email-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Email } from "@shared/schema";

interface EmailListProps {
  emails: any[];
  isLoading: boolean;
  onEmailSelect: (email: any) => void;
  selectedEmailId?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: "all" | "urgent" | "normal";
  onPriorityFilterChange: (priority: "all" | "urgent" | "normal") => void;
  sentimentFilter: "all" | "positive" | "negative" | "neutral";
  onSentimentFilterChange: (sentiment: "all" | "positive" | "negative" | "neutral") => void;
}

export default function EmailList({
  emails,
  isLoading,
  onEmailSelect,
  selectedEmailId,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  sentimentFilter,
  onSentimentFilterChange
}: EmailListProps) {
  return (
    <div className="space-y-6" data-testid="email-list">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" data-testid="email-list-title">Support Emails</h3>
            <div className="flex items-center gap-2">
              <Select 
                value={priorityFilter} 
                onValueChange={(value: "all" | "urgent" | "normal") => onPriorityFilterChange(value)}
              >
                <SelectTrigger className="w-40" data-testid="select-priority-filter">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={sentimentFilter} 
                onValueChange={(value: "all" | "positive" | "negative" | "neutral") => onSentimentFilterChange(value)}
              >
                <SelectTrigger className="w-40" data-testid="select-sentiment-filter">
                  <SelectValue placeholder="All Sentiments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              data-testid="input-search-emails"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4" data-testid="email-cards-container">
        {isLoading ? (
          [...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : emails.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-inbox text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No emails found</h3>
              <p className="text-muted-foreground">
                {searchQuery || priorityFilter !== "all" || sentimentFilter !== "all" 
                  ? "Try adjusting your search filters" 
                  : "No support emails have been processed yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              isSelected={selectedEmailId === email.id}
              onClick={() => onEmailSelect(email)}
            />
          ))
        )}
      </div>
    </div>
  );
}
