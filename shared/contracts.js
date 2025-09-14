// Client-safe data contracts and shapes
// These are used by the frontend and don't import server-only dependencies

// User data shape
export const userShape = {
  _id: null,
  id: '',
  username: '',
  password: '',
  emailAddress: '',
  createdAt: null
};

// Email data shape
export const emailShape = {
  _id: null,
  id: '',
  sender: '',
  subject: '',
  body: '',
  receivedAt: null,
  priority: '', // 'urgent' | 'normal'
  sentiment: '', // 'positive' | 'negative' | 'neutral'
  category: '',
  extractedInfo: null,
  isProcessed: false,
  createdAt: null
};

// Email Response data shape
export const emailResponseShape = {
  _id: null,
  id: '',
  emailId: '',
  generatedResponse: '',
  isEdited: false,
  finalResponse: '',
  sentAt: null,
  confidence: 0,
  createdAt: null
};

// Priority options
export const PRIORITY_OPTIONS = ['urgent', 'normal'];

// Sentiment options
export const SENTIMENT_OPTIONS = ['positive', 'negative', 'neutral'];