const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logWithMeta } = require('@gauravsharmacode/neat-logger');
const config = require('../config');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const func = 'hashPassword';
  try {
    const hash = await bcrypt.hash(password, config.security.bcryptRounds);
    logWithMeta('Password hashed successfully', { func, level: 'debug' });
    return hash;
  } catch (error) {
    logWithMeta('Error hashing password', { func, level: 'error', extra: { error: error.message } });
    throw error;
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} candidatePassword - Plain text password
 * @param {string} userPassword - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const correctPassword = async (candidatePassword, userPassword) => {
  const func = 'correctPassword';
  try {
    const isValid = await bcrypt.compare(candidatePassword, userPassword);
    logWithMeta('Password comparison completed', { func, level: 'debug', extra: { isValid } });
    return isValid;
  } catch (error) {
    logWithMeta('Error comparing passwords', { func, level: 'error', extra: { error: error.message } });
    throw error;
  }
};

/**
 * Generate a JWT token for a user
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const signToken = (userId) => {
  const func = 'signToken';
  try {
    const token = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    logWithMeta('JWT signed successfully', { func, level: 'info', extra: { userId } });
    return token;
  } catch (error) {
    logWithMeta('Error signing JWT', { func, level: 'error', extra: { error: error.message, userId } });
    throw new Error('Error signing token');
  }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Decoded payload
 */
const verifyToken = async (token) => {
  const func = 'verifyToken';
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        logWithMeta('JWT verification failed', { func, level: 'warn', extra: { error: err.message } });
        return reject(new Error('Failed to authenticate token'));
      }
      logWithMeta('JWT verified successfully', { func, level: 'debug', extra: { userId: decoded.id } });
      resolve(decoded);
    });
  });
};

module.exports = {
  hashPassword,
  correctPassword,
  signToken,
  verifyToken,
};
