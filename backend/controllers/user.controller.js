const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is available from the 'protect' middleware
    // We send the full user object, which now includes all details
    res.status(200).json(new ApiResponse(200, req.user));
});

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    const { 
        name, businessName, gstin, upiId, pan, logoUrl, 
        authorizedSignatureUrl, termsAndConditions, additionalNotes,
        address, bankDetails 
    } = req.body;

    // Update main fields
    user.name = name || user.name;
    user.businessName = businessName || user.businessName;
    user.gstin = gstin;
    user.upiId = upiId;
    user.pan = pan;
    user.logoUrl = logoUrl;
    
    // Update new fields
    user.authorizedSignatureUrl = authorizedSignatureUrl;
    user.termsAndConditions = termsAndConditions;
    user.additionalNotes = additionalNotes;

    // Update nested address
    if (address) {
        user.address = { ...user.address, ...address };
    }
    
    // Update nested bank details
    if (bankDetails) {
        user.bankDetails = { ...user.bankDetails, ...bankDetails };
    }

    if (req.body.password) {
        user.password = req.body.password; // Hash middleware will run on save
    }

    const updatedUser = await user.save();

    res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

module.exports = { getUserProfile, updateUserProfile };