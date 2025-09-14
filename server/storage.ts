import { type User, type InsertUser, type Email, type InsertEmail, type EmailResponse, type InsertEmailResponse } from "@shared/schema";
import bcrypt from "bcrypt";

/**
 * @typedef {Object} EmailStats
 * @property {number} totalEmails
 * @property {number} urgentEmails  
 * @property {number} resolvedEmails
 * @property {number} pendingEmails
 */

/**
 * @typedef {Object} SentimentDistribution
 * @property {number} positive
 * @property {number} negative
 * @property {number} neutral
 */

/**
 * @typedef {Object} CategoryBreakdown
 * @property {string|null} category
 * @property {number} count
 */

export class DatabaseStorage {
  private users: Map<number, User> = new Map();
  private emails: Map<number, Email> = new Map();
  private responses: Map<number, EmailResponse> = new Map();
  private nextUserId: number = 1;
  private nextEmailId: number = 1;
  private nextResponseId: number = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  /**
   * Initialize sample data for development
   */
  private initializeSampleData(): void {
    const sampleEmails = this.getSampleEmails();
    sampleEmails.forEach((email, index) => {
      const emailId = index + 1;
      this.emails.set(emailId, { ...email, id: emailId });
      this.nextEmailId = Math.max(this.nextEmailId, emailId + 1);
    });
  }

  /**
   * Get user by ID
   * @param {number} id 
   * @returns {Promise<User|undefined>}
   */
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  /**
   * Get user by username
   * @param {string} username 
   * @returns {Promise<User|undefined>}
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * Create a new user
   * @param {InsertUser} insertUser 
   * @returns {Promise<User>}
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before saving
    if (insertUser.password) {
      insertUser.password = await bcrypt.hash(insertUser.password, 10);
    }
    const user: User = {
      id: this.nextUserId++,
      username: insertUser.username,
      password: insertUser.password,
      emailAddress: insertUser.emailAddress || null,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  /**
   * Get emails with pagination
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise<Email[]>}
   */
  async getEmails(limit = 50, offset = 0): Promise<Email[]> {
    const allEmails = Array.from(this.emails.values())
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
    return allEmails.slice(offset, offset + limit);
  }

  /**
   * Get email by ID
   * @param {string} id 
   * @returns {Promise<Email|undefined>}
   */
  async getEmailById(id: string): Promise<Email | undefined> {
    return this.emails.get(parseInt(id));
  }

  /**
   * Create a new email
   * @param {InsertEmail} emailData 
   * @returns {Promise<Email>}
   */
  async createEmail(emailData: InsertEmail): Promise<Email> {
    const email: Email = {
      id: this.nextEmailId++,
      sender: emailData.sender,
      subject: emailData.subject,
      body: emailData.body,
      receivedAt: emailData.receivedAt,
      priority: emailData.priority,
      sentiment: emailData.sentiment,
      category: emailData.category || null,
      extractedInfo: emailData.extractedInfo || null,
      isProcessed: emailData.isProcessed || false,
      createdAt: new Date()
    };
    this.emails.set(email.id, email);
    return email;
  }

  /**
   * Update email
   * @param {string} id 
   * @param {Partial<Email>} updates 
   * @returns {Promise<Email>}
   */
  async updateEmail(id: string, updates: Partial<Email>): Promise<Email> {
    const emailId = parseInt(id);
    const existingEmail = this.emails.get(emailId);
    
    if (!existingEmail) {
      throw new Error(`Email with id ${id} not found`);
    }
    
    const updatedEmail = { ...existingEmail, ...updates };
    this.emails.set(emailId, updatedEmail);
    return updatedEmail;
  }

