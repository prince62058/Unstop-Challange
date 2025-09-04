import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type EmailWithResponses = {
  id: string;
  sender: string;
  subject: string;
  body: string;
  hasResponse?: boolean;
  responses?: Array<{
    id: string;
    generatedResponse: string;
    confidence: number;
    isEdited: boolean;
    finalResponse?: string;
    sentAt?: string;
  }>;
};

interface AIResponsePanelProps {
  selectedEmail?: {
    id: string;
    sender: string;
    subject: string;
    body: string;
    hasResponse?: boolean;
  } | null;
  onResponseSent: () => void;
}

export default function AIResponsePanel({ selectedEmail, onResponseSent }: AIResponsePanelProps) {
  const [editedResponse, setEditedResponse] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: emailDetails, 
    isLoading: emailLoading 
  } = useQuery({
    queryKey: [`/api/emails/${selectedEmail?.id}`],
    enabled: !!selectedEmail?.id,
  }) as { data: EmailWithResponses | undefined; isLoading: boolean };

  const generateResponseMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await apiRequest("POST", `/api/emails/${emailId}/generate-response`);
      return response.json();
    },
    onSuccess: (data) => {
      setEditedResponse(data.response);
      queryClient.invalidateQueries({ queryKey: [`/api/emails/${selectedEmail?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
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

  const sendResponseMutation = useMutation({
    mutationFn: async ({ emailId, response }: { emailId: string; response: string }) => {
      const res = await apiRequest("POST", `/api/emails/${emailId}/send-response`, { response });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      onResponseSent();
      toast({
        title: "Response Sent",
        description: "Your response has been sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const details = emailDetails as EmailWithResponses | undefined;
    if (details?.responses?.[0]?.generatedResponse) {
      setEditedResponse(details.responses[0].generatedResponse);
    } else {
      setEditedResponse("");
    }
    setIsEditing(false);
  }, [emailDetails]);

  const handleGenerateResponse = () => {
    if (selectedEmail) {
      generateResponseMutation.mutate(selectedEmail.id);
    }
  };

  const handleSendResponse = () => {
    if (selectedEmail && editedResponse.trim()) {
      sendResponseMutation.mutate({
        emailId: selectedEmail.id,
        response: editedResponse
      });
    }
  };

  if (!selectedEmail) {
    return (
      <Card data-testid="ai-response-panel">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-robot text-primary"></i>
            AI Response Generator
          </h3>
          <div className="text-center py-8">
            <i className="fas fa-mouse-pointer text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">Select an email to generate AI response</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const existingResponse = (emailDetails as EmailWithResponses | undefined)?.responses?.[0];
  const hasGeneratedResponse = !!existingResponse?.generatedResponse;

  return (
    <Card data-testid="ai-response-panel">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-robot text-primary"></i>
          AI Response Generator
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg" data-testid="selected-email-info">
            <p className="text-sm text-muted-foreground mb-2">Selected Email:</p>
            <p className="font-medium text-sm" data-testid="selected-email-subject">
              {selectedEmail.subject}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="selected-email-sender">
              {selectedEmail.sender}
            </p>
          </div>
          
          {emailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-16" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {hasGeneratedResponse ? "AI-Generated Response:" : "No response generated yet"}
                </label>
                {hasGeneratedResponse ? (
                  <Textarea
                    value={editedResponse}
                    onChange={(e) => {
                      setEditedResponse(e.target.value);
                      setIsEditing(true);
                    }}
                    className="min-h-[200px] resize-none"
                    placeholder="AI response will appear here..."
                    data-testid="textarea-ai-response"
                  />
                ) : (
                  <div className="min-h-[200px] border border-input rounded-md p-3 bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-robot text-2xl text-muted-foreground mb-2"></i>
                      <p className="text-sm text-muted-foreground">Click "Generate Response" to create AI response</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {hasGeneratedResponse ? (
                  <>
                    <Button 
                      onClick={handleSendResponse}
                      disabled={sendResponseMutation.isPending || !editedResponse.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 font-semibold shadow-lg border-0"
                      data-testid="button-send-response"
                    >
                      <i className={`fas ${sendResponseMutation.isPending ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`}></i>
                      {sendResponseMutation.isPending ? 'Sending...' : 'Send Response'}
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="icon"
                      data-testid="button-edit-response"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleGenerateResponse}
                    disabled={generateResponseMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 font-semibold shadow-lg border-0"
                    data-testid="button-generate-response"
                  >
                    <i className={`fas ${generateResponseMutation.isPending ? 'fa-spinner fa-spin' : 'fa-robot'} mr-2`}></i>
                    {generateResponseMutation.isPending ? 'Generating...' : 'Generate Response'}
                  </Button>
                )}
              </div>
              
              {hasGeneratedResponse && (
                <div className="text-xs text-muted-foreground space-y-1" data-testid="response-metadata">
                  <p><i className="fas fa-clock mr-1"></i>Response generated using GPT-5</p>
                  <p><i className="fas fa-brain mr-1"></i>Confidence: {existingResponse?.confidence || 85}% | Tone: Professional & Empathetic</p>
                  {isEditing && (
                    <p><i className="fas fa-edit mr-1"></i>Response has been edited</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
