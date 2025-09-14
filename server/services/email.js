import { storage } from "../storage.js";
import { analyzeSentiment, analyzePriority, extractInformation, generateResponse } from "./openai.js";

/**
 * @typedef {Object} ProcessedEmail
 * @property {string} id
 * @property {string} sender
 * @property {string} subject
 * @property {string} body
 * @property {Date} receivedAt
 * @property {"urgent"|"normal"} priority
 * @property {"positive"|"negative"|"neutral"} sentiment
 * @property {string} category
 * @property {Object} extractedInfo
 * @property {boolean} hasResponse
 * @property {string} [generatedResponse]
 */

export class EmailService {
  /**
   * Process an incoming email with AI analysis
   * @param {string} sender 
   * @param {string} subject 
   * @param {string} body 
   * @param {Date} receivedAt 
   * @returns {Promise<ProcessedEmail>}
   */
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

        const response = await storage.createEmailResponse(emailResponseData);
        generatedResponse = response.generatedResponse;
      }

      return {
        id: email.id,
        sender: email.sender,
        subject: email.subject,
        body: email.body,
        receivedAt: email.receivedAt,
        priority: email.priority,
        sentiment: email.sentiment,
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

  /**
   * Generate response for existing email
   * @param {string} emailId 
   * @returns {Promise<string>}
   */
  async generateResponseForEmail(emailId) {
    try {
      const email = await storage.getEmailById(emailId);
      if (!email) {
        throw new Error("Email not found");
      }

      // Check if response already exists
      const existingResponses = await storage.getResponsesByEmailId(emailId);
      if (existingResponses.length > 0) {
        console.log(`Response already exists for email ${emailId}`);
        return existingResponses[0].generatedResponse;
      }

      console.log(`Generating new response for email ${emailId}: ${email.subject}`);
      
      const responseData = await generateResponse(
        email.body,
        email.subject,
        email.sender,
        email.sentiment || 'neutral',
        email.priority || 'normal',
        email.extractedInfo
      );

      const emailResponseData = {
        emailId: email.id || parseInt(emailId),
        generatedResponse: responseData.response,
        confidence: Math.round(responseData.confidence * 100),
        isEdited: false,
        finalResponse: undefined,
        sentAt: undefined
      };

      console.log(`Creating email response in storage for ${emailId}`);
      const response = await storage.createEmailResponse(emailResponseData);
      console.log(`Response created successfully: ${response.generatedResponse.substring(0, 50)}...`);
      return response.generatedResponse;
    } catch (error) {
      console.error(`Error in generateResponseForEmail for ${emailId}:`, error);
      // Return a fallback response to ensure the function doesn't fail
      const fallbackResponse = `Dear Customer,

Thank you for reaching out to us. We have received your message and our team will review it carefully.

We will get back to you within 24 hours with a detailed response to address your inquiry.

Best regards,
Support Team`;
      
      console.log(`Using fallback response for email ${emailId}`);
      return fallbackResponse;
    }
  }

  /**
   * Send response for an email
   * @param {string} emailId 
   * @param {string} finalResponse 
   * @returns {Promise<void>}
   */
  async sendResponse(emailId, finalResponse) {
    const responses = await storage.getResponsesByEmailId(emailId);
    if (responses.length === 0) {
      throw new Error("No response found for this email");
    }

    const response = responses[0];
    await storage.updateEmailResponse(response.id.toString(), {
      finalResponse,
      sentAt: new Date(),
      isEdited: finalResponse !== response.generatedResponse
    });

    // In a real implementation, this would send the actual email
    // For now, we just mark it as sent
    console.log(`Response sent for email ${emailId}: ${finalResponse}`);
  }

  /**
   * Filter emails for support-related content
   * @param {Array} emails 
   * @returns {Promise<Array>}
   */
  async filterSupportEmails(emails) {
    const supportKeywords = ["support", "query", "request", "help"];
    
    return emails.filter(email => {
      const subject = email.subject?.toLowerCase() || "";
      return supportKeywords.some(keyword => subject.includes(keyword));
    });
  }

  /**
   * Get emails with their responses
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise<Array<ProcessedEmail>>}
   */
  async getEmailsWithResponses(limit = 50, offset = 0) {
    try {
      const emails = await storage.getEmails(limit, offset);
      
      const emailsWithResponses = await Promise.all(
        emails.map(async (email) => {
          const responses = await storage.getResponsesByEmailId(email.id?.toString() || '');
          return {
            id: email.id?.toString() || Date.now().toString(),
            sender: email.sender,
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            priority: email.priority,
            sentiment: email.sentiment,
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