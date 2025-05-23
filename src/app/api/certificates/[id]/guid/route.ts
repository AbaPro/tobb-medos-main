import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Find the certificate and update its GUID
    const certificate = await Certificate.findById(params.id);
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    // Generate a new GUID
    certificate.guid = crypto.randomUUID();
    await certificate.save();
    
    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error('Failed to update GUID:', error);
    return NextResponse.json(
      { error: 'Failed to update GUID' },
      { status: 500 }
    );
  }
}
