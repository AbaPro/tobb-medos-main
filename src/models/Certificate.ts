import { Schema, model, models } from 'mongoose';

// Product schema (sub-document)
const ProductSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: 'KGS',
    enum: ['KGS', 'PCS', 'BOX']
  }
});

// Certificate schema
const CertificateSchema = new Schema({
  guid: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true,
  },
  info: {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      // Add an index to ensure uniqueness but allow for updates
      index: { 
        unique: true, 
        sparse: true 
      },
    },
    exporterName: {
      type: String,
      required: true
    },
    exporterAddress: {
      type: String,
      required: true
    },
    consigneeName: {
      type: String,
      required: true
    },
    consigneeAddress: {
      type: String,
      required: true
    },
    consigneeCountry: {
      type: String,
      required: true
    },
    transportDetails: {
      type: String,
      required: true
    },
    countryOfOrigin: {
      type: String,
      required: true
    },
    placeAndDateOfIssue: {
      type: String,
      required: true
    }
  },
  products: [ProductSchema],
  invoice: {
    totalPackages: {
      type: String,
      required: true
    },
    totalWeight: {
      type: String,
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true
    },
    invoiceDate: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

// Auto-calculate totals before saving
CertificateSchema.pre('save', function(next) {
  if (this.products && this.products.length > 0 && this.invoice) {
    // Calculate total packages
    this.invoice.totalPackages = this.products.length.toString();
    
    // Calculate total weight
    let totalWeight = 0;
    this.products.forEach((product) => {
      totalWeight += parseFloat(product.quantity.replace(',', '.'));
    });
    this.invoice.totalWeight = totalWeight.toFixed(3);
  }

  // Generate a GUID if one doesn't exist
  if (!this.guid) {
    this.guid = crypto.randomUUID();
  }

  next();
});

// Add compound index for faster searches
CertificateSchema.index({ 'info.certificateNumber': 1 });
CertificateSchema.index({ 'guid': 1 });

// Use existing model or create a new one
export default models.Certificate || model('Certificate', CertificateSchema);
