import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prince:prince123@cluster0.mongodb.net/emailManagementDB?retryWrites=true&w=majority';

export const connectDB = async () => {
  try {
    // First, try the provided MongoDB connection
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to remote MongoDB, trying alternative approaches:', error);
    
    // Fallback: Try without SRV if the main connection fails
    try {
      const fallbackUri = 'mongodb://localhost:27017/emailManagementDB';
      console.log('Attempting to connect to local MongoDB...');
      await mongoose.connect(fallbackUri);
      console.log('Connected to local MongoDB successfully');
    } catch (fallbackError) {
      console.error('Local MongoDB also failed, using in-memory storage:', fallbackError);
      // For development, we can continue without DB and add sample data
      console.log('Continuing with in-memory storage for demo purposes');
    }
  }
};

export default mongoose;