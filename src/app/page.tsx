'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [certificateId, setCertificateId] = useState('');
  
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateId.trim()) {
      router.push(`/tr/valid.php?Guid=${certificateId.trim()}`);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Image
        src="/logo.png" 
        alt="TOBB MEDOS Logo" 
        width={150} 
        height={150} 
        className="mb-6"
      />

      {/* Certificate Verification Form */}
      <div className="w-full max-w-md mb-8">
        <form onSubmit={handleVerify} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Certificate ID
            </label>
            <input
              type="text"
              id="certificateId"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter certificate ID or number"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Verify Certificate
          </button>
        </form>
      </div>

      <div className="flex gap-4">
        {session ? (
          <Link 
            href="/admin" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Admin Panel
          </Link>
        ) : (
          <Link 
            href="/auth/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Login
          </Link>
        )}
      </div>
      
      {session && (
        <div className="mt-4 text-sm text-gray-600">
          Logged in as {session.user?.name || session.user?.email}
        </div>
      )}
    </div>
  );
}
