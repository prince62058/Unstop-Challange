import { storage } from "../storage.js";
import { analyzeSentiment, analyzePriority, extractInformation, generateResponse } from "./openai.js";

export class EmailService {
  async processEmail(
    sender,
    subject,
    body,
    receivedAt = new Date()
  ) {
    try {
      // Analyze sentiment and priority
      const [sentimentAnalysis, priorityAnalysis, extractedInfo] = await Promise.all([
        analyzeSentiment(body, subject),
        analyzePriority(body, subject),
        extractInformation(body, subject, sender)
      ]);

      // Create email record
      const emailData = {
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

        const emailResponseData = {
          emailId: email.id,
          generatedResponse: responseData.response,
          confidence: Math.round(responseData.confidence * 100),
          isEdited: false,
          finalResponse: undefined,
          sentAt: undefined
        };

        await storage.createEmailResponse(emailResponseData);
        generatedResponse = responseData.response;
      }

      return {
        id: email.id.toString(),
        sender: email.sender,
        subject: email.subject,
        body: email.body,
        receivedAt: email.receivedAt,
        priority: email.priority,
        sentiment: email.sentiment,
        category: email.category,
        extractedInfo: email.extractedInfo,
        hasResponse: !!generatedResponse,
        generatedResponse
      };

    } catch (error) {
      console.error("Email processing failed:", error);
      
      // Fallback: create basic email record
      const basicEmailData = {
        sender,
        subject,
        body,
        receivedAt,
        priority: "normal",
        sentiment: "neutral",
        category: "General",
        extractedInfo: null,
        isProcessed: false
      };

      const email = await storage.createEmail(basicEmailData);
      
      return {
        id: email.id.toString(),
        sender: email.sender,
        subject: email.subject,
        body: email.body,
        receivedAt: email.receivedAt,
        priority: email.priority,
        sentiment: email.sentiment,
        category: email.category,
        extractedInfo: email.extractedInfo,
        hasResponse: false
      };
    }
  }

  async processIncomingEmail(emailData) {
    return this.processEmail(
      emailData.sender,
      emailData.subject,
      emailData.body,
      emailData.receivedAt
    );
  }

  async generateResponse(emailId) {
    try {
      const email = await storage.getEmailById(emailId);
      if (!email) {
        console.error(`Email with id ${emailId} not found`);
        return null;
      }

      // Check if response already exists
      const existingResponses = await storage.getResponsesByEmailId(emailId);
      if (existingResponses.length > 0) {
        console.log(`Response already exists for email ${emailId}`);
        return existingResponses[0];
      }

      const responseData = await generateResponse(
        email.body,
        email.subject,
        email.sender,
        email.sentiment,
        email.priority,
        email.extractedInfo
      );

      const emailResponseData = {
        emailId: emailId,
        generatedResponse: responseData.response,
        confidence: Math.round(responseData.confidence * 100),
        isEdited: false,
        finalResponse: undefined,
        sentAt: undefined
      };

      const savedResponse = await storage.createEmailResponse(emailResponseData);
      return savedResponse;

    } catch (error) {
      console.error("Response generation failed:", error);
      return null;
    }
  }

  async sendResponse(emailId, responseText) {
    try {
      const email = await storage.getEmailById(emailId);
      if (!email) {
        console.error(`Email with id ${emailId} not found`);
        return null;
      }

      // Get existing response or create new one
      const existingResponses = await storage.getResponsesByEmailId(emailId);
      let response;

      if (existingResponses.length > 0) {
        // Update existing response
        response = await storage.updateEmailResponse(existingResponses[0].id, {
          finalResponse: responseText,
          sentAt: new Date(),
          isEdited: true
        });
      } else {
        // Create new response
        const emailResponseData = {
          emailId: emailId,
          generatedResponse: responseText,
          finalResponse: responseText,
          confidence: 95,
          isEdited: false,
          sentAt: new Date()
        };
        response = await storage.createEmailResponse(emailResponseData);
      }

      // Mark email as processed
      await storage.updateEmail(emailId, { isProcessed: true });

      console.log(`Response sent for email ${emailId}`);
      return response;

    } catch (error) {
      console.error("Failed to send response:", error);
      return null;
    }
  }

  async getEmailsWithResponses(limit = 50, offset = 0) {
    try {
      const emails = await storage.getEmails(limit, offset);
      
      // Get responses for each email
      const emailsWithResponses = await Promise.all(
        emails.map(async (email) => {
          try {
            const responses = await storage.getResponsesByEmailId(email.id.toString());
            return {
              ...email,
              responses: responses || [],
              hasResponse: responses && responses.length > 0
            };
          } catch (error) {
            console.error(`Failed to get responses for email ${email.id}:`, error);
            return {
              ...email,
              responses: [],
              hasResponse: false
            };
          }
        })
      );

      return emailsWithResponses;
    } catch (error) {
      console.error("Failed to get emails with responses:", error);
      return [];
    }
  }
}

export const emailService = new EmailService();