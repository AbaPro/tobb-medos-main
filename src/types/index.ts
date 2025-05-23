import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Certificate related types
 */
export type Product = {
    _id?: string;
    description: string;
    quantity: string;
    unit: 'KGS' | 'PCS' | 'BOX';
};

export type CertificateInfo = {
    certificateNumber: string;
    exporterName: string;
    exporterAddress: string;
    consigneeName: string;
    consigneeAddress: string;
    consigneeCountry: string;
    transportDetails: string;
    countryOfOrigin: string;
    placeAndDateOfIssue: string;
    [key: string]: string; // Add index signature to allow string indexing
};

export type InvoiceDetails = {
    totalPackages: string;
    totalWeight: string;
    invoiceNumber: string;
    invoiceDate: string;
    [key: string]: string; // Add index signature to allow string indexing
};

export type Certificate = {
    _id?: string;
    guid?: string;
    info: CertificateInfo;
    products: Product[];
    invoice: InvoiceDetails;
    createdAt?: string;
    updatedAt?: string;
};

/**
 * Admin user related types
 */
export type AdminRole = 'admin' | 'super-admin';

export type AdminUser = {
    _id: string;
    name: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AdminFormData = {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
    isActive: boolean;
};

export type AdminUpdatePayload = Omit<AdminFormData, 'password'> & {
    password?: string;
};

/**
 * API response types
 */
export type ApiResponse<T> = {
    data?: T;
    error?: string;
    message?: string;
    status: number;
};

export type CertificatesApiResponse = {
    certificates: Certificate[];
};

export type CertificateApiResponse = {
    certificate: Certificate;
};

export type AdminsApiResponse = {
    admins: AdminUser[];
};

export type AdminApiResponse = {
    admin: AdminUser;
};

/**
 * Extended NextAuth types
 */
export interface ExtendedUser {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
}

export interface ExtendedSession extends Session {
    user: ExtendedUser;
}

export interface ExtendedJWT extends JWT {
    id: string;
    role: AdminRole;
}
