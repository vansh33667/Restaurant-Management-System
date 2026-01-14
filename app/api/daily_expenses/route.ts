import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await connectToDatabase();
    const expenses = await db.collection('daily_expenses')
      .find({ expense_date: date })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['expense_date', 'title', 'amount', 'payment_mode'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await connectToDatabase();

    const expense = {
      expense_date: data.expense_date,
      title: data.title,
      amount: parseFloat(data.amount),
      payment_mode: data.payment_mode,
      notes: data.notes || null,
      created_at: new Date()
    };

    const result = await db.collection('daily_expenses').insertOne(expense);

    return NextResponse.json({
      success: true,
      message: 'Expense added successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { error: 'Failed to add expense' },
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
    if (data.title) updateFields.title = data.title;
    if (data.amount) updateFields.amount = parseFloat(data.amount);
    if (data.payment_mode) updateFields.payment_mode = data.payment_mode;
    if (data.notes !== undefined) updateFields.notes = data.notes;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db.collection('daily_expenses').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
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
    const result = await db.collection('daily_expenses').deleteOne({ _id: new ObjectId(data.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}