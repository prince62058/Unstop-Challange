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
      return "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300";
    }
    return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-300";
  };

  const getSentimentBadgeClass = (sentiment: string) => {
    if (sentiment === "positive") {
      return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-300";
    }
    if (sentiment === "negative") {
      return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300";
    }
    return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300";
  };

  const extractPhoneNumbers = (extractedInfo: any) => {
    return extractedInfo?.phoneNumbers?.[0] || "";
  };

  return (
    <div 
      className={`email-card glass-card p-6 cursor-pointer group transition-all duration-300 ${
        isSelected ? "ring-2 ring-primary shadow-xl scale-[1.02]" : ""
      }`}
      onClick={onClick}
      data-testid={`email-card-${email.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg" data-testid={`sender-initials-${email.id}`}>
                {getSenderInitials(email.sender)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <i className="fas fa-envelope text-white text-xs"></i>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors" data-testid={`sender-${email.id}`}>
              {email.sender.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <p className="text-sm text-muted-foreground font-medium" data-testid={`sender-email-${email.id}`}>
              {email.sender}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1" data-testid={`timestamp-${email.id}`}>
              <i className="fas fa-clock"></i>
              {format(new Date(email.receivedAt), "MMM d, h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Badge 
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${getPriorityBadgeClass(email.priority)} shadow-md`}
            data-testid={`priority-badge-${email.id}`}
          >
            <i className={`fas ${
              email.priority === 'urgent' ? 'fa-exclamation-triangle' : 'fa-info-circle'
            } mr-1`}></i>
            {email.priority.toUpperCase()}
          </Badge>
          <Badge 
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${getSentimentBadgeClass(email.sentiment)} shadow-md`}
            data-testid={`sentiment-badge-${email.id}`}
          >
            <i className={`fas ${
              email.sentiment === 'positive' ? 'fa-smile' : 
              email.sentiment === 'negative' ? 'fa-frown' : 'fa-meh'
            } mr-1`}></i>
            {email.sentiment}
          </Badge>
        </div>
      </div>
        
        <div className="mb-4">
          <h4 className="font-bold text-xl mb-3 group-hover:gradient-text-static transition-all duration-300" data-testid={`subject-${email.id}`}>
            {email.subject}
          </h4>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-primary">
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3" data-testid={`preview-${email.id}`}>
              {email.body.slice(0, 200)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            {extractPhoneNumbers(email.extractedInfo) && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full" data-testid={`phone-${email.id}`}>
                <i className="fas fa-phone text-blue-500"></i>
                <span className="font-medium text-blue-700">{extractPhoneNumbers(email.extractedInfo)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full" data-testid={`category-${email.id}`}>
              <i className="fas fa-tag text-purple-500"></i>
              <span className="font-medium text-purple-700">{email.category || "General Inquiry"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {email.hasResponse ? (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full" data-testid={`response-status-${email.id}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">Response Ready</span>
                <i className="fas fa-check-circle text-green-500"></i>
              </div>
            ) : (
              <button 
                onClick={handleGenerateResponse}
                disabled={generateResponseMutation.isPending}
                className="btn-gradient px-6 py-3 rounded-full text-sm font-bold shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-70"
                data-testid={`button-generate-response-${email.id}`}
              >
                <i className={`fas ${generateResponseMutation.isPending ? 'fa-spinner fa-spin' : 'fa-magic'} mr-2`}></i>
                {generateResponseMutation.isPending ? 'Generating...' : 'Generate AI Response'}
              </button>
            )}
          </div>
        </div>
    </div>
  );
}
