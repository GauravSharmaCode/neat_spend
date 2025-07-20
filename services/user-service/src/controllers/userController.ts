import { Request, Response, NextFunction } from 'express';
import { logWithMeta } from '@gauravsharmacode/neat-logger';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import UserService from '../services/UserService';
import type { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserResponse, 
  UserListResponse,
  UserFilters 
} from '../interfaces';

type AsyncRequestHandler = (
  req: Request | AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

const catchAsync = (fn: AsyncRequestHandler) => {
  return (req: Request | AuthenticatedRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

const createUser = catchAsync(async (req: Request, res: Response) => {
  const func = 'userController.createUser';
  const createUserData = req.body as CreateUserRequest;
  
  logWithMeta('Request to create user', { 
    func, 
    level: 'info', 
    extra: { email: createUserData.email } 
  });
  
  const user: UserResponse = await UserService.createUser(createUserData);
  
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

const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const func = 'userController.getUser';
  const userId = req.params.id;
  
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }
  
  logWithMeta('Request to get user', { func, level: 'info', extra: { userId } });

  const user: UserResponse | null = await UserService.getUserById(userId);

  if (!user) {
    logWithMeta('User not found', { func, level: 'warn', extra: { userId } });
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

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const func = 'userController.getAllUsers';
  const filters = req.query as UserFilters;
  
  logWithMeta('Request to get all users', { func, level: 'info', extra: { filters } });

  const result: UserListResponse = await UserService.getAllUsers(filters);

  logWithMeta('Users retrieved successfully', { 
    func, 
    level: 'info', 
    extra: { 
      count: result.users.length,
      total: result.pagination.total 
    } 
  });

  res.status(200).json({
    status: 'success',
    ...result
  });
});

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const func = 'userController.updateUser';
  const userId = req.params.id;
  const updateData = req.body as UpdateUserRequest;
  
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }
  
  logWithMeta('Request to update user', { func, level: 'info', extra: { userId } });

  const user: UserResponse | null = await UserService.updateUser(userId, updateData);

  if (!user) {
    logWithMeta('User not found for update', { func, level: 'warn', extra: { userId } });
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

const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const func = 'userController.deleteUser';
  const userId = req.params.id;
  
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }
  
  logWithMeta('Request to delete user', { func, level: 'info', extra: { userId } });

  await UserService.softDeleteUser(userId);

  logWithMeta('User deleted successfully', { func, level: 'info', extra: { userId } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const getMe = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.id) {
    req.params.id = req.user.id;
  }
  next();
};

const updateMe = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const func = 'userController.updateMe';
  const userId = req.user?.id;
  
  if (!userId) {
    return next(new AppError('Authentication required', 401));
  }
  
  logWithMeta('Request to update current user (me)', { func, level: 'info', extra: { userId } });

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /change-password', 400));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody: UpdateUserRequest = {};
  const allowedFields = ['firstName', 'lastName', 'phone'];
  
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) {
      (filteredBody as any)[el] = req.body[el];
    }
  });

  // 3) Update user document
  const updatedUser: UserResponse | null = await UserService.updateUser(userId, filteredBody);

  if (!updatedUser) {
    logWithMeta('Current user not found for update', { func, level: 'warn', extra: { userId } });
    return next(new AppError('User not found', 404));
  }

  logWithMeta('Current user updated successfully', { func, level: 'info', extra: { userId: updatedUser.id } });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

const deleteMe = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const func = 'userController.deleteMe';
  const userId = req.user?.id;
  
  if (!userId) {
    return next(new AppError('Authentication required', 401));
  }
  
  logWithMeta('Request to delete current user (me)', { func, level: 'info', extra: { userId } });

  await UserService.softDeleteUser(userId);

  logWithMeta('Current user deleted successfully', { func, level: 'info', extra: { userId } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const func = 'userController.getUserStats';
  logWithMeta('Request for user stats', { func, level: 'info' });
  
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
});

const changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const func = 'userController.changePassword';
  const userId = req.user?.id;
  
  if (!userId) {
    return next(new AppError('Authentication required', 401));
  }
  
  logWithMeta('Request to change password', { func, level: 'info', extra: { userId } });
  
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
});

export {
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
