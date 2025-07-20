import { logWithMeta } from '@gauravsharmacode/neat-logger';
import type { 
  CreateUserRequest,
  UpdateUserRequest,
  User, 
  UserResponse, 
  UserListResponse,
  UserFilters 
} from '../interfaces';
import { prisma } from '../config/database';

// Helper function to convert Prisma user to UserResponse
const convertToUserResponse = (user: any): UserResponse => {
  const { ...userWithoutDeleted } = user;
  return {
    ...userWithoutDeleted,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    name: user.name || undefined,
    phone: user.phone || undefined,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  } as UserResponse;
};

// Prisma select fields for safe user data (without password)
const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  name: true,
  phone: true,
  isActive: true,
  isVerified: true,
  role: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

// Prisma select fields including password (for authentication)
const userSelectWithPassword = {
  ...safeUserSelect,
  password: true,
} as const;

interface ExistsResult {
  exists: boolean;
  user?: User;
}

class UserModel {
  async create(userData: CreateUserRequest & { 
    password?: string | null; 
    name?: string; 
    role?: string; 
    isActive?: boolean; 
    isVerified?: boolean; 
  }): Promise<UserResponse> {
    const func = 'UserModel.create';
    try {
      logWithMeta('Creating user in database', { 
        func, 
        level: 'info', 
        extra: { email: userData.email } 
      });
      
      const user = await prisma.user.create({
        data: userData,
        select: safeUserSelect
      });

      logWithMeta('User created in database', { 
        func, 
        level: 'info', 
        extra: { userId: user.id, email: user.email } 
      });
      
      // Convert dates to strings for response
      return convertToUserResponse(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error creating user in database', { 
        func,
        level: 'error',
        extra: { error: errorMessage, email: userData.email } 
      });
      throw error;
    }
  }

  async findById(userId: string, includeDeleted: boolean = false): Promise<UserResponse | null> {
    const func = 'UserModel.findById';
    try {
      logWithMeta('Finding user by ID', { func, level: 'debug', extra: { userId } });
      
      const whereClause: any = { id: userId };
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      const user = await prisma.user.findFirst({
        where: whereClause,
        select: safeUserSelect
      });

      if (user) {
        logWithMeta('User found by ID', { func, level: 'debug', extra: { userId } });
        
        // Convert dates to strings for response
        return convertToUserResponse(user);
      }
      
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error finding user by ID', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, userId } 
      });
      throw error;
    }
  }

  async findByEmail(email: string, includePassword: boolean = false, includeDeleted: boolean = false): Promise<User | null> {
    const func = 'UserModel.findByEmail';
    try {
      logWithMeta('Finding user by email', { func, level: 'debug', extra: { email } });
      
      const whereClause: any = { email };
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      const selectFields = includePassword ? userSelectWithPassword : safeUserSelect;

      const user = await prisma.user.findFirst({
        where: whereClause,
        select: selectFields
      });

      if (user) {
        logWithMeta('User found by email', { func, level: 'debug', extra: { email } });
      }
      
      return user as User | null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error finding user by email', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, email } 
      });
      throw error;
    }
  }

  async checkExists({ email, phone }: { email?: string; phone?: string }): Promise<ExistsResult> {
    const func = 'UserModel.checkExists';
    try {
      logWithMeta('Checking if user exists', { func, level: 'debug', extra: { email, phone } });

      const whereConditions = [];
      if (email) whereConditions.push({ email });
      if (phone) whereConditions.push({ phone });

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: whereConditions,
          deletedAt: null
        },
        select: { id: true, email: true, phone: true }
      });

      const result: ExistsResult = {
        exists: !!existingUser,
        user: (existingUser as User) || undefined
      };

      logWithMeta('User existence check completed', { 
        func, 
        level: 'debug', 
        extra: { exists: result.exists } 
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error checking user existence', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage } 
      });
      throw error;
    }
  }

  async findMany(filters: UserFilters = {}): Promise<UserListResponse> {
    const func = 'UserModel.findMany';
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeDeleted = false
      } = filters;

      const skip = (page - 1) * limit;

      logWithMeta('Finding users with filters', { 
        func, 
        level: 'debug', 
        extra: { page, limit, search, sortBy, sortOrder } 
      });

      // Build where clause
      const whereClause: any = {};
      
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      if (search) {
        whereClause.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count for pagination
      const total = await prisma.user.count({ where: whereClause });

      // Get users
      const users = await prisma.user.findMany({
        where: whereClause,
        select: safeUserSelect,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      });

      // Convert dates to strings for response
      const userResponses: UserResponse[] = users.map((user: any) => ({
        ...user,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }));

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const result: UserListResponse = {
        users: userResponses,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext,
          hasPrev,
        }
      };

      logWithMeta('Found users with filters', { 
        func, 
        level: 'debug', 
        extra: { count: users.length, total } 
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error finding users with filters', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage } 
      });
      throw error;
    }
  }

  async update(userId: string, updateData: UpdateUserRequest): Promise<UserResponse | null> {
    const func = 'UserModel.update';
    try {
      logWithMeta('Updating user in database', { 
        func, 
        level: 'info', 
        extra: { userId } 
      });

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: safeUserSelect
      });

      logWithMeta('User updated in database', { 
        func, 
        level: 'info', 
        extra: { userId } 
      });

      // Convert dates to strings for response
      return convertToUserResponse(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error updating user in database', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, userId } 
      });
      throw error;
    }
  }

  async softDelete(userId: string): Promise<UserResponse | null> {
    const func = 'UserModel.softDelete';
    try {
      logWithMeta('Soft deleting user', { func, level: 'info', extra: { userId } });

      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          deletedAt: new Date(),
          isActive: false 
        },
        select: safeUserSelect
      });

      logWithMeta('User soft deleted', { func, level: 'info', extra: { userId } });

      // Convert dates to strings for response
      return convertToUserResponse(user);
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

  async updateLastLogin(userId: string): Promise<void> {
    const func = 'UserModel.updateLastLogin';
    try {
      logWithMeta('Updating last login timestamp', { 
        func, 
        level: 'debug', 
        extra: { userId } 
      });

      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
      });

      logWithMeta('Last login timestamp updated', { 
        func, 
        level: 'debug', 
        extra: { userId } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logWithMeta('Error updating last login timestamp', { 
        func, 
        level: 'error', 
        extra: { error: errorMessage, userId } 
      });
      throw error;
    }
  }
}

export default new UserModel();
