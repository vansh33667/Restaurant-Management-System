import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const bookings = await db.collection('banquet_management')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching banquet bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banquet bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['customer_name', 'phone_number', 'event_type', 'event_date', 'start_time', 'end_time', 'expected_guests', 'menu_package'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await connectToDatabase();

    const booking = {
      event_date: data.event_date,
      customer_name: data.customer_name,
      phone_number: parseInt(data.phone_number),
      alternate_phone: data.alternate_phone ? parseInt(data.alternate_phone) : null,
      address: data.address || null,
      event_type: data.event_type,
      start_time: data.start_time,
      end_time: data.end_time,
      expected_guests: parseInt(data.expected_guests),
      amenities_required: data.amenities_required || [],
      food_type: data.food_type || null,
      menu_package: data.menu_package,
      price_per_plate: data.price_per_plate ? parseInt(data.price_per_plate) : null,
      number_of_plates: data.number_of_plates ? parseInt(data.number_of_plates) : null,
      special_instructions: data.special_instructions || null,
      payment_details: data.payment_details || null,
      advance_payment: data.advance_payment ? parseInt(data.advance_payment) : null,
      payment_mode: data.payment_mode || null,
      booking_status: data.booking_status || 'Tentative',
      created_at: new Date()
    };

    const result = await db.collection('banquet_management').insertOne(booking);

    return NextResponse.json({
      success: true,
      message: 'Banquet booking added successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error adding banquet booking:', error);
    return NextResponse.json(
      { error: 'Failed to add banquet booking' },
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
    if (data.event_date) updateFields.event_date = data.event_date;
    if (data.customer_name) updateFields.customer_name = data.customer_name;
    if (data.phone_number) updateFields.phone_number = parseInt(data.phone_number);
    if (data.alternate_phone !== undefined) updateFields.alternate_phone = data.alternate_phone ? parseInt(data.alternate_phone) : null;
    if (data.address !== undefined) updateFields.address = data.address;
    if (data.event_type) updateFields.event_type = data.event_type;
    if (data.start_time) updateFields.start_time = data.start_time;
    if (data.end_time) updateFields.end_time = data.end_time;
    if (data.expected_guests) updateFields.expected_guests = parseInt(data.expected_guests);
    if (data.amenities_required !== undefined) updateFields.amenities_required = data.amenities_required;
    if (data.food_type !== undefined) updateFields.food_type = data.food_type;
    if (data.menu_package) updateFields.menu_package = data.menu_package;
    if (data.price_per_plate !== undefined) updateFields.price_per_plate = data.price_per_plate ? parseInt(data.price_per_plate) : null;
    if (data.number_of_plates !== undefined) updateFields.number_of_plates = data.number_of_plates ? parseInt(data.number_of_plates) : null;
    if (data.special_instructions !== undefined) updateFields.special_instructions = data.special_instructions;
    if (data.payment_details !== undefined) updateFields.payment_details = data.payment_details;
    if (data.advance_payment !== undefined) updateFields.advance_payment = data.advance_payment ? parseInt(data.advance_payment) : null;
    if (data.payment_mode !== undefined) updateFields.payment_mode = data.payment_mode;
    if (data.booking_status !== undefined) updateFields.booking_status = data.booking_status;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db.collection('banquet_management').updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Banquet booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banquet booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating banquet booking:', error);
    return NextResponse.json(
      { error: 'Failed to update banquet booking' },
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
    const result = await db.collection('banquet_management').deleteOne({ _id: new ObjectId(data.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Banquet booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banquet booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banquet booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete banquet booking' },
      { status: 500 }
    );
  }
}