import { google } from 'googleapis';

/**
 * Gmail API client for fetching emails
 */
export class GmailService {
  constructor() {
    this.gmail = null;
    this.auth = null;
  }

  /**
   * Initialize Gmail API with OAuth2 credentials
   * Note: This requires setting up Google API credentials
   */
  async initialize() {
    try {
      // Check if we have the required environment variables
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Gmail API credentials not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables.');
      }

      // Set up OAuth2 client
      this.auth = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost' // redirect URL
      );

      this.auth.setCredentials({
        refresh_token: refreshToken
      });

      // Initialize Gmail API client
      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      
      console.log('Gmail API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gmail API:', error.message);
      return false;
    }
  }

  /**
   * Check if Gmail service is available
   * @returns {Promise<boolean>}
   */
  async isConnected() {
    try {
      if (!this.gmail) {
        return await this.initialize();
      }
      
      // Test the connection
      await this.gmail.users.getProfile({ userId: 'me' });
      return true;
    } catch (error) {
      console.log('Gmail not connected:', error.message);
      return false;
    }
  }

  /**
   * Fetch emails from Gmail
   * @param {number} limit - Maximum number of emails to fetch
   * @returns {Promise<Array>} Array of email objects
   */
  async fetchEmails(limit = 50) {
    try {
      if (!this.gmail) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Gmail API not available');
        }
      }

      // Get list of message IDs
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: limit,
        q: 'in:inbox' // Only fetch inbox emails
      });

      if (!response.data.messages) {
        return [];
      }

      // Fetch detailed information for each email
      const emailPromises = response.data.messages.map(async (message) => {
        try {
          const email = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });

          return this.parseEmailData(email.data);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
          return null;
        }
      });

      const emails = await Promise.all(emailPromises);
      return emails.filter(email => email !== null);
    } catch (error) {
      console.error('Failed to fetch Gmail emails:', error.message);
      throw new Error(`Gmail sync failed: ${error.message}`);
    }
  }

  /**
   * Parse Gmail API response to our email format
   * @param {Object} emailData - Gmail API email data
   * @returns {Object} Parsed email object
   */
  parseEmailData(emailData) {
    const headers = emailData.payload.headers;
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Get email body
    let body = '';
    if (emailData.payload.body.data) {
      body = Buffer.from(emailData.payload.body.data, 'base64').toString();
    } else if (emailData.payload.parts) {
      // Multi-part email, find text/plain part
      const textPart = emailData.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    }

    // Clean HTML if it's HTML content
    if (body.includes('<html>') || body.includes('<div>')) {
      body = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    }

    return {
      id: emailData.id,
      sender: getHeader('From'),
      subject: getHeader('Subject') || 'No Subject',
      body: body || 'No content',
      receivedAt: new Date(parseInt(emailData.internalDate)),
      isRead: !emailData.labelIds?.includes('UNREAD'),
      importance: this.getImportanceFromHeaders(headers)
    };
  }

  /**
   * Determine email importance from headers
   * @param {Array} headers - Email headers
   * @returns {string} 'high', 'normal', or 'low'
   */
  getImportanceFromHeaders(headers) {
    const importance = headers.find(h => 
      h.name.toLowerCase() === 'importance' || 
      h.name.toLowerCase() === 'x-priority'
    )?.value?.toLowerCase();

    if (importance?.includes('high') || importance?.includes('urgent')) {
      return 'high';
    } else if (importance?.includes('low')) {
      return 'low';
    }
    return 'normal';
  }

  /**
   * Get user profile information
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      if (!this.gmail) {
        await this.initialize();
      }

      const profile = await this.gmail.users.getProfile({ userId: 'me' });
      return {
        email: profile.data.emailAddress,
        messagesTotal: profile.data.messagesTotal,
        threadsTotal: profile.data.threadsTotal
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const gmailService = new GmailService();