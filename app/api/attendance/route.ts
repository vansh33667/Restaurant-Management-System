import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await connectToDatabase();
    const attendance = await db.collection('worker_attendance')
      .find({ attendance_date: date })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['attendance_date', 'worker_name', 'role', 'status'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await connectToDatabase();

    // Check if attendance already exists
    const existing = await db.collection('worker_attendance').findOne({
      attendance_date: data.attendance_date,
      worker_name: data.worker_name
    });

    const attendanceData = {
      attendance_date: data.attendance_date,
      worker_name: data.worker_name,
      role: data.role,
      status: data.status,
      notes: data.notes || null,
      created_at: new Date()
    };

    if (existing) {
      // Update existing
      await db.collection('worker_attendance').updateOne(
        { _id: existing._id },
        { $set: attendanceData }
      );
      return NextResponse.json({
        success: true,
        message: 'Attendance updated successfully'
      });
    } else {
      // Insert new
      await db.collection('worker_attendance').insertOne(attendanceData);
      return NextResponse.json({
        success: true,
        message: 'Attendance marked successfully'
      });
    }
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
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
    const result = await db.collection('worker_attendance').deleteOne({ _id: new ObjectId(data.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json(
      { error: 'Failed to delete attendance' },
      { status: 500 }
    );
  }
}