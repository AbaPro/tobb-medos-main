/* eslint-disable  @typescript-eslint/no-unused-vars */

import { useState } from 'react';
import { Clipboard, RefreshCw } from 'lucide-react';
import { Certificate, Product, CertificateApiResponse } from '@/types';

type CertificateEditorProps = {
  certificate: Certificate;
  onCertificateUpdated: () => void;
};

export default function CertificateEditor({ certificate, onCertificateUpdated }: CertificateEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState<Certificate>(certificate);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGuid, setCopiedGuid] = useState<boolean>(false);

  // Calculate the total weight from products
  const calculateTotalWeight = (products: Product[]): string => {
    if (!products || products.length === 0) return "0.000";
    
    let totalWeight = 0;
    products.forEach(product => {
      // Convert comma-separated numbers if needed
      const quantity = parseFloat(product.quantity.replace(',', '.'));
      if (!isNaN(quantity)) {
        totalWeight += quantity;
      }
    });
    
    return totalWeight.toFixed(3);
  };
  
  // Get the display weight (either from invoice or calculated)
  const getDisplayWeight = (): string => {
    const invoiceWeight = parseFloat(formData.invoice.totalWeight);
    if (isNaN(invoiceWeight) || invoiceWeight === 0) {
      return calculateTotalWeight(formData.products);
    }
    return formData.invoice.totalWeight;
  };

  // Handle input changes in the form
  const handleInputChange = (section: 'info' | 'invoice', field: string, value: string) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  // Handle direct property changes
  const handleDirectPropertyChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle product input changes
  const handleProductChange = (index: number, field: string, value: string) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    
    // If quantity changed, update the total weight
    if (field === 'quantity') {
      setFormData({
        ...formData,
        products: updatedProducts,
        invoice: {
          ...formData.invoice,
          totalWeight: calculateTotalWeight(updatedProducts)
        }
      });
    } else {
      setFormData({
        ...formData,
        products: updatedProducts
      });
    }
  };

  // Generate a new GUID
  const generateNewGuid = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/certificates/${certificate._id}/guid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate new GUID');
      }
      
      const data: CertificateApiResponse = await response.json();
      setFormData(data.certificate);
      setLoading(false);
      onCertificateUpdated();
    } catch (err) {
      console.error('Error generating GUID:', err);
      setError('Failed to generate new GUID');
      setLoading(false);
    }
  };

  // Update a certificate
  const updateCertificate = async () => {
    try {
      setLoading(true);
      
      // Create a new object without the _id field to send to the API
      const { _id, ...certificateDataWithoutId } = formData;
      
      // Also remove _id from products to avoid MongoDB errors
      const updatedProducts = formData.products.map(product => {
        const { _id: productId, ...productWithoutId } = product;
        return productWithoutId;
      });
      
      const dataToSend = {
        ...certificateDataWithoutId,
        products: updatedProducts
      };
      
      const response = await fetch(`/api/certificates/${certificate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update certificate');
      }
      
      const data: CertificateApiResponse = await response.json();
      setFormData(data.certificate);
      setIsEditing(false);
      setLoading(false);
      onCertificateUpdated();
    } catch (err) {
      console.error('Error updating certificate:', err);
      setError('Failed to update certificate');
      setLoading(false);
    }
  };

  // Add a product to the certificate
  const addProduct = async () => {
    const newProduct: Product = {
      description: "New Product",
      quantity: "0.00",
      unit: "KGS"
    };
    
    try {
      setLoading(true);
      const response = await fetch(`/api/certificates/${certificate._id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      
      const data: CertificateApiResponse = await response.json();
      setFormData(data.certificate);
      setLoading(false);
      onCertificateUpdated();
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product');
      setLoading(false);
    }
  };

  // Remove a product from the certificate
  const removeProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/certificates/${certificate._id}/products/${productId}`, 
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to remove product');
      }
      
      const data: CertificateApiResponse = await response.json();
      setFormData(data.certificate);
      setLoading(false);
      onCertificateUpdated();
    } catch (err) {
      console.error('Error removing product:', err);
      setError('Failed to remove product');
      setLoading(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: 'id' | 'guid' | 'link') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (type === 'id') {
          setCopiedId(certificate?._id || '');
          setTimeout(() => setCopiedId(null), 2000);
        } else if (type === 'guid') {
          setCopiedGuid(true);
          setTimeout(() => setCopiedGuid(false), 2000);
        } else if (type === 'link') {
          setCopiedId(certificate?._id || '');
          setTimeout(() => setCopiedId(null), 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  // Copy verification URL to clipboard
  const copyVerificationUrl = (guid: string) => {
    const url = `${window.location.origin}/tr/valid.php?Guid=${guid}`;
    copyToClipboard(url, 'link');
  };

  // Handle saving changes when in edit mode
  const handleSaveChanges = () => {
    updateCertificate();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Certificate: {certificate.info.certificateNumber}
        </h2>
        <div>
          {isEditing ? (
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
              disabled={loading}
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Edit Certificate
            </button>
          )}
        </div>
      </div>

      {/* Tabs for different sections */}
      <div className="mb-6">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('info')} 
            className={`px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Certificate Info
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`px-4 py-2 ${activeTab === 'products' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('invoice')} 
            className={`px-4 py-2 ${activeTab === 'invoice' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            Invoice Details
          </button>
        </div>
      </div>

      {/* Certificate Info Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display certificate ID as read-only */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate ID
            </label>
            <p className="px-3 py-2 bg-gray-100 rounded text-gray-500 font-mono text-sm border border-gray-200">
              {certificate._id}
            </p>
            <p className="text-xs text-gray-500 mt-1">System generated ID (cannot be changed)</p>
          </div>

          {/* GUID Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate GUID
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.guid || ''}
                onChange={(e) => handleDirectPropertyChange('guid', e.target.value)}
                readOnly={!isEditing}
                className={`flex-1 px-3 py-2 ${isEditing ? 'border-gray-300' : 'bg-gray-50 border-gray-200'} border rounded-l text-sm overflow-hidden`}
              />
              <button
                className={`px-3 py-2 border border-l-0 border-gray-200 rounded-r ${
                  copiedGuid 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => copyToClipboard(formData.guid || '', 'guid')}
                title="Copy GUID"
              >
                <Clipboard className="h-4 w-4" />
              </button>
              {isEditing && (
                <button
                  className="ml-2 px-3 py-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100"
                  onClick={generateNewGuid}
                  title="Generate new GUID"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {copiedGuid 
                ? 'GUID copied to clipboard!' 
                : 'Unique identifier for external references'}
            </p>
          </div>

          {/* Add verification link */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Link
            </label>
            <div className="flex items-center">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/tr/valid.php?Guid=${formData.guid || ''}`}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-l text-sm overflow-hidden text-ellipsis"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                className={`px-3 py-2 border border-l-0 border-gray-200 rounded-r ${
                  copiedId === certificate._id 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => copyVerificationUrl(formData.guid || '')}
                title="Copy verification link"
              >
                <Clipboard className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {copiedId === certificate._id 
                ? 'Link copied to clipboard!' 
                : 'Click to copy verification link'}
            </p>
          </div>

          {Object.keys(certificate.info).map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                {field === 'certificateNumber' && isEditing && (
                  <span className="text-xs font-normal text-amber-600 ml-2">
                    (Be careful when changing this value)
                  </span>
                )}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.info[field] || ''}
                  onChange={(e) => handleInputChange('info', field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded">{certificate.info[field]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          {isEditing && (
            <div className="mb-4">
              <button 
                onClick={addProduct}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={loading}
              >
                Add Product
              </button>
            </div>
          )}

          {formData.products.map((product: Product, index: number) => (
            <div key={product._id || index} className="mb-6 p-4 border border-gray-200 rounded">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">Product {index + 1}</h3>
                {isEditing && (
                  <button
                    onClick={() => removeProduct(product?._id || '')}
                    className="text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  {isEditing ? (
                    <textarea
                      value={formData.products[index]?.description || ''}
                      onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      rows={2}
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded">{product.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.products[index]?.quantity || ''}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded">{product.quantity}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    {isEditing ? (
                      <select
                        value={formData.products[index]?.unit || 'KGS'}
                        onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="KGS">KGS</option>
                        <option value="PCS">PCS</option>
                        <option value="BOX">BOX</option>
                      </select>
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded">{product.unit}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {formData.products.length === 0 && (
            <p className="text-gray-500">No products added yet.</p>
          )}
        </div>
      )}

      {/* Invoice Tab */}
      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.invoice?.invoiceNumber || ''}
                onChange={(e) => handleInputChange('invoice', 'invoiceNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded">{certificate.invoice.invoiceNumber}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.invoice?.invoiceDate || ''}
                onChange={(e) => handleInputChange('invoice', 'invoiceDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded">{certificate.invoice.invoiceDate}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Packages</label>
            <p className="px-3 py-2 bg-gray-50 rounded">{formData.invoice.totalPackages}</p>
            <p className="text-xs text-gray-500 mt-1">Auto-calculated from products</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight</label>
            <p className="px-3 py-2 bg-gray-50 rounded">{getDisplayWeight()} KGS</p>
            <p className="text-xs text-gray-500 mt-1">Auto-calculated from products</p>
          </div>
        </div>
      )}
    </div>
  );
}
