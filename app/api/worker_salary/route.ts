import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await connectToDatabase();
    const salaries = await db.collection('Worker_Salary_Management')
      .find({ salary_date: date })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: salaries });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch salaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Check if it's an array for bulk insert
    if (Array.isArray(data)) {
      // Validate each record
      for (const record of data) {
        const required = ['month_year', 'worker_name', 'monthly_salary', 'final_salary'];
        for (const field of required) {
          if (record[field] === undefined || record[field] === null || record[field] === '') {
            return NextResponse.json(
              { error: `Missing or empty required field: ${field} in salary record` },
              { status: 400 }
            );
          }
        }
        if (isNaN(parseFloat(record.monthly_salary)) || isNaN(parseFloat(record.final_salary))) {
          return NextResponse.json(
            { error: 'Invalid number for salary fields' },
            { status: 400 }
          );
        }
      }

      const db = await connectToDatabase();

      // Prepare documents
      const documents = data.map(record => ({
        month_year: record.month_year,
        worker_name: record.worker_name,
        monthly_salary: parseFloat(record.monthly_salary),
        advance: parseFloat(record.advance || 0),
        bonus: parseFloat(record.bonus || 0),
        final_salary: parseFloat(record.final_salary),
        created_at: new Date()
      }));

      const result = await db.collection('Worker_Salary_Management').insertMany(documents);

      return NextResponse.json({
        success: true,
        message: `Salary records saved successfully for ${result.insertedCount} workers`,
        insertedCount: result.insertedCount
      });
    } else {
      // Single record insert
      const required = ['month_year', 'worker_name', 'monthly_salary', 'final_salary'];
      for (const field of required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
          return NextResponse.json(
            { error: `Missing or empty required field: ${field}` },
            { status: 400 }
          );
        }
      }
      if (isNaN(parseFloat(data.monthly_salary)) || isNaN(parseFloat(data.final_salary))) {
        return NextResponse.json(
          { error: 'Invalid number for salary fields' },
          { status: 400 }
        );
      }

      const db = await connectToDatabase();

      const salary = {
        month_year: data.month_year,
        worker_name: data.worker_name,
        monthly_salary: parseFloat(data.monthly_salary),
        advance: parseFloat(data.advance || 0),
        bonus: parseFloat(data.bonus || 0),
        final_salary: parseFloat(data.final_salary),
        created_at: new Date()
      };

      const result = await db.collection('Worker_Salary_Management').insertOne(salary);

      return NextResponse.json({
        success: true,
        message: 'Salary record added successfully',
        id: result.insertedId
      });
    }
  } catch (error) {
    console.error('Error saving salary records:', error);
    return NextResponse.json(
      { error: 'Failed to save salary records' },
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
    if (data.monthly_salary) updateFields.monthly_salary = parseFloat(data.monthly_salary);
    if (data.advance !== undefined) updateFields.advance = parseFloat(data.advance);
    if (data.bonus !== undefined) updateFields.bonus = parseFloat(data.bonus);
    if (data.final_salary) updateFields.final_salary = parseFloat(data.final_salary);

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db.collection('worker_salary').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Salary record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Salary record updated successfully'
    });
  } catch (error) {
    console.error('Error updating salary record:', error);
    return NextResponse.json(
      { error: 'Failed to update salary record' },
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
    const result = await db.collection('worker_salary').deleteOne({ _id: new ObjectId(data.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Salary record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Salary record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting salary record:', error);
    return NextResponse.json(
      { error: 'Failed to delete salary record' },
      { status: 500 }
    );
  }
}