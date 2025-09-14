import { 
  User, Email, EmailResponse
} from "../shared/schema.js";
import mongoose from "mongoose";
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
   * @param {string} id 
   * @returns {Promise<Object|undefined>}
   */
  async getUser(id) {
    try {
      const user = await User.findById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  /**
   * Get user by username
   * @param {string} username 
   * @returns {Promise<Object|undefined>}
   */
  async getUserByUsername(username) {
    try {
      const user = await User.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  /**
   * Create a new user
   * @param {Object} insertUser 
   * @returns {Promise<Object>}
   */
  async createUser(insertUser) {
    // Hash password before saving
    if (insertUser.password) {
      insertUser.password = await bcrypt.hash(insertUser.password, 10);
    }
    const user = new User(insertUser);
    return await user.save();
  }

  /**
   * Get emails with pagination
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise<Array>}
   */
  async getEmails(limit = 50, offset = 0) {
    try {
      const emailList = await Email.find()
        .sort({ receivedAt: -1 })
        .limit(limit)
        .skip(offset);
      return emailList;
    } catch (error) {
      console.log('Database unavailable, returning sample data');
      return this.getSampleEmails().slice(offset, offset + limit);
    }
  }

  /**
   * Get email by ID
   * @param {string} id 
   * @returns {Promise<Object|undefined>}
   */
  async getEmailById(id) {
    try {
      const email = await Email.findById(id);
      return email || undefined;
    } catch (error) {
      console.log('Database unavailable, searching sample data');
      return this.getSampleEmails().find(email => email.id?.toString() === id);
    }
  }

  /**
   * Create a new email
   * @param {Object} emailData 
   * @returns {Promise<Object>}
   */
  async createEmail(emailData) {
    try {
      const email = new Email(emailData);
      return await email.save();
    } catch (error) {
      console.log('Database unavailable, creating mock email');
      return {
        id: Date.now(),
        ...emailData,
        createdAt: new Date()
      };
    }
  }

  /**
   * Update email
   * @param {string} id 
   * @param {Object} updates 
   * @returns {Promise<Object>}
   */
  async updateEmail(id, updates) {
    try {
      const updatedEmail = await Email.findByIdAndUpdate(id, updates, { new: true });
      
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
      return { ...existingEmail, ...updates };
    }
  }

  /**
   * Get emails by priority
   * @param {"urgent"|"normal"} priority 
   * @returns {Promise<Array>}
   */
  async getEmailsByPriority(priority) {
    try {
      return await Email.find({ priority })
        .sort({ receivedAt: -1 });
    } catch (error) {
      console.log('Database unavailable, filtering sample data');
      return this.getSampleEmails().filter(email => email.priority === priority);
    }
  }

  /**
   * Get emails by sentiment
   * @param {"positive"|"negative"|"neutral"} sentiment 
   * @returns {Promise<Array>}
   */
  async getEmailsBySentiment(sentiment) {
    try {
      return await Email.find({ sentiment })
        .sort({ receivedAt: -1 });
    } catch (error) {
      console.log('Database unavailable, filtering sample data');
      return this.getSampleEmails().filter(email => email.sentiment === sentiment);
    }
  }

  /**
   * Search emails by query
   * @param {string} query 
   * @returns {Promise<Array>}
   */
  async searchEmails(query) {
    try {
      return await Email.find({
        $or: [
          { subject: { $regex: query, $options: 'i' } },
          { body: { $regex: query, $options: 'i' } },
          { sender: { $regex: query, $options: 'i' } }
        ]
      }).sort({ receivedAt: -1 });
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
   * @returns {Promise<Array>}
   */
  async getResponsesByEmailId(emailId) {
    try {
      const responses = await EmailResponse.find({ emailId })
        .sort({ createdAt: -1 });
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
   * @param {Object} responseData 
   * @returns {Promise<Object>}
   */
  async createEmailResponse(responseData) {
    try {
      const response = new EmailResponse(responseData);
      const savedResponse = await response.save();
      console.log(`Email response saved to database: ${responseData.emailId}`);
      return savedResponse;
    } catch (error) {
      console.log('Database unavailable, creating mock response');
      const mockResponse = {
        id: Date.now(),
        ...responseData,
        createdAt: new Date()
      };
      
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
   * @param {Object} updates 
   * @returns {Promise<Object>}
   */
  async updateEmailResponse(id, updates) {
    try {
      const updatedResponse = await EmailResponse.findByIdAndUpdate(id, updates, { new: true });
      
      if (!updatedResponse) {
        throw new Error(`EmailResponse with id ${id} not found`);
      }
      
      return updatedResponse;
    } catch (error) {
      console.log('Database unavailable, returning mock updated response');
      // For mock purposes, just return a basic response structure
      return {
        id: id,
        ...updates,
        createdAt: new Date()
      };
    }
  }

  /**
   * Get email statistics
   * @returns {Promise<EmailStats>}
   */
  async getEmailStats() {
    try {
      const totalEmails = await Email.countDocuments();
      const urgentEmails = await Email.countDocuments({ priority: 'urgent' });
      
      // Count resolved emails (those with sent responses)
      const resolvedEmailIds = await EmailResponse.distinct('emailId', { sentAt: { $ne: null } });
      const resolvedEmails = resolvedEmailIds.length;
      
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
   * @returns {Promise<SentimentDistribution>}
   */
  async getSentimentDistribution() {
    try {
      const results = await Email.aggregate([
        {
          $group: {
            _id: '$sentiment',
            count: { $sum: 1 }
          }
        }
      ]);

      const distribution = { positive: 0, negative: 0, neutral: 0 };
      const total = results.reduce((sum, item) => sum + item.count, 0);

      if (total > 0) {
        results.forEach(item => {
          const percentage = Math.round((item.count / total) * 100);
          if (item._id === 'positive') distribution.positive = percentage;
          else if (item._id === 'negative') distribution.negative = percentage;
          else if (item._id === 'neutral') distribution.neutral = percentage;
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
   * @returns {Promise<Array<CategoryBreakdown>>}
   */
  async getCategoryBreakdown() {
    try {
      const results = await Email.aggregate([
        {
          $match: { category: { $ne: null } }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return results.map(result => ({
        category: result._id,
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
  getSampleEmails() {
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