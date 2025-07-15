const { logWithMeta } = require('@gauravsharmacode/neat-logger');
const UserService = require('../services/UserService');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const createUser = catchAsync(async (req, res, next) => {
  const func = 'userController.createUser';
  logWithMeta('Request to create user', { func, level: 'info', extra: { email: req.body.email } });
  
  const user = await UserService.createUser(req.body);
  
  logWithMeta('User created successfully via controller', { 
    func,
    level: 'info',
    extra: { 
      userId: user.id, 
      email: user.email,
    }
  });

  res.status(201).json({
    status: 'success',
    data: {
      user
    }
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const func = 'userController.getUser';
  logWithMeta('Request to get user', { func, level: 'info', extra: { userId: req.params.id } });

  const user = await UserService.getUserById(req.params.id);

  if (!user) {
    logWithMeta('User not found in controller', { func, level: 'warn', extra: { userId: req.params.id } });
    return next(new AppError('No user found with that ID', 404));
  }

  logWithMeta('User retrieved successfully', { func, level: 'info', extra: { userId: user.id } });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

const getAllUsers = catchAsync(async (req, res, next) => {
  const func = 'userController.getAllUsers';
  logWithMeta('Request to get all users', { func, level: 'info' });

  // Basic filtering, sorting, pagination can be added here
  const users = await UserService.getUsers(req.query);

  logWithMeta('All users retrieved successfully', { func, level: 'info', extra: { count: users.length } });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const func = 'userController.updateUser';
  logWithMeta('Request to update user', { func, level: 'info', extra: { userId: req.params.id } });

  const user = await UserService.updateUser(req.params.id, req.body);

  if (!user) {
    logWithMeta('User not found for update', { func, level: 'warn', extra: { userId: req.params.id } });
    return next(new AppError('No user found with that ID', 404));
  }

  logWithMeta('User updated successfully', { func, level: 'info', extra: { userId: user.id } });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const func = 'userController.deleteUser';
  logWithMeta('Request to delete user', { func, level: 'info', extra: { userId: req.params.id } });

  await UserService.softDeleteUser(req.params.id);

  logWithMeta('User deleted successfully', { func, level: 'info', extra: { userId: req.params.id } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  const func = 'userController.updateMe';
  logWithMeta('Request to update current user (me)', { func, level: 'info', extra: { userId: req.user.id } });

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email');

  // 3) Update user document
  const updatedUser = await UserService.updateUser(req.user.id, filteredBody);

  logWithMeta('Current user updated successfully', { func, level: 'info', extra: { userId: updatedUser.id } });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  const func = 'userController.deleteMe';
  logWithMeta('Request to delete current user (me)', { func, level: 'info', extra: { userId: req.user.id } });

  await UserService.softDeleteUser(req.user.id);

  logWithMeta('Current user deleted successfully', { func, level: 'info', extra: { userId: req.user.id } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getUserStats = catchAsync(async (req, res, next) => {
  const func = 'userController.getUserStats';
  logWithMeta('Request for user stats', { func, level: 'info' });
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
});

const changePassword = catchAsync(async (req, res, next) => {
  const func = 'userController.changePassword';
  logWithMeta('Request to change password', { func, level: 'info', extra: { userId: req.params.id } });
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
});

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
  getUserStats,
  changePassword,
};
