import { createServer } from "http";
import { storage } from "./storage.js";
import { emailService } from "./services/email.js";
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

export async function registerRoutes(app) {
  // Get all emails with filters and search
  app.get("/api/emails", async (req, res) => {
    try {
      const { query, priority, sentiment, limit = 50, offset = 0 } = req.query;
      
      let emails;
      
      if (query) {
        emails = await storage.searchEmails(query);
      } else if (priority) {
        emails = await storage.getEmailsByPriority(priority);
      } else if (sentiment) {
        emails = await storage.getEmailsBySentiment(sentiment);
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

      const processedEmail = await emailService.processIncomingEmail({
        sender: validatedData.sender,
        subject: validatedData.subject,
        body: validatedData.body,
        receivedAt
      });

      res.status(201).json(processedEmail);
    } catch (error) {
      console.error("Failed to create email:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid email data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create email" });
    }
  });

  // Generate AI response for an email
  app.post("/api/emails/:id/generate-response", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = generateResponseRequestSchema.parse({ emailId: id });
      
      const response = await emailService.generateResponse(validatedData.emailId);
      
      if (!response) {
        return res.status(404).json({ error: "Email not found or unable to generate response" });
      }

      res.json(response);
    } catch (error) {
      console.error("Failed to generate response:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Send a response
  app.post("/api/emails/:id/send-response", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = sendResponseRequestSchema.parse({
        emailId: id,
        response: req.body.response
      });
      
      const result = await emailService.sendResponse(validatedData.emailId, validatedData.response);
      
      if (!result) {
        return res.status(404).json({ error: "Email or response not found" });
      }

      res.json({ success: true, message: "Response sent successfully" });
    } catch (error) {
      console.error("Failed to send response:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to send response" });
    }
  });

  // Get email analytics stats
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getEmailStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch analytics stats:", error);
      res.status(500).json({ error: "Failed to fetch analytics stats" });
    }
  });

  // Get sentiment distribution
  app.get("/api/analytics/sentiment", async (req, res) => {
    try {
      const sentimentData = await storage.getSentimentDistribution();
      res.json(sentimentData);
    } catch (error) {
      console.error("Failed to fetch sentiment analytics:", error);
      res.status(500).json({ error: "Failed to fetch sentiment analytics" });
    }
  });

  // Get category breakdown
  app.get("/api/analytics/categories", async (req, res) => {
    try {
      const categoryData = await storage.getCategoryBreakdown();
      res.json(categoryData);
    } catch (error) {
      console.error("Failed to fetch category analytics:", error);
      res.status(500).json({ error: "Failed to fetch category analytics" });
    }
  });

  // Get email responses for a specific email
  app.get("/api/emails/:id/responses", async (req, res) => {
    try {
      const { id } = req.params;
      const responses = await storage.getResponsesByEmailId(id);
      res.json(responses);
    } catch (error) {
      console.error("Failed to fetch email responses:", error);
      res.status(500).json({ error: "Failed to fetch email responses" });
    }
  });

  // Update an email response
  app.patch("/api/responses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedResponse = await storage.updateEmailResponse(id, updates);
      res.json(updatedResponse);
    } catch (error) {
      console.error("Failed to update email response:", error);
      res.status(500).json({ error: "Failed to update email response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}