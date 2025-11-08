const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Middleware to run the validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = errors.array().map(err => ({ [err.path]: err.msg }));

    throw new ApiError(400, 'Validation failed', extractedErrors);
};

// --- Define Rules ---

const registerRules = () => [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const loginRules = () => [
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = () => [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('businessName').optional().trim(),
    body('gstin').trim().if(value => value.length > 0).isLength({ min: 15, max: 15 }).withMessage('GSTIN must be 15 characters'),
    body('upiId').trim().if(value => value.length > 0).matches(/^[\w.-]+@[\w.-]+$/).withMessage('Invalid UPI ID format'),
    body('pan').trim().if(value => value.length > 0).isLength({ min: 10, max: 10 }).withMessage('PAN must be 10 characters'),
    body('logoUrl').optional().isURL().withMessage('Logo must be a valid URL'),
    body('authorizedSignatureUrl').optional().isURL().withMessage('Signature must be a valid URL'),
    body('termsAndConditions').optional().trim(),
    body('additionalNotes').optional().trim(),
    body('address.street').optional().trim(),
    body('address.city').optional().trim(),
    body('address.state').optional().trim(),
    body('address.pincode').optional().trim().if(value => value.length > 0).isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
    body('bankDetails.accountName').optional().trim(),
    body('bankDetails.accountNumber').optional().trim(),
    body('bankDetails.bankName').optional().trim(),
    body('bankDetails.ifscCode').optional().trim().if(value => value.length > 0).isLength({ min: 11, max: 11 }).withMessage('IFSC code must be 11 characters'),
];

const createInvoiceRules = () => [
    body('clientName').trim().notEmpty().withMessage('Client name is required'),
    body('clientAddress.state').trim().notEmpty().withMessage('Client state is required'),
    body('clientGst').trim().if(value => value.length > 0).isLength({ min: 15, max: 15 }).withMessage('GSTIN must be 15 characters'),
    body('clientPan').trim().if(value => value.length > 0).isLength({ min: 10, max: 10 }).withMessage('PAN must be 10 characters'),
    
    body('placeOfSupply').trim().notEmpty().withMessage('Place of Supply is required'),
    body('countryOfSupply').optional().trim(),
    body('invoiceDate').optional().isISO8601().withMessage('Invalid date format'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
    
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.description').trim().notEmpty().withMessage('Item description is required'),
    body('items.*.qty').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('items.*.rate').isFloat({ gte: 0 }).withMessage('Rate must be a positive number'),
    body('items.*.hsnSacCode').optional().trim(),
    
    body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue').isFloat({ gte: 0 }).withMessage('Discount must be a positive number'),
    body('taxRate').isFloat({ gte: 0 }).withMessage('Tax Rate must be a positive number'),
    body('earlyPayDiscount').isFloat({ gte: 0 }).withMessage('Early pay discount must be a positive number'),
    
    body('termsAndConditions').optional().trim(),
    body('additionalNotes').optional().trim(),
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    updateProfileRules,
    createInvoiceRules,
};