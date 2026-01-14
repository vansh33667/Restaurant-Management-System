import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();

    // Get list of collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // Test counters collection
    const counter = await db.collection('counters').findOneAndUpdate(
      { _id: 'order_id' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      collections: collectionNames,
      next_order_id: counter!.seq.toString().padStart(8, '0')
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { error: 'MongoDB connection failed' },
      { status: 500 }
    );
  }
}