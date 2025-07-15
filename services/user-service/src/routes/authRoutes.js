const express = require('express');
const authController = require('../controllers/authController');
const { userValidation } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public authentication routes
router.post('/register', userValidation.create, authController.register);
router.post('/login', userValidation.login, authController.login);

// Protected authentication routes
router.post('/logout', optionalAuth, authController.logout);

module.exports = router;
