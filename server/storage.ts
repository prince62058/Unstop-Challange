import { 
  users, emails, emailResponses,
  type IUser, type IEmail, type IEmailResponse,
  type InsertUser, type InsertEmail, type InsertEmailResponse
} from "@shared/schema";
import { getDB } from "./db.js";
import { eq, desc, like, or, and, count, isNull, isNotNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByUsername(username: string): Promise<IUser | undefined>;
  createUser(user: InsertUser): Promise<IUser>;

  // Email operations
  getEmails(limit?: number, offset?: number): Promise<IEmail[]>;
  getEmailById(id: string): Promise<IEmail | undefined>;
  createEmail(email: InsertEmail): Promise<IEmail>;
  updateEmail(id: string, updates: Partial<InsertEmail>): Promise<IEmail>;
  getEmailsByPriority(priority: "urgent" | "normal"): Promise<IEmail[]>;
  getEmailsBySentiment(sentiment: "positive" | "negative" | "neutral"): Promise<IEmail[]>;
  searchEmails(query: string): Promise<IEmail[]>;

  // Email response operations
  getResponsesByEmailId(emailId: string): Promise<IEmailResponse[]>;
  createEmailResponse(response: InsertEmailResponse): Promise<IEmailResponse>;
  updateEmailResponse(id: string, updates: Partial<InsertEmailResponse>): Promise<IEmailResponse>;

  // Analytics
  getEmailStats(): Promise<{
    totalEmails: number;
    urgentEmails: number;
    resolvedEmails: number;
    pendingEmails: number;
  }>;
  getSentimentDistribution(): Promise<{
    positive: number;
    negative: number;
    neutral: number;
  }>;
  getCategoryBreakdown(): Promise<Array<{ category: string | null; count: number }>>;
}

export class DatabaseStorage implements IStorage {
  private mockResponses = new Map<string, IEmailResponse>();

  async getUser(id: string): Promise<IUser | undefined> {
    try {
      const db = getDB();
      const user = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
      return user[0] || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    try {
      const db = getDB();
      const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return user[0] || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    const db = getDB();
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getEmails(limit = 50, offset = 0): Promise<IEmail[]> {
    try {
      const db = getDB();
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

  async getEmailById(id: string): Promise<IEmail | undefined> {
    try {
      const db = getDB();
      const email = await db.select().from(emails).where(eq(emails.id, parseInt(id))).limit(1);
      return email[0] || undefined;
    } catch (error) {
      console.log('Database unavailable, searching sample data');
      return this.getSampleEmails().find(email => email.id?.toString() === id);
    }
  }

  async createEmail(emailData: InsertEmail): Promise<IEmail> {
    try {
      const db = getDB();
      const [email] = await db.insert(emails).values(emailData).returning();
      return email;
    } catch (error) {
      console.log('Database unavailable, creating mock email');
      return {
        id: Date.now(),
        ...emailData,
        createdAt: new Date()
      } as IEmail;
    }
  }

  async updateEmail(id: string, updates: Partial<InsertEmail>): Promise<IEmail> {
    try {
      const db = getDB();
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
      return { ...existingEmail, ...updates } as IEmail;
    }
  }

  async getEmailsByPriority(priority: "urgent" | "normal"): Promise<IEmail[]> {
    try {
      const db = getDB();
      return await db.select()
        .from(emails)
        .where(eq(emails.priority, priority))
        .orderBy(desc(emails.receivedAt));
    } catch (error) {
      console.log('Database unavailable, filtering sample data');
      return this.getSampleEmails().filter(email => email.priority === priority);
    }
  }

  async getEmailsBySentiment(sentiment: "positive" | "negative" | "neutral"): Promise<IEmail[]> {
    try {
      const db = getDB();
      return await db.select()
        .from(emails)
        .where(eq(emails.sentiment, sentiment))
        .orderBy(desc(emails.receivedAt));
    } catch (error) {
      console.log('Database unavailable, filtering sample data');
      return this.getSampleEmails().filter(email => email.sentiment === sentiment);
    }
  }

  async searchEmails(query: string): Promise<IEmail[]> {
    try {
      const db = getDB();
      return await db.select()
        .from(emails)
        .where(
          or(
            like(emails.subject, `%${query}%`),
            like(emails.body, `%${query}%`),
            like(emails.sender, `%${query}%`)
          )
        )
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

  async getResponsesByEmailId(emailId: string): Promise<IEmailResponse[]> {
    try {
      const db = getDB();
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

  async createEmailResponse(responseData: InsertEmailResponse): Promise<IEmailResponse> {
    try {
      const db = getDB();
      const [response] = await db.insert(emailResponses).values(responseData).returning();
      console.log(`Email response saved to database: ${responseData.emailId}`);
      return response;
    } catch (error) {
      console.log('Database unavailable, creating mock response');
      const mockResponse = {
        id: Date.now(),
        ...responseData,
        createdAt: new Date()
      } as IEmailResponse;
      
      if (!this.mockResponses) {
        this.mockResponses = new Map();
      }
      this.mockResponses.set(responseData.emailId.toString(), mockResponse);
      console.log(`Mock response created for email ${responseData.emailId}`);
      return mockResponse;
    }
  }

  async updateEmailResponse(id: string, updates: Partial<InsertEmailResponse>): Promise<IEmailResponse> {
    try {
      const db = getDB();
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
      // For mock purposes, just return a basic response structure
      return {
        id: parseInt(id),
        ...updates,
        createdAt: new Date()
      } as IEmailResponse;
    }
  }

  async getEmailStats() {
    try {
      const db = getDB();
      
      const totalEmailsResult = await db.select({ count: count() }).from(emails);
      const totalEmails = totalEmailsResult[0]?.count || 0;
      
      const urgentEmailsResult = await db.select({ count: count() })
        .from(emails)
        .where(eq(emails.priority, 'urgent'));
      const urgentEmails = urgentEmailsResult[0]?.count || 0;
      
      // Count resolved emails (those with sent responses)
      const resolvedEmailsResult = await db.selectDistinct({ emailId: emailResponses.emailId })
        .from(emailResponses)
        .where(isNotNull(emailResponses.sentAt));
      const resolvedEmails = resolvedEmailsResult.length;
      
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

  async getSentimentDistribution() {
    try {
      const db = getDB();
      
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

  async getCategoryBreakdown() {
    try {
      const db = getDB();
      
      const results = await db.select({
        category: emails.category,
        count: count()
      })
      .from(emails)
      .where(isNotNull(emails.category))
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
  private getSampleEmails(): IEmail[] {
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
      } as IEmail,
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
      } as IEmail,
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
      } as IEmail,
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
      } as IEmail,
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
      } as IEmail
    ];
  }
}

export const storage = new DatabaseStorage();