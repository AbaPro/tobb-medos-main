'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'CredentialsSignin': 'Invalid email or password. Please try again.',
    'SessionRequired': 'You need to be signed in to access this page.',
    'Default': 'An authentication error occurred. Please try again.'
  };
  
  const errorMessage = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
        <p className="mb-6 text-gray-700">{errorMessage}</p>
        
        <div className="flex justify-center space-x-4">
          <Link href="/auth/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Back to Login
          </Link>
          
          <Link href="/" 
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
