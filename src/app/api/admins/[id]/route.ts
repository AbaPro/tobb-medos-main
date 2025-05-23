/* eslint-disable  @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Admin from '@/models/Admin';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get admin by ID
export async function GET(request: NextRequest, { params }: any) {
  try {
    // Extract and await the id parameter
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super-admin role or is requesting their own data
    if (session.user.role !== 'super-admin' && session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const admin = await Admin.findById(id).select('-password');

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (error) {
    console.error('Failed to get admin:', error);
    return NextResponse.json(
      { error: 'Failed to get admin' },
      { status: 500 }
    );
  }
}

// Update admin
export async function PUT(request: NextRequest, { params }: any) {
  try {
    // Extract and await the id parameter
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super-admin role or is updating their own data
    const isSuperAdmin = session.user.role === 'super-admin';
    const isOwnAccount = session.user.id === id;

    if (!isSuperAdmin && !isOwnAccount) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    await connectToDatabase();

    // Get current admin data
    const admin = await Admin.findById(id);

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Prevent non-super-admin from changing roles
    if (!isSuperAdmin && body.role && body.role !== admin.role) {
      return NextResponse.json(
        { error: 'You are not authorized to change roles' },
        { status: 403 }
      );
    }

    // If updating password
    if (body.password) {
      admin.password = body.password;
    }

    // Update other fields
    if (body.name) admin.name = body.name;
    if (body.email) admin.email = body.email;
    if (isSuperAdmin && body.role) admin.role = body.role;
    if (isSuperAdmin && body.isActive !== undefined) admin.isActive = body.isActive;

    await admin.save();

    // Return admin without password
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return NextResponse.json({ admin: adminResponse }, { status: 200 });
  } catch (error) {
    console.error('Failed to update admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    );
  }
}

// Delete admin (only super-admin can do this)
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    // Extract and await the id parameter
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super-admin can delete users
    if (session.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden. Only super-admin can delete users' }, { status: 403 });
    }

    await connectToDatabase();

    // Don't allow deleting the last super-admin
    const superAdminCount = await Admin.countDocuments({ role: 'super-admin' });
    const adminToDelete = await Admin.findById(id);

    if (adminToDelete?.role === 'super-admin' && superAdminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last super-admin' },
        { status: 400 }
      );
    }

    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Admin deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}
