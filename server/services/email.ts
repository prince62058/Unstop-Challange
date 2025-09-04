import { storage } from "../storage";
import { analyzeSentiment, analyzePriority, extractInformation, generateResponse } from "./openai";
import type { InsertEmail, InsertEmailResponse } from "@shared/schema";

export interface ProcessedEmail {
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

export class EmailService {
  async processEmail(
    sender: string,
    subject: string,
    body: string,
    receivedAt: Date = new Date()
  ): Promise<ProcessedEmail> {
    try {
      // Analyze sentiment and priority
      const [sentimentAnalysis, priorityAnalysis, extractedInfo] = await Promise.all([
        analyzeSentiment(body, subject),
        analyzePriority(body, subject),
        extractInformation(body, subject, sender)
      ]);

      // Create email record
      const emailData: InsertEmail = {
        sender,
        subject,
        body,
        receivedAt,
        priority: priorityAnalysis.priority,
        sentiment: sentimentAnalysis.sentiment,
        category: extractedInfo.category,
        extractedInfo: {
          phoneNumbers: extractedInfo.phoneNumbers,
          alternateEmails: extractedInfo.alternateEmails,
          customerRequirements: extractedInfo.customerRequirements,
          sentimentIndicators: extractedInfo.sentimentIndicators,
          sentimentReasoning: sentimentAnalysis.reasoning,
          priorityKeywords: priorityAnalysis.keywords,
          sentimentConfidence: sentimentAnalysis.confidence,
          priorityConfidence: priorityAnalysis.confidence
        },
        isProcessed: true
      };

      const email = await storage.createEmail(emailData);

      // Generate AI response for urgent emails automatically
      let generatedResponse;
      if (priorityAnalysis.priority === "urgent") {
        const responseData = await generateResponse(
          body,
          subject,
          sender,
          sentimentAnalysis.sentiment,
          priorityAnalysis.priority,
          extractedInfo
        );

        const emailResponseData: InsertEmailResponse = {
          emailId: email.id,
          generatedResponse: responseData.response,
          confidence: Math.round(responseData.confidence * 100),
          isEdited: false,
          finalResponse: null,
          sentAt: null
        };

        const response = await storage.createEmailResponse(emailResponseData);
        generatedResponse = response.generatedResponse;
      }

      return {
        id: email.id,
        sender: email.sender,
        subject: email.subject,
        body: email.body,
        receivedAt: email.receivedAt,
        priority: email.priority as "urgent" | "normal",
        sentiment: email.sentiment as "positive" | "negative" | "neutral",
        category: email.category || "General Inquiry",
        extractedInfo: email.extractedInfo,
        hasResponse: !!generatedResponse,
        generatedResponse
      };
    } catch (error) {
      console.error("Email processing failed:", error);
      throw new Error(`Failed to process email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateResponseForEmail(emailId: string): Promise<string> {
    const email = await storage.getEmailById(emailId);
    if (!email) {
      throw new Error("Email not found");
    }

    // Check if response already exists
    const existingResponses = await storage.getResponsesByEmailId(emailId);
    if (existingResponses.length > 0) {
      return existingResponses[0].generatedResponse;
    }

    const responseData = await generateResponse(
      email.body,
      email.subject,
      email.sender,
      email.sentiment,
      email.priority,
      email.extractedInfo
    );

    const emailResponseData: InsertEmailResponse = {
      emailId: email.id,
      generatedResponse: responseData.response,
      confidence: Math.round(responseData.confidence * 100),
      isEdited: false,
      finalResponse: null,
      sentAt: null
    };

    const response = await storage.createEmailResponse(emailResponseData);
    return response.generatedResponse;
  }

  async sendResponse(emailId: string, finalResponse: string): Promise<void> {
    const responses = await storage.getResponsesByEmailId(emailId);
    if (responses.length === 0) {
      throw new Error("No response found for this email");
    }

    const response = responses[0];
    await storage.updateEmailResponse(response.id, {
      finalResponse,
      sentAt: new Date(),
      isEdited: finalResponse !== response.generatedResponse
    });

    // In a real implementation, this would send the actual email
    // For now, we just mark it as sent
    console.log(`Response sent for email ${emailId}: ${finalResponse}`);
  }

  async filterSupportEmails(emails: any[]): Promise<any[]> {
    const supportKeywords = ["support", "query", "request", "help"];
    
    return emails.filter(email => {
      const subject = email.subject?.toLowerCase() || "";
      return supportKeywords.some(keyword => subject.includes(keyword));
    });
  }

  async getEmailsWithResponses(limit = 50, offset = 0): Promise<ProcessedEmail[]> {
    try {
      const emails = await storage.getEmails(limit, offset);
      
      const emailsWithResponses = await Promise.all(
        emails.map(async (email) => {
          const responses = await storage.getResponsesByEmailId(email._id?.toString() || '');
          return {
            id: email._id?.toString() || Date.now().toString(),
            sender: email.sender,
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            priority: email.priority as "urgent" | "normal",
            sentiment: email.sentiment as "positive" | "negative" | "neutral",
            category: email.category || "General Inquiry",
            extractedInfo: email.extractedInfo,
            hasResponse: responses.length > 0,
            generatedResponse: responses[0]?.generatedResponse
          };
        })
      );

      // Sort by priority (urgent first) then by received date
      return emailsWithResponses.sort((a, b) => {
        if (a.priority === "urgent" && b.priority !== "urgent") return -1;
        if (b.priority === "urgent" && a.priority !== "urgent") return 1;
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      });
    } catch (error) {
      console.error('Error in getEmailsWithResponses:', error);
      // Return empty array to prevent crashes
      return [];
    }
  }
}

export const emailService = new EmailService();
