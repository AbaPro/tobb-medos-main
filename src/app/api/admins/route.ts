import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Admin from '@/models/Admin';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get all admin users (only for super-admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has super-admin role
    if (session.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden. Only super-admin can access this resource' }, { status: 403 });
    }
    
    await connectToDatabase();
    const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });
    
    return NextResponse.json({ admins }, { status: 200 });
  } catch (error) {
    console.error('Failed to get admins:', error);
    return NextResponse.json(
      { error: 'Failed to get admins' },
      { status: 500 }
    );
  }
}

// Create a new admin user (only for super-admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has super-admin role
    if (session.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden. Only super-admin can create admin users' }, { status: 403 });
    }
    
    const body = await request.json();
    const { name, email, password, role = 'admin' } = body;
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new admin
    const admin = new Admin({ name, email, password, role, isActive: true });
    await admin.save();
    
    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    
    return NextResponse.json({ admin: adminResponse }, { status: 201 });
  } catch (error) {
    console.error('Failed to create admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
