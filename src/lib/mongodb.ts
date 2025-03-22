import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/municipality?retryWrites=true&w=majority';

interface CachedConnection {
  conn: any;
  promise: Promise<any> | null;
}

declare global {
  var mongoose: CachedConnection | undefined;
}

// Varsayılan initial değer ile başlatıyoruz
let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

// Global değişkene atama yapıyoruz
if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('Connected to MongoDB');
        return mongooseInstance;
      })
      .catch((error: Error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 