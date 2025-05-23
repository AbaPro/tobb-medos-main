/* eslint-disable  @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';
import mongoose, { Document } from 'mongoose';

// Update a product within a certificate
export async function PUT(request: NextRequest, { params }: any) {
  try {
    const param = await params;
    const { id, productId } = param;
    const productData = await request.json();

    await connectToDatabase();

    const certificate = await Certificate.findById(id) as Document & {
      products: Array<{
        _id: { toString(): string };
        [key: string]: any;
      }>
    };
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Find and update the product
    const productIndex = certificate.products.findIndex(
      product => product._id.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product data
    Object.assign(certificate.products[productIndex], productData);
    await certificate.save();

    return NextResponse.json(
      { certificate },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// Delete a product from a certificate
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const param = await params;
    const { id, productId } = param;

    await connectToDatabase();

    const certificate = await Certificate.findById(id) as Document & {
      products: Array<{
        _id: mongoose.Types.ObjectId | string;
        [key: string]: any;
      }>
    };

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Find and remove the product
    certificate.products = certificate.products.filter(
      product => product._id.toString() !== productId
    );

    await certificate.save();

    return NextResponse.json(
      { message: 'Product deleted successfully', certificate },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
