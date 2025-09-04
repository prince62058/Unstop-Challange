import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, emails, emailResponses } from '../shared/schema.js';

let db: ReturnType<typeof drizzle> | null = null;

export const connectDB = async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.error('DATABASE_URL environment variable is required');
      throw new Error('DATABASE_URL is not configured');
    }

    // Create postgres connection
    const client = postgres(DATABASE_URL);
    
    // Create drizzle instance
    db = drizzle(client);
    
    console.log('Connected to PostgreSQL database successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

export { users, emails, emailResponses };
export default db;