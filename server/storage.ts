import { 
  User, Email, EmailResponse,
  type IUser, type IEmail, type IEmailResponse,
  type InsertUser, type InsertEmail, type InsertEmailResponse
} from "@shared/schema";

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
      const user = await User.findById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    const user = new User(insertUser);
    return await user.save();
  }

  async getEmails(limit = 50, offset = 0): Promise<IEmail[]> {
    try {
      const emails = await Email.find({})
        .sort({ receivedAt: -1 })
        .limit(limit)
        .skip(offset)
        .timeout(3000)
        .exec();
      return emails;
    } catch (error) {
      console.log('Database unavailable, returning sample data');
      return this.getSampleEmails().slice(offset, offset + limit);
    }
  }

  async getEmailById(id: string): Promise<IEmail | undefined> {
    try {
      const email = await Email.findById(id).timeout(3000);
      return email || undefined;
    } catch (error) {
      console.log('Database unavailable, searching sample data');
      return this.getSampleEmails().find(email => email._id === id);
    }
  }

  async createEmail(emailData: InsertEmail): Promise<IEmail> {
    try {
      const email = new Email(emailData);
      return await email.save();
    } catch (error) {
      console.log('Database unavailable, creating mock email');
      return {
        _id: Date.now().toString(),
        ...emailData,
        createdAt: new Date()
      } as IEmail;
    }
  }

  async updateEmail(id: string, updates: Partial<InsertEmail>): Promise<IEmail> {
    const updatedEmail = await Email.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!updatedEmail) {
      throw new Error(`Email with id ${id} not found`);
    }
    
    return updatedEmail;
  }

  async getEmailsByPriority(priority: "urgent" | "normal"): Promise<IEmail[]> {
    return await Email.find({ priority })
      .sort({ receivedAt: -1 })
      .exec();
  }

  async getEmailsBySentiment(sentiment: "positive" | "negative" | "neutral"): Promise<IEmail[]> {
    return await Email.find({ sentiment })
      .sort({ receivedAt: -1 })
      .exec();
  }

  async searchEmails(query: string): Promise<IEmail[]> {
    return await Email.find({
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { body: { $regex: query, $options: 'i' } },
        { sender: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ receivedAt: -1 })
    .exec();
  }

  async getResponsesByEmailId(emailId: string): Promise<IEmailResponse[]> {
    try {
      return await EmailResponse.find({ emailId })
        .sort({ createdAt: -1 })
        .timeout(3000)
        .exec();
    } catch (error) {
      console.log('Database unavailable for responses, checking mock storage');
      // Check mock responses if available
      if (this.mockResponses && this.mockResponses.has(emailId)) {
        const mockResponse = this.mockResponses.get(emailId);
        return mockResponse ? [mockResponse] : [];
      }
      return [];
    }
  }

  async createEmailResponse(responseData: InsertEmailResponse): Promise<IEmailResponse> {
    try {
      const response = new EmailResponse(responseData);
      const savedResponse = await response.save();
      console.log(`Email response saved to database: ${responseData.emailId}`);
      return savedResponse;
    } catch (error) {
      console.log('Database unavailable, creating mock response');
      const mockResponse = {
        _id: Date.now().toString(),
        ...responseData,
        id: Date.now().toString(),
        createdAt: new Date()
      } as IEmailResponse;
      
      // Store the mock response in memory for this session
      if (!this.mockResponses) {
        this.mockResponses = new Map();
      }
      this.mockResponses.set(responseData.emailId, mockResponse);
      console.log(`Mock response created for email ${responseData.emailId}`);
      return mockResponse;
    }
  }

  async updateEmailResponse(id: string, updates: Partial<InsertEmailResponse>): Promise<IEmailResponse> {
    const updatedResponse = await EmailResponse.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!updatedResponse) {
      throw new Error(`EmailResponse with id ${id} not found`);
    }
    
    return updatedResponse;
  }

  async getEmailStats() {
    try {
      const totalEmails = await Email.countDocuments().timeout(3000);
      const urgentEmails = await Email.countDocuments({ priority: 'urgent' }).timeout(3000);
      
      // Count resolved emails (those with sent responses)
      const resolvedEmails = await EmailResponse.distinct('emailId', { sentAt: { $ne: null } }).timeout(3000);
      const pendingEmails = totalEmails - resolvedEmails.length;

      return {
        totalEmails,
        urgentEmails,
        resolvedEmails: resolvedEmails.length,
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
      const results = await Email.aggregate([
        {
          $group: {
            _id: '$sentiment',
            count: { $sum: 1 }
          }
        }
      ]).timeout(3000);

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
      // Sample distribution for demo
      return {
        positive: 45,
        negative: 25,
        neutral: 30
      };
    }
  }

  async getCategoryBreakdown() {
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
  }

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
      ]).timeout(3000);

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
  private getSampleEmails(): IEmail[] {
    return [
      {
        _id: '1',
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
        _id: '2',
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
        _id: '3',
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
        _id: '4',
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
        _id: '5',
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