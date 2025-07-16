const { createLogger } = require('@gauravsharmacode/neat-logger');
const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config');

const logger = createLogger({
  service: 'user-controller',
  level: config.logging.level
});

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const createUser = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const user = await userService.createUser(req.body);
    
    const duration = Date.now() - startTime;
    logger.info('User created successfully', { 
      userId: user.id, 
      email: user.email,
      duration: `${duration}ms`
    });

    res.status(201).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error creating user', { 
      error: error.message, 
      duration: `${duration}ms`
    });
    next(error);
  }
});

const getUser = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const user = await userService.getUserById(req.params.id);
    
    const duration = Date.now() - startTime;
    logger.info('User fetched successfully', { 
      userId: req.params.id,
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error fetching user', { 
      error: error.message, 
      userId: req.params.id,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const getUsers = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      isActive,
      isVerified
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined
    };

    const result = await userService.getUsers(options);
    
    const duration = Date.now() - startTime;
    logger.info('Users fetched successfully', { 
      count: result.users.length,
      total: result.pagination.total,
      page: result.pagination.page,
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      results: result.users.length,
      ...result
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error fetching users', { 
      error: error.message,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const updateUser = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Prevent password updates through this endpoint
    if (req.body.password) {
      return next(new AppError('Use /change-password endpoint to update password', 400));
    }

    const user = await userService.updateUser(req.params.id, req.body);
    
    const duration = Date.now() - startTime;
    logger.info('User updated successfully', { 
      userId: req.params.id,
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error updating user', { 
      error: error.message, 
      userId: req.params.id,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const changePassword = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Check if user is trying to change their own password or is admin
    if (req.user.id !== userId) {
      return next(new AppError('You can only change your own password', 403));
    }

    const result = await userService.changePassword(userId, currentPassword, newPassword);
    
    const duration = Date.now() - startTime;
    logger.info('Password changed successfully', { 
      userId,
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error changing password', { 
      error: error.message, 
      userId: req.params.id,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const deactivateUser = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const user = await userService.deactivateUser(req.params.id);
    
    const duration = Date.now() - startTime;
    logger.info('User deactivated successfully', { 
      userId: req.params.id,
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error deactivating user', { 
      error: error.message, 
      userId: req.params.id,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const deleteUser = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const user = await userService.softDeleteUser(req.params.id);
    
    const duration = Date.now() - startTime;
    logger.info('User soft deleted successfully', { 
      userId: req.params.id,
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error deleting user', { 
      error: error.message, 
      userId: req.params.id,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const getUserStats = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const stats = await userService.getUserStats();
    
    const duration = Date.now() - startTime;
    logger.info('User statistics fetched successfully', { 
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error fetching user statistics', { 
      error: error.message,
      duration: `${duration}ms`
    });
    next(error);
  }
});

const getCurrentUser = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const user = await userService.getUserById(req.user.id);
    
    const duration = Date.now() - startTime;
    logger.info('Current user fetched successfully', { 
      userId: req.user.id,
      duration: `${duration}ms`
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error fetching current user', { 
      error: error.message, 
      userId: req.user.id,
      duration: `${duration}ms`
    });
    next(error);
  }
});

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateUser,
  changePassword,
  deactivateUser,
  deleteUser,
  getUserStats,
  getCurrentUser
};
