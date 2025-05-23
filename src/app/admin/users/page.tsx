/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  AdminUser, 
  AdminFormData, 
  AdminUpdatePayload,
  AdminsApiResponse,
  AdminApiResponse,
  ExtendedSession
} from '@/types';

export default function AdminUsersPage() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const router = useRouter();
  
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    isActive: true
  });
  
  // Check if user is super-admin
  const isSuperAdmin = session?.user?.role === 'super-admin';
  
  // Redirect if not super-admin
  useEffect(() => {
    if (session && !isSuperAdmin) {
      router.push('/admin');
    }
  }, [session, isSuperAdmin, router]);
  
  // Fetch admins on component mount
  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);
  
  // Fetch all admin users
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admins');
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin users');
      }
      
      const data: AdminsApiResponse = await response.json();
      setAdmins(data.admins || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError('Failed to fetch admin users');
      setLoading(false);
    }
  };
  
  // Fetch a specific admin user
  const fetchAdmin = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admins/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin user');
      }
      
      const data: AdminApiResponse = await response.json();
      setSelectedAdmin(data.admin);
      setFormData({
        name: data.admin.name,
        email: data.admin.email,
        password: '', // Don't include password in edit form initially
        role: data.admin.role,
        isActive: data.admin.isActive
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin user:', err);
      setError('Failed to fetch admin user');
      setLoading(false);
    }
  };
  
  // Create a new admin user
  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin user');
      }
      
      // Reset form and refresh admin list
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        isActive: true
      });
      setIsCreating(false);
      fetchAdmins();
      setLoading(false);
    } catch (err: any) {
      console.error('Error creating admin user:', err);
      setError(err.message || 'Failed to create admin user');
      setLoading(false);
    }
  };
  
  // Update an admin user
  const updateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin || !formData.name || !formData.email) {
      setError('Please fill all required fields');
      return;
    }
    
    // Prepare update payload (only include password if it was changed)
    const updatePayload: AdminUpdatePayload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isActive: formData.isActive
    };
    
    if (formData.password) {
      updatePayload.password = formData.password;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admins/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update admin user');
      }
      
      const data: AdminApiResponse = await response.json();
      
      // Update local state
      setSelectedAdmin(data.admin);
      setFormData({
        ...formData,
        password: '' // Clear password field after update
      });
      setIsEditing(false);
      fetchAdmins(); // Refresh the list
      setLoading(false);
    } catch (err: any) {
      console.error('Error updating admin user:', err);
      setError(err.message || 'Failed to update admin user');
      setLoading(false);
    }
  };
  
  // Delete an admin user
  const deleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admins/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete admin user');
      }
      
      // Reset selected admin if we just deleted it
      if (selectedAdmin && selectedAdmin._id === id) {
        setSelectedAdmin(null);
        setIsEditing(false);
      }
      
      fetchAdmins(); // Refresh the list
      setLoading(false);
    } catch (err: any) {
      console.error('Error deleting admin user:', err);
      setError(err.message || 'Failed to delete admin user');
      setLoading(false);
    }
  };
  
  // Toggle user active status
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      // Refresh data
      fetchAdmins();
      if (selectedAdmin && selectedAdmin._id === id) {
        fetchAdmin(id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Failed to update user status');
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // If not super-admin, don't render the component
  if (session && !isSuperAdmin) {
    return <div className="p-8 text-center">You don&apos;t have permission to access this page.</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Users Management</h1>
          {isSuperAdmin && !isCreating && (
            <button
              onClick={() => {
                setIsCreating(true);
                setSelectedAdmin(null);
                setIsEditing(false);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  role: 'admin',
                  isActive: true
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              Add New Admin
            </button>
          )}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admin users list */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Admin Users</h2>
            
            {loading && !admins.length ? (
              <p className="text-gray-500">Loading admin users...</p>
            ) : (
              <ul className="space-y-2">
                {admins.length ? (
                  admins.map((admin) => (
                    <li 
                      key={admin._id}
                      className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                        selectedAdmin?._id === admin._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                      } ${!admin.isActive ? 'opacity-60' : ''}`}
                      onClick={() => {
                        setIsCreating(false);
                        fetchAdmin(admin._id);
                        setIsEditing(false);
                      }}
                    >
                      <div>
                        <span className="block font-medium">{admin.name}</span>
                        <span className="text-sm text-gray-500">{admin.email}</span>
                        {admin.role === 'super-admin' && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 py-0.5 px-1.5 rounded">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActiveStatus(admin._id, admin.isActive);
                          }}
                          className={`mr-2 text-xs px-2 py-1 rounded ${
                            admin.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          title={admin.isActive ? 'Deactivate User' : 'Activate User'}
                          disabled={loading}
                        >
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAdmin(admin._id);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Admin"
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No admin users found</p>
                )}
              </ul>
            )}
          </div>
          
          {/* Create/Edit Forms */}
          <div className="md:col-span-2">
            {isCreating ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Create New Admin User</h2>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                
                <form onSubmit={createAdmin}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="admin">Admin</option>
                        <option value="super-admin">Super Admin</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            isActive: e.target.checked
                          });
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Admin User'}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedAdmin ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {isEditing ? 'Edit Admin User' : 'Admin User Details'}
                  </h2>
                  <div>
                    {isEditing ? (
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={loading}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                
                {isEditing ? (
                  <form onSubmit={updateAdmin}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password (leave blank to keep current)
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      
                      {isSuperAdmin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            disabled={selectedAdmin._id === session?.user?.id} // Can't change own role
                          >
                            <option value="admin">Admin</option>
                            <option value="super-admin">Super Admin</option>
                          </select>
                          {selectedAdmin._id === session?.user?.id && (
                            <p className="text-xs text-gray-500 mt-1">You cannot change your own role</p>
                          )}
                        </div>
                      )}
                      
                      {isSuperAdmin && (
                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                isActive: e.target.checked
                              });
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            disabled={selectedAdmin._id === session?.user?.id} // Can't deactivate yourself
                          />
                          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Active
                          </label>
                          {selectedAdmin._id === session?.user?.id && (
                            <p className="text-xs text-gray-500 ml-2">You cannot deactivate yourself</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p className="px-3 py-2 bg-gray-50 rounded">{selectedAdmin.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="px-3 py-2 bg-gray-50 rounded">{selectedAdmin.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <p className="px-3 py-2 bg-gray-50 rounded capitalize">
                        {selectedAdmin.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <p className="px-3 py-2 bg-gray-50 rounded">
                        {selectedAdmin.isActive ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created At
                      </label>
                      <p className="px-3 py-2 bg-gray-50 rounded">
                        {new Date(selectedAdmin.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <p className="px-3 py-2 bg-gray-50 rounded">
                        {new Date(selectedAdmin.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">
                  Select an admin user from the list or create a new one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
