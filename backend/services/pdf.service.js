const PDFDocument = require('pdfkit');
const { amountToWords } = require('../utils/amountToWords');
const http = require('http');
const https = require('https');

// --- PDF Configuration ---
const ACCENT_COLOR = '#5E35B1'; // A rich purple, close to the ref
const TEXT_COLOR = '#1A1A1A';
const SUBTEXT_COLOR = '#555555';
const BORDER_COLOR = '#E0E0E0';

// --- Helper Functions ---

// Makes numbers clean for the PDF
const formatCurrency = (num) => {
    const safeNum = Number(num) || 0;
    return safeNum.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Formats an address block
const formatAddress = (doc, addr) => {
    if (addr.street) doc.text(addr.street);
    doc.text([addr.city, addr.state, addr.pincode].filter(Boolean).join(' '));
    doc.text(addr.country || 'India');
};

// Fetches a remote image (Logo, Signature)
const fetchImage = (url) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
};

// Draws a horizontal line
const drawHr = (doc, y) => {
    doc.strokeColor(BORDER_COLOR)
       .lineWidth(0.5)
       .moveTo(50, y)
       .lineTo(550, y)
       .stroke();
};

// Draws the table header
const drawTableHeader = (doc, y) => {
    doc.font('Helvetica-Bold')
       .fillColor(ACCENT_COLOR)
       .fontSize(10);
    doc.text('Item/Description', 50, y);
    doc.text('HSN/SAC', 250, y, { width: 60, align: 'left' });
    doc.text('Qty', 310, y, { width: 40, align: 'center' });
    doc.text('Rate', 350, y, { width: 80, align: 'right' });
    doc.text('Amount', 430, y, { width: 120, align: 'right' });
    drawHr(doc, y + 20);
};

// Draws a table row
const drawTableRow = (doc, item, y) => {
    doc.font('Helvetica')
       .fillColor(TEXT_COLOR)
       .fontSize(10);
    doc.text(item.description, 50, y, { width: 190 });
    doc.text(item.hsnSacCode, 250, y, { width: 60, align: 'left' });
    doc.text(item.qty, 310, y, { width: 40, align: 'center' });
    doc.text(formatCurrency(item.rate), 350, y, { width: 80, align: 'right' });
    doc.text(formatCurrency(item.amount), 430, y, { width: 120, align: 'right' });
};

// Draws the Totals section
const drawTotals = (doc, invoice, y) => {
    doc.font('Helvetica');
    let totalY = y;
    const rightAlignX = 430;
    
    const addRow = (label, value, style = 'normal') => {
        if (style === 'bold') {
            doc.font('Helvetica-Bold');
        } else {
            doc.font('Helvetica');
        }
        doc.text(label, 300, totalY, { width: 130, align: 'right' });
        doc.text(value, rightAlignX, totalY, { width: 120, align: 'right' });
        totalY += 20;
    };
    
    addRow('Sub Total', formatCurrency(invoice.subtotal));
    if (invoice.discountAmount > 0) {
        addRow('Discount', `- ${formatCurrency(invoice.discountAmount)}`);
    }
    addRow('Taxable Amount', formatCurrency(invoice.taxableAmount));
    
    if (invoice.igst > 0) {
        addRow(`IGST @ ${invoice.taxRate}%`, formatCurrency(invoice.igst));
    } else {
        addRow(`CGST @ ${invoice.taxRate / 2}%`, formatCurrency(invoice.cgst));
        addRow(`SGST @ ${invoice.taxRate / 2}%`, formatCurrency(invoice.sgst));
    }
    
    addRow('Total', formatCurrency(invoice.total), 'bold');
    
    if (invoice.earlyPayDiscount > 0) {
        addRow('EarlyPay Discount', `- ${formatCurrency(invoice.earlyPayDiscount)}`);
        addRow('Total Due', formatCurrency(invoice.totalDue), 'bold');
    }

    return totalY;
};

