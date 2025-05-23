/* eslint-disable  @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const certificate = await Certificate.findById(params.id);
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error('Failed to get certificate:', error);
    return NextResponse.json(
      { error: 'Failed to get certificate' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    await connectToDatabase();
    
    // Check if a different certificate already has this certificate number
    if (body.info && body.info.certificateNumber) {
      const existing = await Certificate.findOne({
        _id: { $ne: params.id },
        'info.certificateNumber': body.info.certificateNumber
      });
      
      if (existing) {
        return NextResponse.json(
          { error: 'Certificate number already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update certificate
    const certificate = await Certificate.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error('Failed to update certificate:', error);
    return NextResponse.json(
      { error: 'Failed to update certificate' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const certificate = await Certificate.findByIdAndDelete(params.id);
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Certificate deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete certificate:', error);
    return NextResponse.json(
      { error: 'Failed to delete certificate' },
      { status: 500 }
    );
  }
}
