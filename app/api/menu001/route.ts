import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const db = await connectToDatabase();
    let query = {};
    if (date) {
      query = { date: date };
    }

    const menuItems = await db.collection('menu001')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.date || !data.item_name) {
      return NextResponse.json(
        { error: 'Missing required fields: date and item_name' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const menuItem = {
      date: data.date,
      item_name: data.item_name,
      created_at: new Date()
    };

    const result = await db.collection('menu001').insertOne(menuItem);

    return NextResponse.json({
      success: true,
      message: 'Menu item added successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json(
      { error: 'Failed to add menu item' },
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
    const result = await db.collection('menu001').deleteOne({ _id: new ObjectId(data.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}