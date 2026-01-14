import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const workers = await db.collection('workers')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: workers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['worker_name', 'role', 'joining_date'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await connectToDatabase();

    const worker = {
      worker_name: data.worker_name,
      mobile_no: data.mobile_no || null,
      role: data.role,
      joining_date: data.joining_date,
      created_at: new Date()
    };

    const result = await db.collection('workers').insertOne(worker);

    return NextResponse.json({
      success: true,
      message: 'Worker added successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error adding worker:', error);
    return NextResponse.json(
      { error: 'Failed to add worker' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const updateFields: any = {};
    if (data.worker_name) updateFields.worker_name = data.worker_name;
    if (data.mobile_no !== undefined) updateFields.mobile_no = data.mobile_no;
    if (data.role) updateFields.role = data.role;
    if (data.joining_date) updateFields.joining_date = data.joining_date;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db.collection('workers').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Worker updated successfully'
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json(
      { error: 'Failed to update worker' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection('workers').deleteOne({ _id: new ObjectId(data.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json(
      { error: 'Failed to delete worker' },
      { status: 500 }
    );
  }
}