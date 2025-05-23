import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';

export async function GET() {
  try {
    await connectToDatabase();
    const certificates = await Certificate.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ certificates }, { status: 200 });
  } catch (error) {
    console.error('Failed to get certificates:', error);
    return NextResponse.json(
      { error: 'Failed to get certificates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await connectToDatabase();
    
    // Create new certificate
    const certificate = new Certificate(body);
    await certificate.save();
    
    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    console.error('Failed to create certificate:', error);
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    );
  }
}
