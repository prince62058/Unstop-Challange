import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  emailAddress: text("email_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emails = pgTable("emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sender: text("sender").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  receivedAt: timestamp("received_at").notNull(),
  priority: text("priority").notNull(), // "urgent" | "normal"
  sentiment: text("sentiment").notNull(), // "positive" | "negative" | "neutral"
  category: text("category"),
  extractedInfo: jsonb("extracted_info"),
  isProcessed: boolean("is_processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailResponses = pgTable("email_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  emailId: varchar("email_id").notNull().references(() => emails.id),
  generatedResponse: text("generated_response").notNull(),
  isEdited: boolean("is_edited").default(false),
  finalResponse: text("final_response"),
  sentAt: timestamp("sent_at"),
  confidence: integer("confidence"), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailsRelations = relations(emails, ({ many }) => ({
  responses: many(emailResponses),
}));

export const emailResponsesRelations = relations(emailResponses, ({ one }) => ({
  email: one(emails, {
    fields: [emailResponses.emailId],
    references: [emails.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  emailAddress: true,
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  createdAt: true,
});

export const insertEmailResponseSchema = createInsertSchema(emailResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Email = typeof emails.$inferSelect;
export type EmailResponse = typeof emailResponses.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type InsertEmailResponse = z.infer<typeof insertEmailResponseSchema>;
