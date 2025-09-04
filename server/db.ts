import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, emails, emailResponses } from '../shared/schema.js';

let db: ReturnType<typeof drizzle> | null = null;

export const connectDB = async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.warn('DATABASE_URL not configured. App will run with sample data only.');
      return null;
    }

    // Create postgres connection
    const client = postgres(DATABASE_URL);
    
    // Create drizzle instance
    db = drizzle(client);
    
    console.log('Connected to PostgreSQL database successfully');
    return db;
  } catch (error) {
    console.warn('Failed to connect to database, continuing with sample data:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not available');
  }
  return db;
};

export { users, emails, emailResponses };
export default db;