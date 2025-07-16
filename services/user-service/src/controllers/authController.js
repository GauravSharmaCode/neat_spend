const { logWithMeta } = require('@gauravsharmacode/neat-logger');
const UserService = require('../services/UserService');
const { signToken } = require('../utils/auth');
const { AppError } = require('../middleware/errorHandler');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// eslint-disable-next-line no-unused-vars
const register = catchAsync(async (req, res, _next) => {
  const func = 'authController.register';
  logWithMeta('Registration attempt', { func, level: 'info', extra: { email: req.body.email } });

  const user = await UserService.createUser(req.body);

  logWithMeta('Registration successful', { 
    func, 
    level: 'info', 
    extra: { 
      email: req.body.email, 
      userId: user.id,
    }
  });

  // After creating the user and before sending the response:
  if (user && user.password) {
    delete user.password;
  }

  res.status(201).json({
    status: 'success',
    data: user
  });
});

const login = catchAsync(async (req, res, next) => {
  const func = 'authController.login';
  const { email, password } = req.body;

  logWithMeta('Login attempt', { func, level: 'info', extra: { email } });

  if (!email || !password) {
    logWithMeta('Login failed: Email or password not provided', { func, level: 'warn', extra: { email } });
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await UserService.authenticateUser(email, password);

  logWithMeta('Login successful', { 
    func, 
    level: 'info', 
    extra: { 
      email, 
      userId: user.id 
    } 
  });

  createSendToken(user, 200, res);
});

const logout = (req, res) => {
  const func = 'authController.logout';
  // For JWT, logout is typically handled client-side by deleting the token.
  // If using a token blacklist, you would add the token to it here.
  logWithMeta('User logout', { func, level: 'info', extra: { userId: req.user?.id || 'guest' } });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logout,
};
