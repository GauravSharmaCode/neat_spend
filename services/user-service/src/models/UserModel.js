const { logWithMeta } = require('@gauravsharmacode/neat-logger');
const { prisma } = require('../config/database');

class UserModel {
  
  async create(userData) {
    const func = 'UserModel.create';
    try {
      logWithMeta('Creating user in database', { func, level: 'info', extra: { email: userData.email } });
      
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          phone: true,
          isActive: true,
          isVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logWithMeta('User created in database', { func, level: 'info', extra: { userId: user.id, email: user.email } });
      return user;
    } catch (error) {
      logWithMeta('Error creating user in database', { 
        func,
        level: 'error',
        extra: { error: error.message, email: userData.email } 
      });
      throw error;
    }
  }

  async findById(userId, includeDeleted = false) {
    const func = 'UserModel.findById';
    try {
      logWithMeta('Finding user by ID', { func, level: 'debug', extra: { userId } });
      
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
          role: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true
        }
      });

      if (user) {
        logWithMeta('User found by ID', { func, level: 'debug', extra: { userId } });
      }
      
      return user;
    } catch (error) {
      logWithMeta('Error finding user by ID', { func, level: 'error', extra: { error: error.message, userId } });
      throw error;
    }
  }

  async findByEmail(email, includePassword = false, includeDeleted = false) {
    const func = 'UserModel.findByEmail';
    try {
      logWithMeta('Finding user by email', { func, level: 'debug', extra: { email } });
      
      const selectFields = {
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
        updatedAt: true
      };

      if (includePassword) {
        selectFields.password = true;
      }

      const whereClause = { email };
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }

      const user = await prisma.user.findFirst({
        where: whereClause,
        select: selectFields
      });

      if (user) {
        logWithMeta('User found by email', { func, level: 'debug', extra: { email } });
      }
      
      return user;
    } catch (error) {
      logWithMeta('Error finding user by email', { func, level: 'error', extra: { error: error.message, email } });
      throw error;
    }
  }

  async checkExists({ email, phone }) {
    const func = 'UserModel.checkExists';
    try {
      logWithMeta('Checking if user exists', { func, level: 'debug', extra: { email, phone } });
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            ...(phone ? [{ phone }] : [])
          ],
          deletedAt: null
        },
        select: { id: true, email: true, phone: true }
      });

      if (existingUser) {
        logWithMeta('User existence check positive', { func, level: 'debug', extra: { email, phone, userId: existingUser.id } });
        return { exists: true, user: existingUser };
      }

      logWithMeta('User existence check negative', { func, level: 'debug', extra: { email, phone } });
      return { exists: false, user: null };
    } catch (error) {
      logWithMeta('Error checking user existence', { func, level: 'error', extra: { error: error.message, email, phone } });
      throw error;
    }
  }

  async findAll({ take = 10, skip = 0, includeDeleted = false }) {
    const func = 'UserModel.findAll';
    try {
      logWithMeta('Finding multiple users', { func, level: 'debug', extra: { take, skip } });
      const whereClause = {};
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }
      const users = await prisma.user.findMany({
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
          role: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      });

      logWithMeta('Found multiple users', { func, level: 'debug', extra: { count: users.length } });
      return users;
    } catch (error) {
      logWithMeta('Error finding multiple users', { func, level: 'error', extra: { error: error.message } });
      throw error;
    }
  }

  async count(includeDeleted = false) {
    const func = 'UserModel.count';
    try {
      logWithMeta('Counting users', { func, level: 'debug' });
      const whereClause = {};
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }
      const count = await prisma.user.count({ where: whereClause });
      logWithMeta('User count completed', { func, level: 'debug', extra: { count } });
      return count;
    } catch (error) {
      logWithMeta('Error counting users', { func, level: 'error', extra: { error: error.message } });
      throw error;
    }
  }

  async update(userId, updateData) {
    const func = 'UserModel.update';
    try {
      logWithMeta('Updating user in database', { func, level: 'info', extra: { userId } });
      
      const user = await prisma.user.update({
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
          role: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logWithMeta('User updated in database', { func, level: 'info', extra: { userId } });
      return user;
    } catch (error) {
      logWithMeta('Error updating user in database', { func, level: 'error', extra: { error: error.message, userId } });
      throw error;
    }
  }

  async softDelete(userId) {
    const func = 'UserModel.softDelete';
    try {
      logWithMeta('Soft deleting user in database', { func, level: 'info', extra: { userId } });
      
      const user = await prisma.user.update({
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

      logWithMeta('User soft deleted in database', { func, level: 'info', extra: { userId } });
      return user;
    } catch (error) {
      logWithMeta('Error soft deleting user in database', { func, level: 'error', extra: { error: error.message, userId } });
      throw error;
    }
  }

  async hardDelete(userId) {
    const func = 'UserModel.hardDelete';
    try {
      logWithMeta('Hard deleting user from database', { func, level: 'warn', extra: { userId } });
      
      await prisma.user.delete({
        where: { id: userId }
      });

      logWithMeta('User hard deleted from database', { func, level: 'warn', extra: { userId } });
      return true;
    } catch (error) {
      logWithMeta('Error hard deleting user from database', { func, level: 'error', extra: { error: error.message, userId } });
      throw error;
    }
  }

  async updateLastLogin(userId) {
    const func = 'UserModel.updateLastLogin';
    try {
      logWithMeta('Updating last login time', { func, level: 'info', extra: { userId } });
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() }
      });
      logWithMeta('Last login time updated', { func, level: 'info', extra: { userId } });
    } catch (error) {
      logWithMeta('Error updating last login time', { func, level: 'error', extra: { error: error.message, userId } });
      // We don't rethrow here as it's not a critical failure for the login process
    }
  }

  async findByPhone(phone, includeDeleted = false) {
    const func = 'UserModel.findByPhone';
    try {
      logWithMeta('Finding user by phone', { func, level: 'debug', extra: { phone } });
      const whereClause = { phone };
      if (!includeDeleted) {
        whereClause.deletedAt = null;
      }
      const user = await prisma.user.findFirst({ where: whereClause });
      if (user) {
        logWithMeta('User found by phone', { func, level: 'debug', extra: { phone, userId: user.id } });
      }
      return user;
    } catch (error) {
      logWithMeta('Error finding user by phone', { func, level: 'error', extra: { error: error.message, phone } });
      throw error;
    }
  }
}

module.exports = new UserModel();
