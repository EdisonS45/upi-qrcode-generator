const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const invoiceRoutes = require('./invoice.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/invoices', invoiceRoutes);

module.exports = router;