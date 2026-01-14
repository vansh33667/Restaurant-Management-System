import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.username || !data.password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    // Check security lock
    const security = await db.collection('login_security').findOne({ username: data.username });
    if (security && security.lock_until && new Date() < new Date(security.lock_until)) {
      const remainingMs = new Date(security.lock_until).getTime() - now.getTime();
      const remainingMin = Math.ceil(remainingMs / (1000 * 60));

      // Log failed attempt
      await db.collection('login_logs').insertOne({
        username: data.username,
        date,
        time,
        status: "NO",
        attempted_password: data.password,
        created_at: now
      });

      return NextResponse.json(
        { error: `Account locked. Try again in ${remainingMin} minutes`, locked: true, remainingMinutes: remainingMin, lock_until: security.lock_until },
        { status: 429 }
      );
    }

    const user = await db.collection('users').findOne({
      username: data.username,
      password: data.password // In production, use hashed passwords
    });

    // Hardcoded check for known users
    let authenticatedUser = null;
    if (data.username === "admin" && data.password === "2026") {
      authenticatedUser = { username: "admin", role: "admin" };
    } else if (data.username === "casher123" && data.password === "2026") {
      authenticatedUser = { username: "casher123", role: "cashier" };
    } else if (user) {
      authenticatedUser = user;
    }

    if (authenticatedUser) {
      // Reset security
      await db.collection('login_security').updateOne(
        { username: data.username },
        { $set: { failed_attempts: 0, lock_until: null } },
        { upsert: true }
      );

      // Log successful login
      await db.collection('login_logs').insertOne({
        username: data.username,
        date,
        time,
        status: "YES",
        attempted_password: null,
        created_at: now
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = authenticatedUser;
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
      });
    } else {
      // Wrong password
      let failed_attempts = (security?.failed_attempts || 0) + 1;
      let lock_until = null;

      if (failed_attempts >= 3) {
        let lockMinutes;
        if (failed_attempts === 3) {
          lockMinutes = 5;
        } else if (failed_attempts === 6) {
          lockMinutes = 10;
        } else {
          // For 7+: start from 10 and multiply by 3 for each additional
          lockMinutes = 10;
          for (let i = 7; i <= failed_attempts; i++) {
            lockMinutes *= 3;
          }
        }
        lock_until = new Date(now.getTime() + lockMinutes * 60 * 1000);
      }

      await db.collection('login_security').updateOne(
        { username: data.username },
        { $set: { failed_attempts, lock_until } },
        { upsert: true }
      );

      // Log failed attempt
      await db.collection('login_logs').insertOne({
        username: data.username,
        date,
        time,
        status: "NO",
        attempted_password: data.password,
        created_at: now
      });

      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}