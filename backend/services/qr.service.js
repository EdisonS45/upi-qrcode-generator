const qrcode = require('qrcode');

/**
 * Generates a Data URL for a UPI QR code.
 * @param {string} upiId - The recipient's UPI ID (e.g., user@bank).
 * @param {string} name - The recipient's name.
 * @param {number} amount - The amount for the payment.
 * @param {string} invoiceNumber - The transaction note or invoice number.
 * @returns {Promise<string>} A Data URL string (e.g., "data:image/png;base64,...").
 */
const generateUpiQRCode = async ({ upiId, name, amount, invoiceNumber }) => {
    if (!upiId || !name) {
        throw new Error('UPI ID and Name are required for QR code generation');
    }
    
    // --- FIX IS HERE ---
    // Ensure amount is a valid number before calling .toFixed()
    const safeAmount = Number(amount) || 0;

    // Construct the UPI payment string
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${safeAmount.toFixed(2)}&cu=INR&tn=Payment for Inv-${invoiceNumber}`;
    
    try {
        // Generate QR code as a Data URL
        return await qrcode.toDataURL(upiString);
    } catch (error) {
        console.error('QR Code Generation Error:', error);
        throw new Error('Failed to generate QR code');
    }
};

module.exports = { generateUpiQRCode };