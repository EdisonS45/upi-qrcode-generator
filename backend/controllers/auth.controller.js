const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        businessName: name, // Default business name to user's name
    });

    if (user) {
        const token = generateToken(user._id);
        res.status(201).json(new ApiResponse(201, {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: token,
        }, 'User registered successfully'));
    } else {
        throw new ApiError(400, 'Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }
    
    const token = generateToken(user._id);
    res.status(200).json(new ApiResponse(200, {
        _id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        gstin: user.gstin,
        upiId: user.upiId,
        token: token,
    }, 'Login successful'));
});

module.exports = { registerUser, loginUser };