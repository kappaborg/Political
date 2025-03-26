import mongoose from 'mongoose';

// Track connection status to avoid multiple connection attempts
interface MongoConnectionStatus {
  isConnected?: number;
  connectionPromise?: Promise<typeof mongoose>;
}

const connection: MongoConnectionStatus = {};

async function connectToDatabase(): Promise<typeof mongoose> {
  // If we're already connected, return the existing connection
  if (connection.isConnected) {
    console.log('Using existing MongoDB connection');
    return mongoose;
  }

  // If a connection attempt is already in progress, return that promise
  if (connection.connectionPromise) {
    return connection.connectionPromise;
  }

  // Validate env var presence
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    // Create a new connection promise
    connection.connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB connection options
      // The typings expect serverApi but mongoose handles this internally
    });

    // Wait for the connection to be established
    const db = await connection.connectionPromise;
    
    // Set the connection status
    connection.isConnected = db.connections[0].readyState;
    console.log('MongoDB connected successfully');
    
    // Remove the connection promise to allow new connection attempts if needed
    connection.connectionPromise = undefined;
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Clear connection promise to allow retry attempts
    connection.connectionPromise = undefined;
    
    throw error;
  }
}

export default connectToDatabase; 