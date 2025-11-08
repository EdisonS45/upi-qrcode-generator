const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    
    // --- SELLER DETAILS ---
    businessName: { type: String, default: '' },
    gstin: { type: String, default: '' },
    upiId: { type: String, default: '' },
    pan: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' }, // e.g., "Tamil Nadu"
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' },
    },
    
    bankDetails: {
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        bankName: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
    },
    
    // --- NEW FIELDS FROM REF_IMAGE ---
    authorizedSignatureUrl: { type: String, default: '' }, // URL to signature image
    termsAndConditions: { type: String, default: '1. Please pay within 15 days.\n2. Interest @ 18% p.a. will be charged on delayed payments.' },
    additionalNotes: { type: String, default: 'Thank you for your business!' },

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
module.exports = User;