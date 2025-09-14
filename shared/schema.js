import mongoose, { Schema } from 'mongoose';

// User Schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true, maxlength: 255 },
  password: { type: String, required: true, maxlength: 255 },
  emailAddress: { type: String, maxlength: 255 },
  createdAt: { type: Date, default: Date.now }
});

// Email Schema  
const emailSchema = new Schema({
  sender: { type: String, required: true, maxlength: 255 },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  receivedAt: { type: Date, required: true },
  priority: { type: String, enum: ['urgent', 'normal'], required: true },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
  category: { type: String, maxlength: 100 },
  extractedInfo: { type: Schema.Types.Mixed },
  isProcessed: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Email Response Schema
const emailResponseSchema = new Schema({
  emailId: { type: Schema.Types.ObjectId, ref: 'Email', required: true },
  generatedResponse: { type: String, required: true },
  isEdited: { type: Boolean, default: false, required: true },
  finalResponse: { type: String },
  sentAt: { type: Date },
  confidence: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now }
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const Email = mongoose.model('Email', emailSchema);
export const EmailResponse = mongoose.model('EmailResponse', emailResponseSchema);

// Export schemas for direct access if needed
export const users = User;
export const emails = Email; 
export const emailResponses = EmailResponse;