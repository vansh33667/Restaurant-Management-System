import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await connectToDatabase();
    const orders = await db.collection('orders')
      .find({ order_date: date })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['order_date', 'customer_name', 'num_of_persons', 'total_items', 'total_amount'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await connectToDatabase();

    // Generate order_id (8-digit)
    const counter = await db.collection('order_counters').findOneAndUpdate(
      { _id: 'order_id' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const orderId = counter!.seq.toString().padStart(8, '0');

    const order = {
      order_id: orderId,
      order_date: data.order_date,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone || null,
      table_number: data.table_number || null,
      num_of_persons: data.num_of_persons,
      total_items: data.total_items,
      total_amount: parseFloat(data.total_amount),
      created_at: new Date()
    };

    await db.collection('orders').insertOne(order);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order_id: orderId
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.order_id) {
      return NextResponse.json(
        { error: 'Missing order_id' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const updateFields: any = {};
    if (data.customer_name) updateFields.customer_name = data.customer_name;
    if (data.customer_phone !== undefined) updateFields.customer_phone = data.customer_phone;
    if (data.table_number !== undefined) updateFields.table_number = data.table_number;
    if (data.total_amount) updateFields.total_amount = parseFloat(data.total_amount);

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db.collection('orders').updateOne(
      { order_id: data.order_id },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.order_id) {
      return NextResponse.json(
        { error: 'Missing order_id' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection('orders').deleteOne({ order_id: data.order_id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}