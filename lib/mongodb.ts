import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let isConnected = false;

export async function connectToDatabase() {
  try {
    if (!isConnected) {
      await client.connect();
      console.log('Connected to MongoDB');
      isConnected = true;
    }
    return client.db('hotel_db');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export { client };