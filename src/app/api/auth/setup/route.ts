import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { SETUP_SECRET } = process.env;
    
    if (!SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Setup secret not configured' },
        { status: 500 }
      );
    }

    const { secret, username, password } = await request.json();

    if (secret !== SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if admin user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await User.create({
      name: 'Administrator',
      username,
      password: hashedPassword,
      role: 'admin',
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 