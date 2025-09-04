import { pgTable, varchar, text, timestamp, boolean, integer, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  emailAddress: varchar('email_address', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Emails table
export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  sender: varchar('sender', { length: 255 }).notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  receivedAt: timestamp('received_at').notNull(),
  priority: varchar('priority', { length: 10 }).notNull().$type<'urgent' | 'normal'>(),
  sentiment: varchar('sentiment', { length: 10 }).notNull().$type<'positive' | 'negative' | 'neutral'>(),
  category: varchar('category', { length: 100 }),
  extractedInfo: text('extracted_info'), // JSON stored as text
  isProcessed: boolean('is_processed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Email responses table
export const emailResponses = pgTable('email_responses', {
  id: serial('id').primaryKey(),
  emailId: integer('email_id').references(() => emails.id).notNull(),
  generatedResponse: text('generated_response').notNull(),
  isEdited: boolean('is_edited').default(false).notNull(),
  finalResponse: text('final_response'),
  sentAt: timestamp('sent_at'),
  confidence: integer('confidence'), // 0-100
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports for compatibility with existing code
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertEmail = typeof emails.$inferInsert;
export type SelectEmail = typeof emails.$inferSelect;

export type InsertEmailResponse = typeof emailResponses.$inferInsert;
export type SelectEmailResponse = typeof emailResponses.$inferSelect;

// Legacy interface compatibility - these maintain the same shape as Mongoose interfaces
export interface IUser {
  id?: number;
  username: string;
  password: string;
  emailAddress?: string;
  createdAt?: Date;
}

export interface IEmail {
  id?: number;
  sender: string;
  subject: string;
  body: string;
  receivedAt: Date;
  priority: 'urgent' | 'normal';
  sentiment: 'positive' | 'negative' | 'neutral';
  category?: string;
  extractedInfo?: any;
  isProcessed: boolean;
  createdAt?: Date;
}

export interface IEmailResponse {
  id?: number;
  emailId: number;
  generatedResponse: string;
  isEdited: boolean;
  finalResponse?: string;
  sentAt?: Date;
  confidence?: number;
  createdAt?: Date;
}