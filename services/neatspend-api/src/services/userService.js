const { createLogger } = require('@gauravsharmacode/neat-logger');
const { prisma } = require('../prisma');
const { AppError } = require('../middleware/errorHandler');
const { hashPassword, correctPassword } = require('../middleware/auth');
const config = require('../config');

const logger = createLogger({
  service: 'user-service',
  level: config.logging.level
});

class UserService {
  
  async createUser(userData) {
    try {
      logger.info('Creating new user', { email: userData.email });

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            ...(userData.phone ? [{ phone: userData.phone }] : [])
          ],
          deletedAt: null
        }
      });

      if (existingUser) {
        throw new AppError('User with this email or phone already exists', 409);
      }

      // Hash password if provided
      let hashedPassword = null;
      if (userData.password) {
        hashedPassword = await hashPassword(userData.password);
      }

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          phone: userData.phone,
          isActive: true,
          isVerified: false
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info('User created successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Error creating user', { error: error.message, email: userData.email });
      throw error;
    }
  }

  async getUserById(userId, includeDeleted = false) {
    try {
      logger.info('Fetching user by ID', { userId });

      const whereClause = { id: userId };
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      const user = await prisma.user.findFirst({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          phone: true,
          isActive: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info('User fetched successfully', { userId });
      return user;
    } catch (error) {
      logger.error('Error fetching user', { error: error.message, userId });
      throw error;
    }
  }

  async getUserByEmail(email, includePassword = false) {
    try {
      logger.info('Fetching user by email', { email });

      const selectFields = {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      };

      if (includePassword) {
        selectFields.password = true;
      }

      const user = await prisma.user.findFirst({
        where: { 
          email,
          deletedAt: null 
        },
        select: selectFields
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info('User fetched successfully', { email });
      return user;
    } catch (error) {
      logger.error('Error fetching user by email', { error: error.message, email });
      throw error;
    }
  }

  async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        isActive,
        isVerified,
        includeDeleted = false
      } = options;

      logger.info('Fetching users with pagination', { page, limit, sortBy, sortOrder });

      const skip = (page - 1) * limit;
      
      const whereClause = {};
      
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      if (typeof isActive === 'boolean') {
        whereClause.isActive = isActive;
      }

      if (typeof isVerified === 'boolean') {
        whereClause.isVerified = isVerified;
      }

      if (search) {
        whereClause.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            phone: true,
            isActive: true,
            isVerified: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            _count: {
              select: {
                transactions: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.user.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(total / limit);

      const result = {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };

      logger.info('Users fetched successfully', { count: users.length, total });
      return result;
    } catch (error) {
      logger.error('Error fetching users', { error: error.message });
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      logger.info('Updating user', { userId });

      // Check if user exists
      await this.getUserById(userId);

      // Check for email uniqueness if email is being updated
      if (updateData.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: updateData.email,
            id: { not: userId },
            deletedAt: null
          }
        });

        if (existingUser) {
          throw new AppError('Email already in use by another user', 409);
        }
      }

      // Check for phone uniqueness if phone is being updated
      if (updateData.phone) {
        const existingUser = await prisma.user.findFirst({
          where: {
            phone: updateData.phone,
            id: { not: userId },
            deletedAt: null
          }
        });

        if (existingUser) {
          throw new AppError('Phone number already in use by another user', 409);
        }
      }

      // Update name if firstName or lastName is provided
      if (updateData.firstName || updateData.lastName) {
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true }
        });

        const firstName = updateData.firstName || currentUser.firstName || '';
        const lastName = updateData.lastName || currentUser.lastName || '';
        updateData.name = `${firstName} ${lastName}`.trim();
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          phone: true,
          isActive: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info('User updated successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Error updating user', { error: error.message, userId });
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      logger.info('Changing password for user', { userId });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true, isActive: true }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 403);
      }

      if (!user.password || !(await correctPassword(currentPassword, user.password))) {
        throw new AppError('Current password is incorrect', 400);
      }

      const hashedNewPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      });

      logger.info('Password changed successfully', { userId });
      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Error changing password', { error: error.message, userId });
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      logger.info('Deactivating user', { userId });

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          isActive: true,
          updatedAt: true
        }
      });

      logger.info('User deactivated successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Error deactivating user', { error: error.message, userId });
      throw error;
    }
  }

  async softDeleteUser(userId) {
    try {
      logger.info('Soft deleting user', { userId });

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          isActive: true,
          deletedAt: true,
          updatedAt: true
        }
      });

      logger.info('User soft deleted successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Error soft deleting user', { error: error.message, userId });
      throw error;
    }
  }

  async getUserStats() {
    try {
      logger.info('Fetching user statistics');

      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        recentUsers
      ] = await Promise.all([
        prisma.user.count({
          where: { deletedAt: null }
        }),
        prisma.user.count({
          where: { 
            isActive: true,
            deletedAt: null 
          }
        }),
        prisma.user.count({
          where: { 
            isVerified: true,
            deletedAt: null 
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            },
            deletedAt: null
          }
        })
      ]);

      const stats = {
        totalUsers,
        activeUsers,
        verifiedUsers,
        recentUsers,
        inactiveUsers: totalUsers - activeUsers,
        unverifiedUsers: totalUsers - verifiedUsers
      };

      logger.info('User statistics fetched successfully', stats);
      return stats;
    } catch (error) {
      logger.error('Error fetching user statistics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new UserService();
