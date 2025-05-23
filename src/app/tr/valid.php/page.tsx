/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Certificate } from '@/types';
import './bootstrap.css';

export default function CertificateVerification() {
    const searchParams = useSearchParams();
    const guid = searchParams?.get('Guid');
    const certNumber = searchParams?.get('CertNumber');
    
    const [certificate, setCertificate] = useState<Certificate>({
        info: {
            certificateNumber: '',
            exporterName: '',
            exporterAddress: '',
            consigneeName: '',
            consigneeAddress: '',
            consigneeCountry: '',
            transportDetails: '',
            countryOfOrigin: '',
            placeAndDateOfIssue: ''
        },
        products: [],
        invoice: {
            totalPackages: '',
            totalWeight: '',
            invoiceNumber: '',
            invoiceDate: ''
        }
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            setLoading(true);
            setError(null);
            
            try {
                let endpoint = '';
                
                // Determine which search parameter to use
                if (guid) {
                    // Try to fetch by GUID first (new approach)
                    endpoint = `/api/certificates/guid/${guid}`;
                    
                    const guidResponse = await fetch(endpoint);
                    
                    // If not found by GUID, try by ID (backward compatibility)
                    if (guidResponse.status === 404) {
                        endpoint = `/api/certificates/${guid}`;
                        const response = await fetch(endpoint);
                        
                        if (!response.ok) {
                            throw new Error('Certificate not found');
                        }
                        
                        const data = await response.json();
                        setCertificate(data.certificate);
                        return;
                    }
                    
                    if (!guidResponse.ok) {
                        throw new Error('Failed to fetch certificate');
                    }
                    
                    const data = await guidResponse.json();
                    setCertificate(data.certificate);
                    
                } else if (certNumber) {
                    endpoint = `/api/certificates/search?certNumber=${certNumber}`;
                    const response = await fetch(endpoint);
                    
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error('Certificate not found');
                        } else {
                            throw new Error('Failed to fetch certificate');
                        }
                    }
                    
                    const data = await response.json();
                    setCertificate(data.certificate);
                } else {
                    throw new Error('No search parameter provided');
                }
                
            } catch (err: any) {
                console.error('Error fetching certificate:', err);
                setError(err.message || 'Failed to load certificate');
            } finally {
                setLoading(false);
            }
        };
        
        // Only fetch if we have a search parameter
        if (guid || certNumber) {
            fetchCertificate();
        } else {
            setLoading(false);
            setError('Please provide a Guid or Certificate Number in the URL');
        }
    }, [guid, certNumber]);

    // Calculate total weight if it's zero or missing
    const calculateTotalWeight = (products: any[]): string => {
        if (!products || products.length === 0) return "0.000";
        
        let totalWeight = 0;
        products.forEach(product => {
            // Handle numbers with commas as thousand separators (e.g., "3,200.00")
            const cleanedQuantity = product.quantity.replace(/,/g, '');
            const quantity = parseFloat(cleanedQuantity);
            if (!isNaN(quantity)) {
                totalWeight += quantity;
            }
        });
        
        // Format the result with comma thousands separators
        return totalWeight.toLocaleString('en-US', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        });
    };
    
    // Get display weight (either from invoice or calculate it)
    const getDisplayWeight = (): string => {
        const invoiceWeight = parseFloat(certificate.invoice.totalWeight);
        if (isNaN(invoiceWeight) || invoiceWeight === 0) {
            return calculateTotalWeight(certificate.products);
        }
        return certificate.invoice.totalWeight;
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="panel panel-default">
                    <div className="panel-body text-center p-5">
                        <h4>Loading certificate data...</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="panel panel-danger">
                    <div className="panel-heading">
                        <h3 className="panel-title">Certificate Verification Error</h3>
                    </div>
                    <div className="panel-body text-center p-5">
                        <h4>{error}</h4>
                        <p>Please check the URL and try again.</p>
                        <p className="text-muted">
                            Use ?Guid=... to search by certificate ID or ?CertNumber=... to search by certificate number.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row">
                        <div className="col-sm-3">
                            <Image
                                src="/logo.png"
                                alt="TOBB MEDOS Logo"
                                width={151}
                                height={96}
                            />
                        </div>
                        <div className="col-sm-9 text-right">
                            <h4>Certificate Verification</h4>
                            <h3>{certificate.info.certificateNumber}</h3>
                        </div>
                    </div>
                </div>
                <div className="panel-body">
                    <table className="table table-bordered table-condensed">
                        <thead>
                            <tr>
                                <th colSpan={2}>
                                    <h4>BASIC INFORMATION OF CERTIFICATE</h4>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="col-sm-2">
                                    <b>Exporter Name</b>
                                    <span className="pull-right label label-info">1</span>
                                </td>
                                <td>
                                    {certificate.info.exporterName}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Exporter Address</b>
                                    <span className="pull-right label label-info">1</span>
                                </td>
                                <td>
                                    {certificate.info.exporterAddress}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Consignee Name</b>
                                    <span className="pull-right label label-info">2</span>
                                </td>
                                <td>
                                    {certificate.info.consigneeName}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Consignee Address</b>
                                    <span className="pull-right label label-info">2</span>
                                </td>
                                <td>
                                    {certificate.info.consigneeAddress}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Consignee Country</b>
                                    <span className="pull-right label label-info">2</span>
                                </td>
                                <td>
                                    {certificate.info.consigneeCountry}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Transport Details</b>
                                    <span className="pull-right label label-info">4</span>
                                </td>
                                <td>
                                    {certificate.info.transportDetails}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Country of Origin</b>
                                    <span className="pull-right label label-info">3</span>
                                </td>
                                <td>
                                    {certificate.info.countryOfOrigin}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Place and Date of Issue</b>
                                    <span className="pull-right label label-info">8</span>
                                </td>
                                <td>
                                    {certificate.info.placeAndDateOfIssue}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="table table-bordered table-condensed">
                        <thead>
                            <tr>
                                <th colSpan={2}>
                                    <h4>DESCRIPTION OF GOODS</h4>
                                </th>
                            </tr>
                        </thead>
                        <thead>
                            <tr>
                                <th>
                                    Marks, numbers, number and kind of packages, description of goods
                                    <span className="pull-right label label-info">6</span>
                                </th>
                                <th>
                                    Quantity
                                    <span className="pull-right label label-info">7</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificate.products.map((product, index) => (
                                <tr key={index}>
                                    <td className="col-sm-9">
                                        {product.description}
                                    </td>
                                    <td className="text-right">
                                        {product.quantity} {product.unit}
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td className="col-sm-9">
                                    TOTAL NUMBER OF PACKAGES : {certificate.invoice.totalPackages} / {getDisplayWeight()} KGS
                                </td>
                                <td className="text-right"></td>
                            </tr>
                            <tr>
                                <td className="col-sm-9">
                                    INVOICE NUMBER AND DATE : {certificate.invoice.invoiceNumber} / {certificate.invoice.invoiceDate}
                                </td>
                                <td className="text-right"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
