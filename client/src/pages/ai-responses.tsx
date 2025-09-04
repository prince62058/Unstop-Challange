import { useState } from "react";
import { useEmails } from "@/hooks/use-emails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AIResponses() {
  const { 
    data: emails = [], 
    isLoading: emailsLoading 
  } = useEmails() as { data: ProcessedEmail[]; isLoading: boolean };

  // Filter emails that have AI responses
  const emailsWithResponses = emails.filter(email => email.hasResponse && email.generatedResponse);

  const handleSendResponse = async (emailId: string, response: string) => {
    try {
      const result = await fetch(`/api/emails/${emailId}/send-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response })
      });
      
      if (result.ok) {
        console.log('Response sent successfully');
      }
    } catch (error) {
      console.error('Failed to send response:', error);
    }
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
            AI Responses
          </h1>
          <p className="text-muted-foreground">
            Review and manage AI-generated email responses
          </p>
        </div>
      </div>

      {emailsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : emailsWithResponses.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <i className="fas fa-robot text-4xl text-muted-foreground mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">No AI responses yet</h3>
          <p className="text-muted-foreground">AI responses will appear here as emails are processed</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {emailsWithResponses.map((email) => (
            <Card key={email.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <i className={`fas fa-circle text-xs ${
                        email.priority === 'urgent' ? 'text-red-500' : 'text-blue-500'
                      }`}></i>
                      {email.subject}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-2">
                      From: {email.sender}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        email.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        email.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {email.sentiment}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(email.receivedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <i className="fas fa-envelope text-blue-500"></i>
                    Original Email
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {email.body.length > 200 ? `${email.body.substring(0, 200)}...` : email.body}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <i className="fas fa-robot text-green-500"></i>
                    AI Generated Response
                  </h4>
                  <div className="bg-green-50 p-3 rounded-lg text-sm border border-green-200">
                    {email.generatedResponse}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleSendResponse(email.id, email.generatedResponse!)}
                    className="btn-gradient"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send Response
                  </Button>
                  <Button variant="outline">
                    <i className="fas fa-edit mr-2"></i>
                    Edit Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}