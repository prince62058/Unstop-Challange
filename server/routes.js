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

/**
 * Register API routes with Express app
 * @param {Object} app Express application instance
 * @returns {Promise<Object>} HTTP Server instance
 */
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
        emails.map(async (emailData) => {
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

  // Sync emails endpoint - populates database with sample data
  app.post("/api/emails/sync", async (req, res) => {
    try {
      console.log("Starting email sync...");
      
      // Sample email data to populate the database
      const sampleEmails = [
        {
          sender: "john.doe@techcorp.com",
          subject: "🚨 Urgent: Server downtime issue",
          body: "Hi team, we're experiencing server downtime on production. This is affecting all our customers. Please prioritize this issue immediately. The error logs show database connection failures.",
          priority: "urgent",
          sentiment: "negative",
          category: "Technical Issue",
          receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          extractedInfo: JSON.stringify({
            phoneNumbers: [],
            alternateEmails: [],
            customerRequirements: ["Fix server downtime", "Database connection issues"],
            urgency: "high"
          }),
          isProcessed: true
        },
        {
          sender: "sarah.johnson@clientcompany.com",
          subject: "✨ Thank you for the excellent service!",
          body: "I wanted to reach out and express my gratitude for the outstanding support your team provided during our recent project. Everything went smoothly and exceeded our expectations.",
          priority: "normal",
          sentiment: "positive",
          category: "Customer Feedback",
          receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          extractedInfo: JSON.stringify({
            phoneNumbers: [],
            alternateEmails: [],
            customerRequirements: ["Positive feedback"],
            satisfactionLevel: "high"
          }),
          isProcessed: true
        },
        {
          sender: "marketing@partner.com",
          subject: "🤝 Partnership opportunity discussion",
          body: "Hello, we've been following your company's growth and would like to discuss potential partnership opportunities. We believe there's great synergy between our organizations.",
          priority: "normal",
          sentiment: "neutral",
          category: "Business Development",
          receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          extractedInfo: JSON.stringify({
            phoneNumbers: [],
            alternateEmails: [],
            customerRequirements: ["Partnership discussion", "Business collaboration"],
            opportunityType: "partnership"
          }),
          isProcessed: false
        },
        {
          sender: "billing@vendor.com",
          subject: "💸 Invoice #INV-2024-001 is overdue",
          body: "This is a reminder that invoice #INV-2024-001 for $2,500 is now 30 days overdue. Please arrange payment at your earliest convenience to avoid service disruption.",
          priority: "urgent",
          sentiment: "negative",
          category: "Financial",
          receivedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          extractedInfo: JSON.stringify({
            phoneNumbers: [],
            alternateEmails: [],
            customerRequirements: ["Payment reminder", "Invoice settlement"],
            invoiceNumber: "INV-2024-001",
            amount: "$2,500"
          }),
          isProcessed: false
        },
        {
          sender: "hr@company.com",
          subject: "🎉 Team building event next Friday",
          body: "Reminder: Our monthly team building event is scheduled for next Friday at 3 PM in the main conference room. Pizza will be provided! Please confirm your attendance.",
          priority: "normal",
          sentiment: "positive",
          category: "HR/Internal",
          receivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          extractedInfo: JSON.stringify({
            phoneNumbers: [],
            alternateEmails: [],
            customerRequirements: ["Event confirmation", "Attendance tracking"],
            eventType: "team building"
          }),
          isProcessed: true
        }
      ];

      // Insert sample emails into database
      const insertedEmails = [];
      for (const emailData of sampleEmails) {
        try {
          const email = await storage.createEmail(emailData);
          insertedEmails.push(email);
          console.log(`Created email: ${email.subject}`);
        } catch (error) {
          console.error(`Failed to create email: ${emailData.subject}`, error);
        }
      }

      console.log(`Email sync completed. Created ${insertedEmails.length} emails.`);
      
      res.json({
        success: true,
        message: `Successfully synced ${insertedEmails.length} emails`,
        emailsCreated: insertedEmails.length,
        emails: insertedEmails
      });
    } catch (error) {
      console.error("Failed to sync emails:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to sync emails",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}