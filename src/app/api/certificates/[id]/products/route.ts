/* eslint-disable  @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';

// Add a product to a certificate
export async function POST(request: NextRequest, { params }: any) {
  try {
    const param = await params;
    const { id } = param;
    const productData = await request.json();

    await connectToDatabase();

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Add the new product
    certificate.products.push(productData);
    await certificate.save();

    return NextResponse.json(
      { certificate },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to add product:', error);
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    );
  }
}
