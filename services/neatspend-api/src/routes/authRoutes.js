const express = require('express');
const { body } = require('express-validator');
const { createLogger } = require('@gauravsharmacode/neat-logger');
const { handleValidationErrors, userValidation } = require('../middleware/validation');
const { createSendToken, correctPassword } = require('../middleware/auth');
const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');
const { prisma } = require('../prisma');
const config = require('../config');

const router = express.Router();

const logger = createLogger({
  service: 'auth-controller',
  level: config.logging.level
});

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const login = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  const { email, password } = req.body;

  try {
    logger.info('Login attempt', { email });

    // Get user with password
    const user = await userService.getUserByEmail(email, true);

    if (!user || !user.password || !(await correctPassword(password, user.password))) {
      const duration = Date.now() - startTime;
      logger.warn('Invalid login attempt', { 
        email, 
        duration: `${duration}ms`
      });
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.isActive) {
      const duration = Date.now() - startTime;
      logger.warn('Login attempt for inactive user', { 
        email, 
        userId: user.id,
        duration: `${duration}ms`
      });
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const duration = Date.now() - startTime;
    logger.info('Login successful', { 
      email, 
      userId: user.id,
      duration: `${duration}ms`
    });

    createSendToken(user, 200, res);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Login error', { 
      error: error.message, 
      email,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const register = catchAsync(async (req, res, next) => {
  const startTime = Date.now();

  try {
    logger.info('Registration attempt', { email: req.body.email });

    const user = await userService.createUser(req.body);

    const duration = Date.now() - startTime;
    logger.info('Registration successful', { 
      email: req.body.email, 
      userId: user.id,
      duration: `${duration}ms`
    });

    createSendToken(user, 201, res);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Registration error', { 
      error: error.message, 
      email: req.body.email,
      duration: `${duration}ms`
    });
    next(error);
  }
});

router.post('/login', loginValidation, login);
router.post('/register', userValidation.create, register);

module.exports = router;
