import { db } from "./db.js";
import { users, emails, emailResponses, type User, type InsertUser, type Email, type InsertEmail, type EmailResponse, type InsertEmailResponse } from "@shared/schema";
import { eq, desc, ilike, or, count, sql } from "drizzle-orm";
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
  constructor() {
    this.mockResponses = new Map();
  }

  /**
   * Get user by ID
   * @param {number} id 
   * @returns {Promise<User|undefined>}
   */
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  /**
   * Get user by username
   * @param {string} username 
   * @returns {Promise<User|undefined>}
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
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
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  /**
   * Get emails with pagination
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise<Email[]>}
   */
  async getEmails(limit = 50, offset = 0): Promise<Email[]> {
    try {
      const emailList = await db.select()
        .from(emails)
        .orderBy(desc(emails.receivedAt))
        .limit(limit)
        .offset(offset);
      return emailList;
    } catch (error) {
      console.log('Database unavailable, returning sample data');
      return this.getSampleEmails().slice(offset, offset + limit);
    }
  }

  /**
   * Get email by ID
   * @param {string} id 
   * @returns {Promise<Email|undefined>}
   */
  async getEmailById(id: string): Promise<Email | undefined> {
    try {
      const [email] = await db.select().from(emails).where(eq(emails.id, parseInt(id)));
      return email || undefined;
    } catch (error) {
      console.log('Database unavailable, searching sample data');
      return this.getSampleEmails().find(email => email.id?.toString() === id);
    }
  }

  /**
   * Create a new email
   * @param {InsertEmail} emailData 
   * @returns {Promise<Email>}
   */
  async createEmail(emailData: InsertEmail): Promise<Email> {
    try {
      const [email] = await db.insert(emails).values(emailData).returning();
      return email;
    } catch (error) {
      console.log('Database unavailable, creating mock email');
      return {
        id: Date.now(),
        ...emailData,
        createdAt: new Date()
      } as Email;
    }
  }

  /**
   * Update email
   * @param {string} id 
   * @param {Partial<Email>} updates 
   * @returns {Promise<Email>}
   */
  async updateEmail(id: string, updates: Partial<Email>): Promise<Email> {
    try {
      const [updatedEmail] = await db.update(emails)
        .set(updates)
        .where(eq(emails.id, parseInt(id)))
        .returning();
      
      if (!updatedEmail) {
        throw new Error(`Email with id ${id} not found`);
      }
      
      return updatedEmail;
    } catch (error) {
      console.log('Database unavailable, returning mock updated email');
      const existingEmail = this.getSampleEmails().find(e => e.id?.toString() === id);
      if (!existingEmail) {
        throw new Error(`Email with id ${id} not found`);
      }
      return { ...existingEmail, ...updates } as Email;
    }
  }

  /**
   * Get emails by priority
   * @param {"urgent"|"normal"} priority 
   * @returns {Promise<Email[]>}
   */
  async getEmailsByPriority(priority: "urgent" | "normal"): Promise<Email[]> {
    try {
      return await db.select()
        .from(emails)
        .where(eq(emails.priority, priority))
        .orderBy(desc(emails.receivedAt));
    } catch (error) {
      console.log('Database unavailable, filtering sample data');
      return this.getSampleEmails().filter(email => email.priority === priority);
    }
  }

  /**
   * Get emails by sentiment
   * @param {"positive"|"negative"|"neutral"} sentiment 
   * @returns {Promise<Email[]>}
   */
  async getEmailsBySentiment(sentiment: "positive" | "negative" | "neutral"): Promise<Email[]> {
    try {
      return await db.select()
        .from(emails)
        .where(eq(emails.sentiment, sentiment))
        .orderBy(desc(emails.receivedAt));
    } catch (error) {
      console.log('Database unavailable, filtering sample data');
      return this.getSampleEmails().filter(email => email.sentiment === sentiment);
    }
  }

  /**
   * Search emails by query
   * @param {string} query 
   * @returns {Promise<Email[]>}
   */
  async searchEmails(query: string): Promise<Email[]> {
    try {
      return await db.select()
        .from(emails)
        .where(or(
          ilike(emails.subject, `%${query}%`),
          ilike(emails.body, `%${query}%`),
          ilike(emails.sender, `%${query}%`)
        ))
        .orderBy(desc(emails.receivedAt));
    } catch (error) {
      console.log('Database unavailable, searching sample data');
      const lowerQuery = query.toLowerCase();
      return this.getSampleEmails().filter(email => 
        email.subject.toLowerCase().includes(lowerQuery) ||
        email.body.toLowerCase().includes(lowerQuery) ||
        email.sender.toLowerCase().includes(lowerQuery)
      );
    }
  }

  /**
   * Get responses by email ID
   * @param {string} emailId 
   * @returns {Promise<EmailResponse[]>}
   */
  async getResponsesByEmailId(emailId: string): Promise<EmailResponse[]> {
    try {
      const responses = await db.select()
        .from(emailResponses)
        .where(eq(emailResponses.emailId, parseInt(emailId)))
        .orderBy(desc(emailResponses.createdAt));
      return responses;
    } catch (error) {
      console.log('Database unavailable for responses, checking mock storage');
      if (this.mockResponses && this.mockResponses.has(emailId)) {
        const mockResponse = this.mockResponses.get(emailId);
        return mockResponse ? [mockResponse] : [];
      }
      return [];
    }
  }

  /**
   * Create email response
   * @param {InsertEmailResponse} responseData 
   * @returns {Promise<EmailResponse>}
   */
  async createEmailResponse(responseData: InsertEmailResponse): Promise<EmailResponse> {
    try {
      const [response] = await db.insert(emailResponses).values(responseData).returning();
      console.log(`Email response saved to database: ${responseData.emailId}`);
      return response;
    } catch (error) {
      console.log('Database unavailable, creating mock response');
      const mockResponse = {
        id: Date.now(),
        ...responseData,
        createdAt: new Date()
      } as EmailResponse;
      
      if (!this.mockResponses) {
        this.mockResponses = new Map();
      }
      this.mockResponses.set(responseData.emailId?.toString() || '', mockResponse);
      console.log(`Mock response created for email ${responseData.emailId}`);
      return mockResponse;
    }
  }

  /**
   * Update email response
   * @param {string} id 
   * @param {Partial<EmailResponse>} updates 
   * @returns {Promise<EmailResponse>}
   */
  async updateEmailResponse(id: string, updates: Partial<EmailResponse>): Promise<EmailResponse> {
    try {
      const [updatedResponse] = await db.update(emailResponses)
        .set(updates)
        .where(eq(emailResponses.id, parseInt(id)))
        .returning();
      
      if (!updatedResponse) {
        throw new Error(`EmailResponse with id ${id} not found`);
      }
      
      return updatedResponse;
    } catch (error) {
      console.log('Database unavailable, returning mock updated response');
      return {
        id: parseInt(id),
        ...updates,
        createdAt: new Date()
      } as EmailResponse;
    }
  }

  /**
   * Get email statistics
   * @returns {Promise<{totalEmails: number, urgentEmails: number, resolvedEmails: number, pendingEmails: number}>}
   */
  async getEmailStats() {
    try {
      const [totalResult] = await db.select({ count: count() }).from(emails);
      const [urgentResult] = await db.select({ count: count() })
        .from(emails)
        .where(eq(emails.priority, 'urgent'));
      
      // Count resolved emails (those with sent responses)
      const resolvedResult = await db.select({ count: count() })
        .from(emailResponses)
        .where(sql`sent_at IS NOT NULL`);
      const resolvedEmails = resolvedResult[0]?.count || 0;
      
      const totalEmails = totalResult?.count || 0;
      const urgentEmails = urgentResult?.count || 0;
      const pendingEmails = totalEmails - resolvedEmails;

      return {
        totalEmails,
        urgentEmails,
        resolvedEmails,
        pendingEmails
      };
    } catch (error) {
      console.log('Database unavailable, returning sample stats');
      const sampleEmails = this.getSampleEmails();
      const urgentCount = sampleEmails.filter(e => e.priority === 'urgent').length;
      const resolvedCount = Math.floor(sampleEmails.length * 0.6);
      
      return {
        totalEmails: sampleEmails.length,
        urgentEmails: urgentCount,
        resolvedEmails: resolvedCount,
        pendingEmails: sampleEmails.length - resolvedCount
      };
    }
  }

  /**
   * Get sentiment distribution
   * @returns {Promise<{positive: number, negative: number, neutral: number}>}
   */
  async getSentimentDistribution() {
    try {
      const results = await db.select({
        sentiment: emails.sentiment,
        count: count()
      })
      .from(emails)
      .groupBy(emails.sentiment);

      const distribution = { positive: 0, negative: 0, neutral: 0 };
      const total = results.reduce((sum, item) => sum + item.count, 0);

      if (total > 0) {
        results.forEach(item => {
          const percentage = Math.round((item.count / total) * 100);
          if (item.sentiment === 'positive') distribution.positive = percentage;
          else if (item.sentiment === 'negative') distribution.negative = percentage;
          else if (item.sentiment === 'neutral') distribution.neutral = percentage;
        });
      }

      return distribution;
    } catch (error) {
      console.log('Database unavailable, returning sample sentiment data');
      return {
        positive: 45,
        negative: 25,
        neutral: 30
      };
    }
  }

  /**
   * Get category breakdown
   * @returns {Promise<{category: string|null, count: number}[]>}
   */
  async getCategoryBreakdown() {
    try {
      const results = await db.select({
        category: emails.category,
        count: count()
      })
      .from(emails)
      .where(sql`category IS NOT NULL`)
      .groupBy(emails.category)
      .orderBy(desc(count()));

      return results.map(result => ({
        category: result.category,
        count: result.count
      }));
    } catch (error) {
      console.log('Database unavailable, returning sample category data');
      return [
        { category: 'Technical Issue', count: 12 },
        { category: 'Customer Feedback', count: 8 },
        { category: 'Business Development', count: 6 },
        { category: 'Financial', count: 4 },
        { category: 'HR/Internal', count: 3 }
      ];
    }
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