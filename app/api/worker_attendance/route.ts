import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const attendanceData = await request.json();

    // Validate that it's an array
    if (!Array.isArray(attendanceData)) {
      return NextResponse.json(
        { error: 'Attendance data must be an array' },
        { status: 400 }
      );
    }

    // Validate each record
    for (const record of attendanceData) {
      const required = ['attendance_date', 'worker_name', 'role', 'status'];
      for (const field of required) {
        if (!record[field]) {
          return NextResponse.json(
            { error: `Missing required field: ${field} in attendance record` },
            { status: 400 }
          );
        }
      }
      // Validate status
      const validStatuses = ['Present', 'Absent', 'Half Day', 'Leave'];
      if (!validStatuses.includes(record.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${record.status}. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const db = await connectToDatabase();

    // Prepare documents
    const documents = attendanceData.map(record => ({
      attendance_date: record.attendance_date,
      worker_name: record.worker_name,
      role: record.role,
      status: record.status,
      notes: record.notes || '',
      created_at: new Date()
    }));

    const result = await db.collection('worker_attendance').insertMany(documents);

    return NextResponse.json({
      success: true,
      message: `Attendance saved successfully for ${result.insertedCount} workers`,
      insertedCount: result.insertedCount
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}