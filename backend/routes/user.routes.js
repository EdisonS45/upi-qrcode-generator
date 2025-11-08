const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, updateProfileRules } = require('../middleware/validate.middleware');

// @route   GET /api/users/profile
// @route   PUT /api/users/profile
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateProfileRules(), validate, updateUserProfile);

module.exports = router;