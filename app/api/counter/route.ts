import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const counter = await db.collection('order_counters').findOne({ _id: 'order_id' });
    const seq = counter ? counter.seq : 0;
    return NextResponse.json({ success: true, seq });
  } catch (error) {
    console.error('Error fetching counter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch counter' },
      { status: 500 }
    );
  }
}