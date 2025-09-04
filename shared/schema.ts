import mongoose, { Schema, Document } from 'mongoose';

// User Interface and Schema
export interface IUser extends Document {
  username: string;
  password: string;
  emailAddress?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Email Interface and Schema
export interface IEmail extends Document {
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
  sender: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  receivedAt: { type: Date, required: true },
  priority: { type: String, enum: ['urgent', 'normal'], required: true },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
  category: { type: String },
  extractedInfo: { type: Schema.Types.Mixed },
  isProcessed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Email Response Interface and Schema
export interface IEmailResponse extends Document {
  emailId: string;
  generatedResponse: string;
  isEdited: boolean;
  finalResponse?: string;
  sentAt?: Date;
  confidence?: number;
  createdAt: Date;
}

const emailResponseSchema = new Schema<IEmailResponse>({
  emailId: { type: String, required: true, ref: 'Email' },
  generatedResponse: { type: String, required: true },
  isEdited: { type: Boolean, default: false },
  finalResponse: { type: String },
  sentAt: { type: Date },
  confidence: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now }
});

// Export models
export const User = mongoose.model<IUser>('User', userSchema);
export const Email = mongoose.model<IEmail>('Email', emailSchema);
export const EmailResponse = mongoose.model<IEmailResponse>('EmailResponse', emailResponseSchema);

// Export types for use in API routes
export type InsertUser = Pick<IUser, 'username' | 'password' | 'emailAddress'>;
export type InsertEmail = Omit<IEmail, '_id' | 'createdAt'>;
export type InsertEmailResponse = Omit<IEmailResponse, '_id' | 'createdAt'>;