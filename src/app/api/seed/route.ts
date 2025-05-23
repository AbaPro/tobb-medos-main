import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Certificate from '@/models/Certificate';
import Admin from '@/models/Admin';
import { Certificate as CertificateType } from '@/types';

const initialCertificate: CertificateType = {
  info: {
    certificateNumber: "V0528031",
    exporterName: "Teksan Jeneratör Elektrik San.ve Tic.A.Ş. Kocaeli Serbest Bölge Şubesi",
    exporterAddress: "Kocaeli Serbest Bölgesi Sepetli Pınar Serbest Bölge Mah. 107.Cd. Başiskele/ KOCAELI",
    consigneeName: "ALSOFY COMPANY FOR INTERNATIONAL TREADING",
    consigneeAddress: "SOFY MALL GULAN ST. Erbil",
    consigneeCountry: "Iraq",
    transportDetails: "BY TRUCK",
    countryOfOrigin: "Türkiye",
    placeAndDateOfIssue: "KOCAELI CHAMBER OF INDUSTRY / 21.Jan.2025"
  },
  products: [
    {
      description: "TJ720PE DGS4071; PERKINS US JGBF5151N09814H, LEROY SOMER FR 40590400002",
      quantity: "4,285.00",
      unit: "KGS"
    },
    {
      description: "TJ165BD DGS3837; BAUDOUIN CN 4824F001815, CG POWER IN XXFG7016",
      quantity: "2,250.00",
      unit: "KGS"
    },
    {
      description: "TJ33PE DGS3918; PERKINS UK DJ32003U614727J, LEROY SOMER CZ 45682000008",
      quantity: "1,360.00",
      unit: "KGS"
    },
    {
      description: "TJ33PE DGS3919; PERKINS UK DJ32003U615360J, LEROY SOMER CZ 45682000007",
      quantity: "1,360.00",
      unit: "KGS"
    },
    {
      description: "TJ33PE DGS3920; PERKINS UK DJ32003U614734J, LEROY SOMER CZ 45682000006",
      quantity: "1,360.00",
      unit: "KGS"
    },
    {
      description: "TJ33PE DGS3921; PERKINS UK DJ32003U614734J, LEROY SOMER CZ 45682000005",
      quantity: "1,360.00",
      unit: "KGS"
    }
  ],
  invoice: {
    totalPackages: "6",
    totalWeight: "11.975",
    invoiceNumber: "TH02024000000578",
    invoiceDate: "30.10.2024"
  }
};

export async function GET() {
  try {
    // Only allow this in development mode unless forced
    if (process.env.NODE_ENV !== 'development' && process.env.FORCE_SEED !== 'true') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    // Check if any certificate exists with this number
    const existingCertificate = await Certificate.findOne({ 
      'info.certificateNumber': initialCertificate.info.certificateNumber 
    });
    
    if (existingCertificate) {
      return NextResponse.json(
        { message: 'Certificate already exists. Seed skipped.' },
        { status: 200 }
      );
    }
    
    // Create the certificate
    const certificate = new Certificate(initialCertificate);
    await certificate.save();
    
    // Additionally, ensure there's at least one admin user
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      // Create default super admin if none exists
      const superAdmin = new Admin({
        name: 'AbaPro',
        email: 'abanoubraafat88@gmail.com',
        password: 'Aba1234',
        role: 'super-admin',
        isActive: true
      });
      
      await superAdmin.save();
    }
    
    return NextResponse.json(
      { 
        message: 'Database seeded successfully',
        certificate: {
          _id: certificate._id,
          certificateNumber: certificate.info.certificateNumber
        },
        adminCreated: adminCount === 0
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
