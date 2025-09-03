import { 
  users, emails, emailResponses,
  type User, type InsertUser, 
  type Email, type InsertEmail,
  type EmailResponse, type InsertEmailResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Email operations
  getEmails(limit?: number, offset?: number): Promise<Email[]>;
  getEmailById(id: string): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: string, updates: Partial<InsertEmail>): Promise<Email>;
  getEmailsByPriority(priority: "urgent" | "normal"): Promise<Email[]>;
  getEmailsBySentiment(sentiment: "positive" | "negative" | "neutral"): Promise<Email[]>;
  searchEmails(query: string): Promise<Email[]>;

  // Email response operations
  getResponsesByEmailId(emailId: string): Promise<EmailResponse[]>;
  createEmailResponse(response: InsertEmailResponse): Promise<EmailResponse>;
  updateEmailResponse(id: string, updates: Partial<InsertEmailResponse>): Promise<EmailResponse>;

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
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEmails(limit = 50, offset = 0): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .orderBy(desc(emails.receivedAt))
      .limit(limit)
      .offset(offset);
  }

  async getEmailById(id: string): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email || undefined;
  }

  async createEmail(email: InsertEmail): Promise<Email> {
    const [newEmail] = await db
      .insert(emails)
      .values(email)
      .returning();
    return newEmail;
  }

  async updateEmail(id: string, updates: Partial<InsertEmail>): Promise<Email> {
    const [updatedEmail] = await db
      .update(emails)
      .set(updates)
      .where(eq(emails.id, id))
      .returning();
    return updatedEmail;
  }

  async getEmailsByPriority(priority: "urgent" | "normal"): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.priority, priority))
      .orderBy(desc(emails.receivedAt));
  }

  async getEmailsBySentiment(sentiment: "positive" | "negative" | "neutral"): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.sentiment, sentiment))
      .orderBy(desc(emails.receivedAt));
  }

  async searchEmails(query: string): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(
        sql`${emails.subject} ILIKE ${'%' + query + '%'} OR ${emails.body} ILIKE ${'%' + query + '%'} OR ${emails.sender} ILIKE ${'%' + query + '%'}`
      )
      .orderBy(desc(emails.receivedAt));
  }

  async getResponsesByEmailId(emailId: string): Promise<EmailResponse[]> {
    return await db
      .select()
      .from(emailResponses)
      .where(eq(emailResponses.emailId, emailId))
      .orderBy(desc(emailResponses.createdAt));
  }

  async createEmailResponse(response: InsertEmailResponse): Promise<EmailResponse> {
    const [newResponse] = await db
      .insert(emailResponses)
      .values(response)
      .returning();
    return newResponse;
  }

  async updateEmailResponse(id: string, updates: Partial<InsertEmailResponse>): Promise<EmailResponse> {
    const [updatedResponse] = await db
      .update(emailResponses)
      .set(updates)
      .where(eq(emailResponses.id, id))
      .returning();
    return updatedResponse;
  }

  async getEmailStats() {
    const [stats] = await db
      .select({
        totalEmails: count(),
        urgentEmails: count(sql`CASE WHEN ${emails.priority} = 'urgent' THEN 1 END`),
        resolvedEmails: count(sql`CASE WHEN EXISTS (SELECT 1 FROM ${emailResponses} WHERE ${emailResponses.emailId} = ${emails.id} AND ${emailResponses.sentAt} IS NOT NULL) THEN 1 END`),
        pendingEmails: count(sql`CASE WHEN NOT EXISTS (SELECT 1 FROM ${emailResponses} WHERE ${emailResponses.emailId} = ${emails.id} AND ${emailResponses.sentAt} IS NOT NULL) THEN 1 END`),
      })
      .from(emails);

    return stats;
  }

  async getSentimentDistribution() {
    const results = await db
      .select({
        sentiment: emails.sentiment,
        count: count(),
      })
      .from(emails)
      .groupBy(emails.sentiment);

    const distribution = { positive: 0, negative: 0, neutral: 0 };
    const total = results.reduce((sum, item) => sum + item.count, 0);

    results.forEach(item => {
      const percentage = Math.round((item.count / total) * 100);
      if (item.sentiment === 'positive') distribution.positive = percentage;
      else if (item.sentiment === 'negative') distribution.negative = percentage;
      else if (item.sentiment === 'neutral') distribution.neutral = percentage;
    });

    return distribution;
  }

  async getCategoryBreakdown() {
    return await db
      .select({
        category: emails.category,
        count: count(),
      })
      .from(emails)
      .where(sql`${emails.category} IS NOT NULL`)
      .groupBy(emails.category)
      .orderBy(desc(count()));
  }
}

export const storage = new DatabaseStorage();
