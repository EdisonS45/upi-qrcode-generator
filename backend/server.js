const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const qrcode = require('qrcode');

// --- 1. INITIAL CONFIGURATION ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// --- 2. MIDDLEWARE ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Body parser for JSON

// --- 3. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully.'))
    .catch((err) => console.error('MongoDB Connection Failed:', err));

// --- 4. MONGOOSE MODELS ---

// User Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Default business details
    businessName: { type: String, default: '' },
    gstin: { type: String, default: '' },
    upiId: { type: String, default: '' },
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Invoice Model
const invoiceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true },
    clientName: { type: String, required: true },
    clientGst: { type: String, default: '' },
    clientAddress: { type: String, default: '' },
    items: [{
        description: { type: String, required: true },
        qty: { type: Number, required: true },
        rate: { type: Number, required: true },
    }],
    subtotal: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
    invoiceDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

// --- 5. AUTH MIDDLEWARE ---

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// --- 6. UTILITY FUNCTIONS ---
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const formatCurrency = (num) => `Rs. ${num.toFixed(2)}`;

// --- 7. API ROUTES ---

// === Auth Routes ===

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            // Set defaults from name
            businessName: name,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                businessName: user.businessName,
                gstin: user.gstin,
                upiId: user.upiId,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// === User Routes ===

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
app.get('/api/users/profile', protect, async (req, res) => {
    // req.user is available from the 'protect' middleware
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        businessName: req.user.businessName,
        gstin: req.user.gstin,
        upiId: req.user.upiId,
    });
});

// @desc    Update user profile (business details)
// @route   PUT /api/users/profile
// @access  Private
app.put('/api/users/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.businessName = req.body.businessName || user.businessName;
            user.gstin = req.body.gstin || user.gstin;
            user.upiId = req.body.upiId || user.upiId;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                businessName: updatedUser.businessName,
                gstin: updatedUser.gstin,
                upiId: updatedUser.upiId,
                token: generateToken(updatedUser._id), // Re-issue token in case name changes
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// === Invoice Routes ===

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
app.post('/api/invoices', protect, async (req, res) => {
    try {
        const { invoiceNumber, clientName, clientGst, clientAddress, items, subtotal, cgst, sgst, total, status, invoiceDate } = req.body;

        const invoice = new Invoice({
            user: req.user._id,
            invoiceNumber,
            clientName,
            clientGst,
            clientAddress,
            items,
            subtotal,
            cgst,
            sgst,
            total,
            status,
            invoiceDate
        });

        const createdInvoice = await invoice.save();
        res.status(201).json(createdInvoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all invoices for logged-in user
// @route   GET /api/invoices
// @access  Private
app.get('/api/invoices', protect, async (req, res) => {
    try {
        const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
app.get('/api/invoices/:id', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (invoice && invoice.user.equals(req.user._id)) {
            res.json(invoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Generate and stream PDF invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
app.get('/api/invoices/:id/pdf', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice || !invoice.user.equals(req.user._id)) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Get user details for the invoice (Your business details)
        const user = req.user;

        // 1. Generate UPI QR Code Data URL
        const upiString = `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.businessName)}&am=${invoice.total.toFixed(2)}&cu=INR&tn=Inv-${invoice.invoiceNumber}`;
        const qrCodeDataURL = await qrcode.toDataURL(upiString);

        // 2. Create PDF Document
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Set headers to stream the PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=Invoice-${invoice.invoiceNumber}.pdf`);
        doc.pipe(res);

        // --- Build PDF Content ---
        doc.setFont('Helvetica-Bold').fontSize(20).text('TAX INVOICE', { align: 'center' });
        doc.moveDown();

        // Seller & Buyer Details
        const sellerX = 50;
        const buyerX = 350;
        let currentY = doc.y;

        doc.setFont('Helvetica-Bold').fontSize(12).text('Sold By:', sellerX, currentY);
        doc.setFont('Helvetica').fontSize(10);
        doc.text(user.businessName, sellerX, (currentY += 15));
        doc.text(`GSTIN: ${user.gstin}`, sellerX, (currentY += 15));
        doc.text(`UPI: ${user.upiId}`, sellerX, (currentY += 15));

        let buyerY = doc.y - (15 * 3) - 15; // Align top
        doc.setFont('Helvetica-Bold').fontSize(12).text('Bill To:', buyerX, buyerY);
        doc.setFont('Helvetica').fontSize(10);
        doc.text(invoice.clientName, buyerX, (buyerY += 15));
        doc.text(`GSTIN: ${invoice.clientGst}`, buyerX, (buyerY += 15));
        const addressLines = doc.splitTextToSize(invoice.clientAddress, 200);
        for (const line of addressLines) {
            doc.text(line, buyerX, (buyerY += 15));
        }

        doc.y = Math.max(currentY, buyerY) + 20; // Move below both columns
        doc.setFont('Helvetica-Bold');
        doc.text(`Invoice #: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`);
        doc.moveDown();

        // Items Table
        const tableTop = doc.y;
        doc.setFont('Helvetica-Bold');
        doc.text('Item Description', 50, tableTop);
        doc.text('Qty', 300, tableTop, { width: 90, align: 'right' });
        doc.text('Rate', 370, tableTop, { width: 90, align: 'right' });
        doc.text('Amount', 440, tableTop, { width: 90, align: 'right' });
        doc.y += 20;
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y - 8).lineTo(550, doc.y - 8).stroke();
        
        doc.setFont('Helvetica');
        let totalAmount = 0;
        invoice.items.forEach(item => {
            const y = doc.y;
            doc.text(item.description, 50, y, { width: 290 });
            doc.text(item.qty, 300, y, { width: 90, align: 'right' });
            doc.text(formatCurrency(item.rate), 370, y, { width: 90, align: 'right' });
            const amount = item.qty * item.rate;
            doc.text(formatCurrency(amount), 440, y, { width: 90, align: 'right' });
            doc.y += 20; // Move down for next item
        });
        
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y - 8).lineTo(550, doc.y - 8).stroke();
        
        // Totals Section
        let totalsY = doc.y + 10;
        doc.setFont('Helvetica');
        doc.text('Subtotal:', 370, totalsY, { width: 90, align: 'right' });
        doc.text(formatCurrency(invoice.subtotal), 440, totalsY, { width: 90, align: 'right' });
        
        totalsY += 20;
        doc.text('CGST (9%):', 370, totalsY, { width: 90, align: 'right' });
        doc.text(formatCurrency(invoice.cgst), 440, totalsY, { width: 90, align: 'right' });

        totalsY += 20;
        doc.text('SGST (9%):', 370, totalsY, { width: 90, align: 'right' });
        doc.text(formatCurrency(invoice.sgst), 440, totalsY, { width: 90, align: 'right' });

        totalsY += 25;
        doc.setFont('Helvetica-Bold').fontSize(14);
        doc.text('Total:', 370, totalsY, { width: 90, align: 'right' });
        doc.text(formatCurrency(invoice.total), 440, totalsY, { width: 90, align: 'right' });

        // QR Code
        doc.image(qrCodeDataURL, 50, totalsY - 40, {
            fit: [120, 120],
            align: 'left'
        });
        doc.setFont('Helvetica-Bold').fontSize(10).text('Scan to Pay', 50, totalsY + 85, { width: 120, align: 'center' });

        // Footer
        doc.fontSize(10).text('Thank you for your business!', 50, 750, { align: 'center', width: 500 });

        // --- End PDF ---
        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
});


// --- 8. START SERVER ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});