  /**
   * Get emails by priority
   * @param {"urgent"|"normal"} priority 
   * @returns {Promise<Email[]>}
   */
  async getEmailsByPriority(priority: "urgent" | "normal"): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.priority === priority)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  /**
   * Get emails by sentiment
   * @param {"positive"|"negative"|"neutral"} sentiment 
   * @returns {Promise<Email[]>}
   */
  async getEmailsBySentiment(sentiment: "positive" | "negative" | "neutral"): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.sentiment === sentiment)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  /**
   * Search emails by query
   * @param {string} query 
   * @returns {Promise<Email[]>}
   */
  async searchEmails(query: string): Promise<Email[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.emails.values())
      .filter(email => 
        email.subject.toLowerCase().includes(lowerQuery) ||
        email.body.toLowerCase().includes(lowerQuery) ||
        email.sender.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  /**
   * Get responses by email ID
   * @param {string} emailId 
   * @returns {Promise<EmailResponse[]>}
   */
  async getResponsesByEmailId(emailId: string): Promise<EmailResponse[]> {
    return Array.from(this.responses.values())
      .filter(response => response.emailId === parseInt(emailId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Create email response
   * @param {InsertEmailResponse} responseData 
   * @returns {Promise<EmailResponse>}
   */
  async createEmailResponse(responseData: InsertEmailResponse): Promise<EmailResponse> {
    const response: EmailResponse = {
      id: this.nextResponseId++,
      emailId: responseData.emailId,
      generatedResponse: responseData.generatedResponse,
      isEdited: responseData.isEdited || false,
      finalResponse: responseData.finalResponse || null,
      sentAt: responseData.sentAt || null,
      confidence: responseData.confidence || null,
      createdAt: new Date()
    };
    this.responses.set(response.id, response);
    console.log(`Email response saved to memory storage: ${responseData.emailId}`);
    return response;
  }

  /**
   * Update email response
   * @param {string} id 
   * @param {Partial<EmailResponse>} updates 
   * @returns {Promise<EmailResponse>}
   */
  async updateEmailResponse(id: string, updates: Partial<EmailResponse>): Promise<EmailResponse> {
    const responseId = parseInt(id);
    const existingResponse = this.responses.get(responseId);
    
    if (!existingResponse) {
      throw new Error(`EmailResponse with id ${id} not found`);
    }
    
    const updatedResponse = { ...existingResponse, ...updates };
    this.responses.set(responseId, updatedResponse);
    return updatedResponse;
  }

  /**
   * Get email statistics
   * @returns {Promise<{totalEmails: number, urgentEmails: number, resolvedEmails: number, pendingEmails: number}>}
   */
  async getEmailStats() {
    const allEmails = Array.from(this.emails.values());
    const urgentEmails = allEmails.filter(e => e.priority === 'urgent').length;
    
    // Count resolved emails (those with sent responses)
    const resolvedEmails = Array.from(this.responses.values())
      .filter(response => response.sentAt !== null && response.sentAt !== undefined).length;
    
    const totalEmails = allEmails.length;
    const pendingEmails = totalEmails - resolvedEmails;

    return {
      totalEmails,
      urgentEmails,
      resolvedEmails,
      pendingEmails
    };
  }

  /**
   * Get sentiment distribution
   * @returns {Promise<{positive: number, negative: number, neutral: number}>}
   */
  async getSentimentDistribution() {
    const allEmails = Array.from(this.emails.values());
    const total = allEmails.length;
    
    if (total === 0) {
      return { positive: 0, negative: 0, neutral: 0 };
    }

    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    
    allEmails.forEach(email => {
      if (email.sentiment in sentimentCounts) {
        sentimentCounts[email.sentiment]++;
      }
    });

    return {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100)
    };
  }

  /**
   * Get category breakdown
   * @returns {Promise<{category: string|null, count: number}[]>}
   */
  async getCategoryBreakdown() {
    const allEmails = Array.from(this.emails.values());
    const categoryMap = new Map<string, number>();
    
    allEmails.forEach(email => {
      if (email.category && email.category !== null) {
        const count = categoryMap.get(email.category) || 0;
        categoryMap.set(email.category, count + 1);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Sample data for demo purposes
  getSampleEmails(): any[] {
    return [
      {
        id: 1,
        sender: "john.doe@techcorp.com",
        subject: "🚨 Urgent: Server downtime issue",
        body: "Hi team, we're experiencing server downtime on production. This is affecting all our customers. Please prioritize this issue immediately. The error logs show database connection failures.",
        priority: "urgent",
        sentiment: "negative",
        category: "Technical Issue",
        receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        extractedInfo: null,
        isProcessed: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        sender: "sarah.johnson@clientcompany.com",
        subject: "✨ Thank you for the excellent service!",
        body: "I wanted to reach out and express my gratitude for the outstanding support your team provided during our recent project. Everything went smoothly and exceeded our expectations.",
        priority: "normal",
        sentiment: "positive",
        category: "Customer Feedback",
        receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        extractedInfo: null,
        isProcessed: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 3,
        sender: "marketing@partner.com",
        subject: "🤝 Partnership opportunity discussion",
        body: "Hello, we've been following your company's growth and would like to discuss potential partnership opportunities. We believe there's great synergy between our organizations.",
        priority: "normal",
        sentiment: "neutral",
        category: "Business Development",
        receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        extractedInfo: null,
        isProcessed: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: 4,
        sender: "billing@vendor.com",
        subject: "💸 Invoice #INV-2024-001 is overdue",
        body: "This is a reminder that invoice #INV-2024-001 for $2,500 is now 30 days overdue. Please arrange payment at your earliest convenience to avoid service disruption.",
        priority: "urgent",
        sentiment: "negative",
        category: "Financial",
        receivedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        extractedInfo: null,
        isProcessed: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      },
      {
        id: 5,
        sender: "hr@company.com",
        subject: "🎉 Team building event next Friday",
        body: "Reminder: Our monthly team building event is scheduled for next Friday at 3 PM in the main conference room. Pizza will be provided! Please confirm your attendance.",
        priority: "normal",
        sentiment: "positive",
        category: "HR/Internal",
        receivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        extractedInfo: null,
        isProcessed: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];
  }
}

export const storage = new DatabaseStorage();