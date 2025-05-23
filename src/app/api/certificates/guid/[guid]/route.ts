/* eslint-disable  @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';

export async function GET(request: NextRequest, { params }: any) {
  const param = await params;
  try {
    await connectToDatabase();
    
    const certificate = await Certificate.findOne({ guid: param.guid });
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ certificate }, { status: 200 });
  } catch (error) {
    console.error('Failed to get certificate by GUID:', error);
    return NextResponse.json(
      { error: 'Failed to get certificate' },
      { status: 500 }
    );
  }
}
