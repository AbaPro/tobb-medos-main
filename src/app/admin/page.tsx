'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Certificate, 
  CertificatesApiResponse, 
  CertificateApiResponse,
  ExtendedSession 
} from '@/types';
import CertificateEditor from '@/components/admin/CertificateEditor';
import CertificatesTable from '@/components/admin/CertificatesTable';

export default function AdminPage() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  // Fetch certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  // Fetch all certificates from API
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certificates');
      const data: CertificatesApiResponse = await response.json();
      setCertificates(data.certificates || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to fetch certificates');
      setLoading(false);
    }
  };

  // Create a new certificate
  const createCertificate = async () => {
    // Default template for a new certificate
    const newCertTemplate: Certificate = {
      guid: crypto.randomUUID(), // Make sure this is present
      info: {
        certificateNumber: `V${Date.now().toString().substring(6)}`,
        exporterName: "Company Name",
        exporterAddress: "Company Address",
        consigneeName: "Consignee Name",
        consigneeAddress: "Consignee Address",
        consigneeCountry: "Country",
        transportDetails: "BY TRUCK",
        countryOfOrigin: "Türkiye",
        placeAndDateOfIssue: `KOCAELI CHAMBER OF INDUSTRY / ${new Date().toLocaleDateString()}`
      },
      products: [
        {
          description: "New Product",
          quantity: "0.00",
          unit: "KGS"
        }
      ],
      invoice: {
        totalPackages: "1",
        totalWeight: "0.00",
        invoiceNumber: `INV${Date.now().toString().substring(6)}`,
        invoiceDate: new Date().toLocaleDateString()
      }
    };
    
    try {
      setLoading(true);
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCertTemplate)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create certificate');
      }
      
      const data: CertificateApiResponse = await response.json();
      fetchCertificates();
      
      // Select the new certificate
      fetchCertificate(data?.certificate?._id || '');
      setLoading(false);
    } catch (err) {
      console.error('Error creating certificate:', err);
      setError('Failed to create certificate');
      setLoading(false);
    }
  };

  // Fetch a single certificate by ID
  const fetchCertificate = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/certificates/${id}`);
      const data: CertificateApiResponse = await response.json();
      setSelectedCertificate(data.certificate);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching certificate details:', err);
      setError('Failed to fetch certificate details');
      setLoading(false);
    }
  };

  // Delete a certificate
  const deleteCertificate = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/certificates/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete certificate');
      }
      
      // Reset selected certificate if it was deleted
      if (selectedCertificate && selectedCertificate._id === id) {
        setSelectedCertificate(null);
      }
      
      fetchCertificates();
      setLoading(false);
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError('Failed to delete certificate');
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Certificate Administration</h1>
          <div className="flex items-center gap-4">
            {session?.user?.name && (
              <span className="text-gray-600">
                Logged in as: {session.user.name}
              </span>
            )}
            <button
              onClick={createCertificate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              Create New Certificate
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
            <button 
              className="ml-2 font-bold" 
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certificate Table Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Certificates</h2>
            <CertificatesTable 
              certificates={certificates}
              onCertificateSelect={setSelectedCertificate}
              onCertificateDelete={deleteCertificate}
              loading={loading}
            />
          </div>

          {/* Certificate Editor Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Certificate Editor</h2>
            {selectedCertificate ? (
              <CertificateEditor
                certificate={selectedCertificate}
                onCertificateUpdated={fetchCertificates}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">Select a certificate from the list or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
