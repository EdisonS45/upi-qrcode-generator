const express = require('express');
const router = express.Router();
const {
    createInvoice,
    getInvoices,
    getInvoiceById,
    downloadInvoicePDF,
} = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, createInvoiceRules } = require('../middleware/validate.middleware');

// @route   POST /api/invoices
// @route   GET  /api/invoices
router.route('/')
    .post(protect, createInvoiceRules(), validate, createInvoice)
    .get(protect, getInvoices);

// @route   GET /api/invoices/:id
router.route('/:id')
    .get(protect, getInvoiceById);

// @route   GET /api/invoices/:id/pdf
router.route('/:id/pdf')
    .get(protect, downloadInvoicePDF);

module.exports = router;