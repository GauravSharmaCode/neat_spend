// services/user-service/src/services/UserService.js

const { logWithMeta } = require('@gauravsharmacode/neat-logger');
const UserModel = require('../models/UserModel');
const { hashPassword, correctPassword } = require('../utils/auth');

class UserService {
  async createUser(userData) {
    const func = 'createUser'; // For logging metadata
    try {
      logWithMeta('Attempting to create a new user', { func, level: 'info', extra: { email: userData.email } });

      const { exists, user: existingUser } = await UserModel.checkExists({
        email: userData.email,
        phone: userData.phone,
      });

      if (exists) {
        const conflictField = existingUser.email === userData.email ? 'email' : 'phone';
        const error = new Error(`User with this ${conflictField} already exists`);
        error.statusCode = 409;
        throw error;
      }

      let hashedPassword = null;
      if (userData.password) {
        hashedPassword = await hashPassword(userData.password);
      }

      const userCreateData = {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        phone: userData.phone,
        role: userData.role || 'user',
        isActive: true,
        isVerified: false,
      };

      const newUser = await UserModel.create(userCreateData);

      logWithMeta('User created successfully', { func, level: 'info', extra: { userId: newUser.id, email: newUser.email } });
      return newUser;
    } catch (error) {
      logWithMeta('Error creating user', { func, level: 'error', extra: { error: error.message, email: userData.email } });
      throw error;
    }
  }

  async getUserById(userId, includeDeleted = false) {
    const func = 'getUserById';
    try {
      logWithMeta('Fetching user by ID', { func, level: 'info', extra: { userId } });

      const user = await UserModel.findById(userId, includeDeleted);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      logWithMeta('User fetched successfully', { func, level: 'info', extra: { userId } });
      return user;
    } catch (error) {
      logWithMeta('Error fetching user', { func, level: 'error', extra: { error: error.message, userId } });
      throw error;
    }
  }

  async authenticateUser(email, password) {
    const func = 'authenticateUser';
    try {
      logWithMeta('Authenticating user', { func, level: 'info', extra: { email } });

      const user = await UserModel.findByEmail(email, true);
      if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      if (!user.isActive) {
        const error = new Error('Account is deactivated. Please contact support.');
        error.statusCode = 401;
        throw error;
      }

      if (!user.password || !(await correctPassword(password, user.password))) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      await UserModel.updateLastLogin(user.id);

      delete user.password;

      logWithMeta('User authenticated successfully', { func, level: 'info', extra: { email, userId: user.id } });
      return user;
    } catch (error) {
      logWithMeta('Error authenticating user', { func, level: 'error', extra: { error: error.message, email } });
      throw error;
    }
  }

  // ... other methods like getUsers, updateUser, etc. would be updated similarly ...
  // Example for one more method:
  async softDeleteUser(userId) {
    const func = 'softDeleteUser';
    try {
      logWithMeta('Soft deleting user', { func, level: 'info', extra: { userId } });

      const updatedUser = await UserModel.softDelete(userId);

      logWithMeta('User soft deleted successfully', { func, level: 'info', extra: { userId } });
      return updatedUser;
    } catch (error) {
      logWithMeta('Error soft deleting user', { func, level: 'error', extra: { error: error.message, userId } });
      throw error;
    }
  }
}

module.exports = new UserService();