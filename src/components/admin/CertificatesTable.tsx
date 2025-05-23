import { useState } from 'react';
import { Clipboard, Search, Trash } from 'lucide-react';
import { Certificate } from '@/types';

type CertificatesTableProps = {
  certificates: Certificate[];
  onCertificateSelect: (certificate: Certificate) => void;
  onCertificateDelete: (id: string) => void;
  loading: boolean;
};

export default function CertificatesTable({ 
  certificates, 
  onCertificateSelect, 
  onCertificateDelete, 
  loading 
}: CertificatesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('certificateNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Copy verification URL to clipboard
  const copyVerificationUrl = (guid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tr/valid.php?Guid=${guid}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopiedId(guid);
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
  };

  // Handle deletion
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this certificate?')) {
      onCertificateDelete(id);
    }
  };

  // Handle search
  const filteredCertificates = certificates.filter(cert => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cert.info.certificateNumber.toLowerCase().includes(searchLower) ||
      cert.info.exporterName.toLowerCase().includes(searchLower) ||
      cert.info.consigneeName.toLowerCase().includes(searchLower) ||
      cert.invoice.invoiceNumber.toLowerCase().includes(searchLower)
    );
  });

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    let aValue, bValue;
    
    if (sortField === 'certificateNumber') {
      aValue = a.info.certificateNumber;
      bValue = b.info.certificateNumber;
    } else if (sortField === 'exporterName') {
      aValue = a.info.exporterName;
      bValue = b.info.exporterName;
    } else if (sortField === 'date') {
      // Sort by date assuming createdAt is available
      aValue = a.createdAt || '';
      bValue = b.createdAt || '';
    } else {
      aValue = a.info.certificateNumber;
      bValue = b.info.certificateNumber;
    }
    
    const comparison = aValue.localeCompare(bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Render table header with sort functionality
  const renderSortableHeader = (label: string, field: string) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        {sortField === field && (
          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  return (
    <div>
      {/* Search */}
      <div className="mb-4 flex">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search certificates..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Certificates table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderSortableHeader('Certificate Number', 'certificateNumber')}
                {renderSortableHeader('Exporter Name', 'exporterName')}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignee</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                    Loading certificates...
                  </td>
                </tr>
              ) : sortedCertificates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                    {searchTerm 
                      ? "No certificates match your search criteria" 
                      : "No certificates found"}
                  </td>
                </tr>
              ) : (
                sortedCertificates.map(cert => (
                  <tr 
                    key={cert._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onCertificateSelect(cert)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cert.info.certificateNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{cert.info.exporterName}</div>
                      <div className="text-xs text-gray-500">{cert.invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{cert.info.consigneeName}</div>
                      <div className="text-xs text-gray-500">{cert.info.consigneeCountry}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={(e) => copyVerificationUrl(cert.guid || '', e)}
                          className={`${copiedId === cert.guid ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                          title="Copy verification link"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(cert._id || '', e)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete certificate"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-gray-500 text-xs">
          Showing {filteredCertificates.length} of {certificates.length} certificates
        </div>
      </div>
    </div>
  );
}
