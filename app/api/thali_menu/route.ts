import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await connectToDatabase();
    const menu = await db.collection('thali_menu')
      .find({ menu_date: date })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error('Error fetching thali menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thali menu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.menu_date || !data.thali_items) {
      return NextResponse.json(
        { error: 'Missing required fields: menu_date and thali_items' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Check if menu already exists for this date
    const existing = await db.collection('thali_menu').findOne({
      menu_date: data.menu_date
    });

    const menuData = {
      menu_date: data.menu_date,
      thali_items: data.thali_items,
      created_at: new Date()
    };

    if (existing) {
      // Update existing
      await db.collection('thali_menu').updateOne(
        { _id: existing._id },
        { $set: menuData }
      );
      return NextResponse.json({
        success: true,
        message: 'Thali menu updated successfully'
      });
    } else {
      // Insert new
      await db.collection('thali_menu').insertOne(menuData);
      return NextResponse.json({
        success: true,
        message: 'Thali menu added successfully'
      });
    }
  } catch (error) {
    console.error('Error saving thali menu:', error);
    return NextResponse.json(
      { error: 'Failed to save thali menu' },
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
    const result = await db.collection('thali_menu').deleteOne({ _id: new ObjectId(data.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Thali menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thali menu deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting thali menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete thali menu' },
      { status: 500 }
    );
  }
}