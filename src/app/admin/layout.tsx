'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const isSuperAdmin = session?.user?.role === 'super-admin';
  
  const navigation = [
    { name: 'Certificates', href: '/admin' },
    ...(isSuperAdmin ? [{ name: 'Admin Users', href: '/admin/users' }] : []),
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">
                  TOBB MEDOS
                </Link>
              </div>
              
              <div className="ml-6 flex items-center space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              {session?.user && (
                <div className="text-sm text-gray-600 mr-4">
                  {session.user.name}
                  {isSuperAdmin && (
                    <span className="ml-1 text-xs bg-purple-100 text-purple-800 py-0.5 px-1.5 rounded">
                      Super Admin
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-6">{children}</main>
    </div>
  );
}
