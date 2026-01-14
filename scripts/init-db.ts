// Initialize MongoDB collections and counters
import { connectToDatabase } from '../lib/mongodb';

async function initializeDatabase() {
  try {
    const db = await connectToDatabase();

    // Initialize counters
    await db.collection('counters').updateOne(
      { _id: 'order_id' },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );

    // Create default users
    await db.collection('users').updateOne(
      { username: 'admin' },
      {
        $setOnInsert: {
          username: 'admin',
          password: 'admin123',
          name: 'Administrator',
          role: 'Admin',
          created_at: new Date()
        }
      },
      { upsert: true }
    );

    await db.collection('users').updateOne(
      { username: 'cashier' },
      {
        $setOnInsert: {
          username: 'cashier',
          password: 'cashier123',
          name: 'Cashier',
          role: 'Cashier',
          created_at: new Date()
        }
      },
      { upsert: true }
    );

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();