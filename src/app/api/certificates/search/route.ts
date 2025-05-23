import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const certNumber = url.searchParams.get('certNumber');
    
    if (!certNumber) {
      return NextResponse.json(
        { error: 'Certificate number is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const certificate = await Certificate.findOne({
      'info.certificateNumber': certNumber
    });
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error('Failed to search certificate:', error);
    return NextResponse.json(
      { error: 'Failed to search certificate' },
      { status: 500 }
    );
  }
}
