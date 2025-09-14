import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  username: string;
  password: string;
  emailAddress?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, maxlength: 255 },
  password: { type: String, required: true, maxlength: 255 },
  emailAddress: { type: String, maxlength: 255 },
  createdAt: { type: Date, default: Date.now }
});

// Email Schema  
export interface IEmail extends Document {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  sender: string;
  subject: string;
  body: string;
  receivedAt: Date;
  priority: 'urgent' | 'normal';
  sentiment: 'positive' | 'negative' | 'neutral';
  category?: string;
  extractedInfo?: any;
  isProcessed: boolean;
  createdAt: Date;
}

const emailSchema = new Schema<IEmail>({
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
export interface IEmailResponse extends Document {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  emailId: mongoose.Types.ObjectId | string;
  generatedResponse: string;
  isEdited: boolean;
  finalResponse?: string;
  sentAt?: Date;
  confidence?: number;
  createdAt: Date;
}

const emailResponseSchema = new Schema<IEmailResponse>({
  emailId: { type: Schema.Types.ObjectId, ref: 'Email', required: true },
  generatedResponse: { type: String, required: true },
  isEdited: { type: Boolean, default: false, required: true },
  finalResponse: { type: String },
  sentAt: { type: Date },
  confidence: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now }
});

// Create and export models
export const User = mongoose.model<IUser>('User', userSchema);
export const Email = mongoose.model<IEmail>('Email', emailSchema);
export const EmailResponse = mongoose.model<IEmailResponse>('EmailResponse', emailResponseSchema);

// Export schemas for direct access if needed
export const users = User;
export const emails = Email; 
export const emailResponses = EmailResponse;

// Type exports for compatibility with existing code
export type InsertUser = Partial<IUser>;
export type SelectUser = IUser;

export type InsertEmail = Partial<IEmail>;
export type SelectEmail = IEmail;

export type InsertEmailResponse = Partial<IEmailResponse>;
export type SelectEmailResponse = IEmailResponse;

