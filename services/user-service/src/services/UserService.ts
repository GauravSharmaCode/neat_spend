import { logWithMeta } from '@gauravsharmacode/neat-logger';
import { hashPassword, correctPassword } from '../utils/auth';
import UserModel from '../models/UserModel';
import type { 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserResponse, 
  UserListResponse,
  UserFilters,
  User
} from '../interfaces';

interface ServiceError extends Error {
  statusCode?: number;
}

class UserService {
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const func = 'createUser';
    try {
      logWithMeta('Attempting to create a new user', { 
        func, 
        level: 'info', 
        extra: { email: userData.email } 
      });

      const checkData: { email?: string; phone?: string } = { email: userData.email };
      if (userData.phone) {
        checkData.phone = userData.phone;
      }

      const { exists, user: existingUser } = await UserModel.checkExists(checkData);

      if (exists && existingUser) {
        const conflictField = existingUser.email === userData.email ? 'email' : 'phone';
        const error: ServiceError = new Error(`User with this ${conflictField} already exists`);
        error.statusCode = 409;
        throw error;
      }

      let hashedPassword: string | null = null;
      if (userData.password) {
        hashedPassword = await hashPassword(userData.password);
      }

      const userCreateData: any = {
        email: userData.email,
        role: 'user' as const,
        isActive: true,
        isVerified: false,
      };

      // Add optional fields only if they exist
      if (hashedPassword) userCreateData.password = hashedPassword;
      if (userData.firstName) userCreateData.firstName = userData.firstName;
      if (userData.lastName) userCreateData.lastName = userData.lastName;
      if (userData.phone) userCreateData.phone = userData.phone;
      
      // Add computed name if firstName or lastName exists
      if (userData.firstName || userData.lastName) {
        userCreateData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      }

      const newUser: UserResponse = await UserModel.create(userCreateData);

      logWithMeta('User created successfully', { 
        func, 
        level: 'info', 
        extra: { userId: newUser.id, email: newUser.email } 
      });
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error creating user', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, email: userData.email } 
      });
      throw error;
    }
  }

  async getUserById(userId: string, includeDeleted: boolean = false): Promise<UserResponse | null> {
    const func = 'getUserById';
    try {
      logWithMeta('Fetching user by ID', { func, level: 'info', extra: { userId } });

      const user: UserResponse | null = await UserModel.findById(userId, includeDeleted);

      if (!user) {
        const error: ServiceError = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      logWithMeta('User fetched successfully', { func, level: 'info', extra: { userId } });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error fetching user', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, userId } 
      });
      throw error;
    }
  }

  async getAllUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const func = 'getAllUsers';
    try {
      logWithMeta('Fetching all users with filters', { 
        func, 
        level: 'info', 
        extra: { filters } 
      });

      const result: UserListResponse = await UserModel.findMany(filters);

      logWithMeta('Users fetched successfully', { 
        func, 
        level: 'info', 
        extra: { count: result.users.length, total: result.pagination.total } 
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error fetching users', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage } 
      });
      throw error;
    }
  }

  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<UserResponse | null> {
    const func = 'updateUser';
    try {
      logWithMeta('Updating user', { func, level: 'info', extra: { userId, updateData } });

      const updatedUser: UserResponse | null = await UserModel.update(userId, updateData);

      if (!updatedUser) {
        const error: ServiceError = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      logWithMeta('User updated successfully', { func, level: 'info', extra: { userId } });
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error updating user', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, userId } 
      });
      throw error;
    }
  }

  async authenticateUser(email: string, inputPassword: string): Promise<UserResponse> {
    const func = 'authenticateUser';
    try {
      logWithMeta('Authenticating user', { func, level: 'info', extra: { email } });

      const user: User | null = await UserModel.findByEmail(email, true);
      if (!user) {
        const error: ServiceError = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      if (!user.isActive) {
        const error: ServiceError = new Error('Account is deactivated. Please contact support.');
        error.statusCode = 401;
        throw error;
      }

      if (!user.password || !(await correctPassword(inputPassword, user.password))) {
        const error: ServiceError = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      await UserModel.updateLastLogin(user.id);

      // Remove password and convert to response format
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userFields } = user;
      
      const userResponse: UserResponse = {
        ...userFields,
        lastLoginAt: userFields.lastLoginAt?.toISOString(),
        createdAt: userFields.createdAt.toISOString(),
        updatedAt: userFields.updatedAt.toISOString(),
      } as UserResponse;

      logWithMeta('User authenticated successfully', { 
        func, 
        level: 'info', 
        extra: { email, userId: user.id } 
      });
      return userResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error authenticating user', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, email } 
      });
      throw error;
    }
  }

  async softDeleteUser(userId: string): Promise<UserResponse | null> {
    const func = 'softDeleteUser';
    try {
      logWithMeta('Soft deleting user', { func, level: 'info', extra: { userId } });

      const updatedUser: UserResponse | null = await UserModel.softDelete(userId);

      logWithMeta('User soft deleted successfully', { func, level: 'info', extra: { userId } });
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error soft deleting user', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, userId } 
      });
      throw error;
    }
  }
}

export default new UserService();