// Draws the footer sections
const drawFooter = async (doc, invoice, user, qrCodeDataURL) => {
    let y = 620; // Start footer sections lower on the page
    drawHr(doc, y);
    y += 15;

    const leftColX = 50;
    const rightColX = 350;
    
    // Column 1: Bank Details & QR
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).fontSize(10).text('Bank & Payment Details', leftColX, y);
    doc.font('Helvetica').fontSize(9).fillColor(SUBTEXT_COLOR);
    y += 20;
    doc.text(`Account Holder: ${user.bankDetails.accountName || ''}`, leftColX, y);
    doc.text(`Account Number: ${user.bankDetails.accountNumber || ''}`, leftColX, y + 12);
    doc.text(`Bank Name: ${user.bankDetails.bankName || ''}`, leftColX, y + 24);
    doc.text(`IFSC: ${user.bankDetails.ifscCode || ''}`, leftColX, y + 36);

    if (qrCodeDataURL) {
        doc.image(qrCodeDataURL, rightColX, y - 10, { fit: [90, 90] });
        doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR).text('Scan to Pay (UPI)', rightColX, y + 85, { width: 90, align: 'center' });
    }

    // Column 2: Terms & Signature
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).fontSize(10).text('Terms & Conditions', rightColX + 110, y);
    doc.font('Helvetica').fontSize(8).fillColor(SUBTEXT_COLOR)
       .text(invoice.termsAndConditions, rightColX + 110, y + 20, { width: 140 });

    y += 100; // Move down past QR and Terms

    // Signature
    if (user.authorizedSignatureUrl) {
        try {
            const signatureImg = await fetchImage(user.authorizedSignatureUrl);
            doc.image(signatureImg, 450, y - 20, { height: 30 });
        } catch (e) {
            console.error('Failed to load signature:', e);
            doc.text('[Signature]', 450, y - 10);
        }
    }
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).fontSize(10)
       .text('Authorized Signature', 450, y + 20, { width: 100, align: 'center' });
       
    // Additional Notes
    if (invoice.additionalNotes) {
        doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).fontSize(10).text('Additional Notes', leftColX, y - 10);
        doc.font('Helvetica').fontSize(9).fillColor(SUBTEXT_COLOR)
           .text(invoice.additionalNotes, leftColX, y + 5, { width: 250 });
    }
};

// --- Main PDF Generation Function ---
const generateInvoicePDF = async (invoice, user, qrCodeDataURL) => {
    const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        font: 'Helvetica'
    });

    // --- 1. Header (Logo & Seller) ---
    doc.fillColor(TEXT_COLOR);
    doc.font('Helvetica-Bold').fontSize(16).text(user.businessName || user.name, 50, 50);
    doc.font('Helvetica').fontSize(10).fillColor(SUBTEXT_COLOR);
    formatAddress(doc, user.address);
    if (user.gstin) doc.text(`GSTIN: ${user.gstin}`);
    if (user.pan) doc.text(`PAN: ${user.pan}`);

    // Logo
    if (user.logoUrl) {
        try {
            const logoImg = await fetchImage(user.logoUrl);
            doc.image(logoImg, 450, 50, { fit: [100, 50], align: 'right' });
        } catch (e) {
            console.error('Failed to load logo:', e);
        }
    }
    
    doc.moveDown(3);
    drawHr(doc, doc.y);
    doc.moveDown(1);
    
    // --- 2. Bill To & Invoice Details ---
    const billToY = doc.y;
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).fontSize(11).text('Billed To', 50, billToY);
    doc.font('Helvetica').fontSize(10).fillColor(SUBTEXT_COLOR);
    doc.text(invoice.clientName, 50, billToY + 15);
    formatAddress(doc, invoice.clientAddress);
    if (invoice.clientGst) doc.text(`GSTIN: ${invoice.clientGst}`);
    if (invoice.clientPan) doc.text(`PAN: ${invoice.clientPan}`);

    // Invoice Details (Right)
    const metadataX = 350;
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).fontSize(11).text('Invoice No:', metadataX, billToY);
    doc.font('Helvetica').fillColor(SUBTEXT_COLOR).text(invoice.invoiceNumber, metadataX + 100, billToY);
    
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).text('Invoice Date:', metadataX, billToY + 15);
    doc.font('Helvetica').fillColor(SUBTEXT_COLOR).text(new Date(invoice.invoiceDate).toLocaleDateString('en-IN'), metadataX + 100, billToY + 15);
    
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).text('Due Date:', metadataX, billToY + 30);
    doc.font('Helvetica').fillColor(SUBTEXT_COLOR).text(new Date(invoice.dueDate || invoice.invoiceDate).toLocaleDateString('en-IN'), metadataX + 100, billToY + 30);
    
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).text('Place of Supply:', metadataX, billToY + 45);
    doc.font('Helvetica').fillColor(SUBTEXT_COLOR).text(invoice.placeOfSupply, metadataX + 100, billToY + 45);
    
    doc.moveDown(4);

    // --- 3. Items Table ---
    drawTableHeader(doc, doc.y);
    doc.moveDown(1);
    
    let tableY = doc.y;
    invoice.items.forEach(item => {
        drawTableRow(doc, item, tableY);
        tableY += 30; // Spacing for rows
    });
    doc.y = tableY;
    drawHr(doc, doc.y);
    doc.moveDown(1);

    // --- 4. Totals ---
    const totalsEndY = drawTotals(doc, invoice, doc.y);
    doc.y = totalsEndY + 10;
    
    // Amount in Words
    doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).fontSize(10).text('Invoice Total (in words)', 50, doc.y);
    doc.font('Helvetica').fillColor(SUBTEXT_COLOR).fontSize(10)
       .text(invoice.amountInWords, 50, doc.y + 15, { width: 500 });

    // --- 5. Footer ---
    await drawFooter(doc, invoice, user, qrCodeDataURL);

    return doc; // Return the document stream
};

module.exports = { generateInvoicePDF };