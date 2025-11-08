const Invoice = require('../models/invoice.model');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateUpiQRCode } = require('../services/qr.service');
const { generateInvoicePDF } = require('../services/pdf.service');
const { amountToWords } = require('../utils/amountToWords');

// @desc    Create a new invoice
// @route   POST /api/invoices
const createInvoice = asyncHandler(async (req, res) => {
    const { 
        clientName, clientGst, clientPan, clientAddress, clientEmail,
        items, 
        invoiceDate, dueDate, 
        placeOfSupply, countryOfSupply,
        discountType, discountValue, taxRate, earlyPayDiscount,
        termsAndConditions, additionalNotes 
    } = req.body;

    // 1. Get Seller Details (for tax calculation)
    const seller = req.user;
    const sellerState = seller.address.state.toLowerCase().trim();
    const supplyState = placeOfSupply.toLowerCase().trim();
    
    const isIntraState = sellerState === supplyState && countryOfSupply.toLowerCase().trim() === 'india';

    // 2. Process items and calculate Subtotal
    let subtotal = 0;
    const processedItems = items.map(item => {
        const itemQty = Number(item.qty) || 0;
        const itemRate = Number(item.rate) || 0;
        const itemAmount = itemQty * itemRate;
        subtotal += itemAmount;

        return {
            description: item.description,
            hsnSacCode: item.hsnSacCode,
            qty: itemQty,
            rate: itemRate,
            amount: itemAmount, // (qty * rate)
        };
    });

    // 3. Calculate Totals based on ref image logic
    
    // Apply Global Discount
    let discountAmount = 0;
    if (discountType === 'percentage') {
        discountAmount = subtotal * (Number(discountValue) / 100);
    } else {
        discountAmount = Number(discountValue) || 0;
    }
    
    const taxableAmount = subtotal - discountAmount;
    
    // Apply Global Tax
    const totalTax = taxableAmount * (Number(taxRate) / 100);
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIntraState) {
        cgst = totalTax / 2;
        sgst = totalTax / 2;
    } else {
        igst = totalTax;
    }

    const total = taxableAmount + totalTax;
    const finalEarlyPayDiscount = Number(earlyPayDiscount) || 0;
    const totalDue = total - finalEarlyPayDiscount;
    const words = amountToWords(totalDue);

    // 4. Create invoice object
    const invoice = new Invoice({
        user: seller._id,
        clientName, clientGst, clientPan, clientAddress, clientEmail,
        items: processedItems,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        placeOfSupply,
        countryOfSupply,
        
        // Totals
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        taxableAmount,
        taxRate,
        cgst,
        sgst,
        igst,
        totalTax,
        total,
        earlyPayDiscount: finalEarlyPayDiscount,
        totalDue,
        amountInWords: words,
        
        // Notes
        termsAndConditions: termsAndConditions || seller.termsAndConditions,
        additionalNotes: additionalNotes || seller.additionalNotes,

        status: 'Pending',
    });

    // The 'pre-save' hook will auto-generate the invoiceNumber
    const createdInvoice = await invoice.save();
    res.status(201).json(new ApiResponse(201, createdInvoice, 'Invoice created'));
});

// @desc    Get all invoices for logged-in user
// @route   GET /api/invoices
const getInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, invoices));
});

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
const getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }
    if (!invoice.user.equals(req.user._id)) {
        throw new ApiError(403, 'Forbidden: You do not own this invoice');
    }

    res.status(200).json(new ApiResponse(200, invoice));
});

// @desc    Generate and stream PDF invoice
// @route   GET /api/invoices/:id/pdf
const downloadInvoicePDF = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) throw new ApiError(404, 'Invoice not found');
    if (!invoice.user.equals(req.user._id)) {
        throw new ApiError(403, 'Forbidden: You do not own this invoice');
    }

    // Get user details (seller) - req.user is already populated
    const user = req.user;

    // 1. Generate QR Code (if UPI ID exists)
    let qrCodeDataURL = null;
    if (user.upiId) {
        qrCodeDataURL = await generateUpiQRCode({
            upiId: user.upiId,
            name: user.businessName || user.name,
            amount: invoice.totalDue, // QR code should be for the Total Due
            invoiceNumber: invoice.invoiceNumber,
        });
    }

    // 2. Set headers for PDF streaming
    const fileName = `Invoice-${invoice.invoiceNumber.replace('/', '-')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // 3. Generate PDF stream using the new service
    const pdfStream = await generateInvoicePDF(invoice, user, qrCodeDataURL);

    // 4. Pipe the PDF stream directly to the response
    pdfStream.pipe(res);
    pdfStream.end();
});

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    downloadInvoicePDF,
};