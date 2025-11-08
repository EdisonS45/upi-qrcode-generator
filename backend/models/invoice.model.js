const mongoose = require('mongoose');
const Counter = require('./counter.model');

// Item schema is simplified, as Tax and Discount are now global
const itemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    hsnSacCode: { type: String, default: '' },
    qty: { type: Number, required: true },
    rate: { type: Number, required: true },
    // Total for this line (qty * rate)
    amount: { type: Number, required: true }, 
});

const invoiceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // --- C. Invoice Metadata ---
    invoiceNumber: { type: String, unique: true }, 
    invoiceNumberSeq: { type: Number },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    placeOfSupply: { type: String, required: true },
    countryOfSupply: { type: String, default: 'India' }, // New field
    
    // --- B. Buyer (Client) Details ---
    clientName: { type: String, required: true },
    clientGst: { type: String, default: '' },
    clientPan: { type: String, default: '' }, // New field
    clientAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' },
    },
    clientEmail: { type: String, default: '' },

    // --- D. Line Items ---
    items: [itemSchema],

    // --- E. Totals & Tax Summary (New Structure) ---
    subtotal: { type: Number, required: true }, // Sum of all item amounts
    
    // Global Discount (applied before tax)
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 }, // Calculated discount in currency
    
    taxableAmount: { type: Number, required: true }, // subtotal - discountAmount
    
    // Global Tax Rate (as seen in ref image, applied to taxableAmount)
    taxRate: { type: Number, default: 18 }, // A single tax rate for the whole invoice

    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    
    total: { type: Number, required: true }, // Grand Total (taxableAmount + totalTax)
    
    earlyPayDiscount: { type: Number, default: 0 }, // New field
    
    totalDue: { type: Number, required: true }, // New field (total - earlyPayDiscount)
    
    amountInWords: { type: String, default: '' }, // For Total Due

    // --- F. Payment & Notes ---
    termsAndConditions: { type: String, default: '' }, // New
    additionalNotes: { type: String, default: '' }, // New
    
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Draft'], default: 'Pending' },
    
}, { timestamps: true });


// --- Auto-incrementing Invoice Number (Updated format) ---
invoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: `invoice_seq_${this.user}` }, // Use a different counter ID
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            // Format: 004
            this.invoiceNumberSeq = counter.seq;
            this.invoiceNumber = String(counter.seq).padStart(3, '0');
            
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});


const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;