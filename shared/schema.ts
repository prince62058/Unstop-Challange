import { pgTable, serial, text, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  emailAddress: text('email_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Email table
export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  sender: text('sender').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  receivedAt: timestamp('received_at').notNull(),
  priority: text('priority').$type<'urgent' | 'normal'>().notNull(),
  sentiment: text('sentiment').$type<'positive' | 'negative' | 'neutral'>().notNull(),
  category: text('category'),
  extractedInfo: json('extracted_info'),
  isProcessed: boolean('is_processed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Email responses table
export const emailResponses = pgTable('email_responses', {
  id: serial('id').primaryKey(),
  emailId: integer('email_id').notNull(),
  generatedResponse: text('generated_response').notNull(),
  isEdited: boolean('is_edited').default(false).notNull(),
  finalResponse: text('final_response'),
  sentAt: timestamp('sent_at'),
  confidence: integer('confidence'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const emailsRelations = relations(emails, ({ many }) => ({
  responses: many(emailResponses),
}));

export const emailResponsesRelations = relations(emailResponses, ({ one }) => ({
  email: one(emails, { fields: [emailResponses.emailId], references: [emails.id] }),
}));

// Type exports for compatibility
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

export type EmailResponse = typeof emailResponses.$inferSelect;
export type InsertEmailResponse = typeof emailResponses.$inferInsert;

// Legacy exports for compatibility with existing code
export type IUser = User;
export type IEmail = Email;
export type IEmailResponse = EmailResponse;

export type SelectUser = User;
export type SelectEmail = Email;
export type SelectEmailResponse = EmailResponse;