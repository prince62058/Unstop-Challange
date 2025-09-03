import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./services/email";
import { insertEmailSchema } from "@shared/schema";
import { z } from "zod";

const createEmailRequestSchema = z.object({
  sender: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  receivedAt: z.string().optional()
});

const generateResponseRequestSchema = z.object({
  emailId: z.string()
});

const sendResponseRequestSchema = z.object({
  emailId: z.string(),
  response: z.string().min(1)
});

const searchEmailsSchema = z.object({
  query: z.string().optional(),
  priority: z.enum(["urgent", "normal"]).optional(),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all emails with filters and search
  app.get("/api/emails", async (req, res) => {
    try {
      const { query, priority, sentiment, limit = 50, offset = 0 } = req.query;
      
      let emails;
      
      if (query) {
        emails = await storage.searchEmails(query as string);
      } else if (priority) {
        emails = await storage.getEmailsByPriority(priority as "urgent" | "normal");
      } else if (sentiment) {
        emails = await storage.getEmailsBySentiment(sentiment as "positive" | "negative" | "neutral");
      } else {
        emails = await emailService.getEmailsWithResponses(Number(limit), Number(offset));
      }

      res.json(emails);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  // Get a specific email by ID
  app.get("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const email = await storage.getEmailById(id);
      
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }

      const responses = await storage.getResponsesByEmailId(id);
      
      res.json({
        ...email,
        responses
      });
    } catch (error) {
      console.error("Failed to fetch email:", error);
      res.status(500).json({ error: "Failed to fetch email" });
    }
  });

  // Create and process a new email
  app.post("/api/emails", async (req, res) => {
    try {
      const validatedData = createEmailRequestSchema.parse(req.body);
      
      const receivedAt = validatedData.receivedAt 
        ? new Date(validatedData.receivedAt) 
        : new Date();

      const processedEmail = await emailService.processEmail(
        validatedData.sender,
        validatedData.subject,
        validatedData.body,
        receivedAt
      );

      res.status(201).json(processedEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      
      console.error("Failed to create email:", error);
      res.status(500).json({ error: "Failed to create email" });
    }
  });

  // Generate AI response for an email
  app.post("/api/emails/:id/generate-response", async (req, res) => {
    try {
      const { id } = req.params;
      
      const response = await emailService.generateResponseForEmail(id);
      
      res.json({ response });
    } catch (error) {
      console.error("Failed to generate response:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Send response for an email
  app.post("/api/emails/:id/send-response", async (req, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      
      if (!response) {
        return res.status(400).json({ error: "Response content is required" });
      }

      await emailService.sendResponse(id, response);
      
      res.json({ success: true, message: "Response sent successfully" });
    } catch (error) {
      console.error("Failed to send response:", error);
      res.status(500).json({ error: "Failed to send response" });
    }
  });

  // Get email statistics
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getEmailStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get sentiment distribution
  app.get("/api/analytics/sentiment", async (req, res) => {
    try {
      const distribution = await storage.getSentimentDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Failed to fetch sentiment distribution:", error);
      res.status(500).json({ error: "Failed to fetch sentiment distribution" });
    }
  });

  // Get category breakdown
  app.get("/api/analytics/categories", async (req, res) => {
    try {
      const categories = await storage.getCategoryBreakdown();
      res.json(categories);
    } catch (error) {
      console.error("Failed to fetch category breakdown:", error);
      res.status(500).json({ error: "Failed to fetch category breakdown" });
    }
  });

  // Bulk process emails (for testing/demo purposes)
  app.post("/api/emails/bulk-process", async (req, res) => {
    try {
      const { emails } = req.body;
      
      if (!Array.isArray(emails)) {
        return res.status(400).json({ error: "Emails must be an array" });
      }

      const processedEmails = await Promise.all(
        emails.map(async (emailData: any) => {
          try {
            return await emailService.processEmail(
              emailData.sender,
              emailData.subject,
              emailData.body,
              emailData.receivedAt ? new Date(emailData.receivedAt) : new Date()
            );
          } catch (error) {
            console.error(`Failed to process email from ${emailData.sender}:`, error);
            return null;
          }
        })
      );

      const successful = processedEmails.filter(email => email !== null);
      
      res.json({
        processed: successful.length,
        failed: emails.length - successful.length,
        emails: successful
      });
    } catch (error) {
      console.error("Failed to bulk process emails:", error);
      res.status(500).json({ error: "Failed to bulk process emails" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
