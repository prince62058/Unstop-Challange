import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connects to MongoDB database
 * @returns {Promise<mongoose.Connection|null>} MongoDB connection or null if failed
 */
export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!MONGODB_URI) {
      console.warn('MONGODB_URI not configured. App will run with sample data only.');
      return null;
    }

    // Skip connection if already connected
    if (isConnected) {
      console.log('Using existing MongoDB connection');
      return mongoose.connection;
    }

    // Connect to MongoDB
    const connection = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB database successfully');
    return connection;
  } catch (error) {
    console.warn('Failed to connect to database, continuing with sample data:', error instanceof Error ? error.message : 'Unknown error');
    isConnected = false;
    return null;
  }
};

/**
 * Gets the current database connection
 * @returns {mongoose.Connection} MongoDB connection
 * @throws {Error} If database is not available
 */
export const getDB = () => {
  if (!isConnected || !mongoose.connection.readyState) {
    throw new Error('Database not available');
  }
  return mongoose.connection;
};

export default mongoose;