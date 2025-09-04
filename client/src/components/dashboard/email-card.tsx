import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailCardProps {
  email: {
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
  isSelected: boolean;
  onClick: () => void;
}

export default function EmailCard({ email, isSelected, onClick }: EmailCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateResponseMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await apiRequest("POST", `/api/emails/${emailId}/generate-response`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Response Generated",
        description: "AI response has been generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate response",
        variant: "destructive",
      });
    },
  });

  const handleGenerateResponse = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateResponseMutation.mutate(email.id);
  };

  const getSenderInitials = (sender: string) => {
    const name = sender.split("@")[0];
    return name
      .split(".")
      .map(part => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getPriorityBadgeClass = (priority: string) => {
    if (priority === "urgent") {
      return "bg-destructive text-destructive-foreground";
    }
    return "bg-yellow-500 text-white";
  };

  const getSentimentBadgeClass = (sentiment: string) => {
    if (sentiment === "positive") {
      return "bg-green-500 text-white";
    }
    if (sentiment === "negative") {
      return "bg-destructive text-destructive-foreground";
    }
    return "bg-muted text-muted-foreground";
  };

  const extractPhoneNumbers = (extractedInfo: any) => {
    return extractedInfo?.phoneNumbers?.[0] || "";
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
      data-testid={`email-card-${email.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium" data-testid={`sender-initials-${email.id}`}>
                {getSenderInitials(email.sender)}
              </span>
            </div>
            <div>
              <p className="font-medium" data-testid={`sender-${email.id}`}>
                {email.sender}
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`timestamp-${email.id}`}>
                {format(new Date(email.receivedAt), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              className={`text-xs font-medium ${getPriorityBadgeClass(email.priority)}`}
              data-testid={`priority-badge-${email.id}`}
            >
              {email.priority.toUpperCase()}
            </Badge>
            <Badge 
              className={`text-xs font-medium ${getSentimentBadgeClass(email.sentiment)}`}
              data-testid={`sentiment-badge-${email.id}`}
            >
              {email.sentiment}
            </Badge>
          </div>
        </div>
        
        <h4 className="font-semibold mb-2" data-testid={`subject-${email.id}`}>
          {email.subject}
        </h4>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`preview-${email.id}`}>
          {email.body.slice(0, 150)}...
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            {extractPhoneNumbers(email.extractedInfo) && (
              <span data-testid={`phone-${email.id}`}>
                <i className="fas fa-phone mr-1"></i>
                {extractPhoneNumbers(email.extractedInfo)}
              </span>
            )}
            <span data-testid={`category-${email.id}`}>
              <i className="fas fa-tag mr-1"></i>
              {email.category || "General Inquiry"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {email.hasResponse ? (
              <span className="text-xs text-green-500" data-testid={`response-status-${email.id}`}>
                <i className="fas fa-check mr-1"></i>Response Generated
              </span>
            ) : (
              <Button 
                size="sm" 
                onClick={handleGenerateResponse}
                disabled={generateResponseMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 text-xs font-semibold shadow-md border-0"
                data-testid={`button-generate-response-${email.id}`}
              >
                <i className={`fas ${generateResponseMutation.isPending ? 'fa-spinner fa-spin' : 'fa-robot'} mr-1`}></i>
                {generateResponseMutation.isPending ? 'Generating...' : 'Generate Response'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
