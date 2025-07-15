const express = require('express');
const userController = require('../controllers/userController');
const { userValidation, paginationValidation } = require('../middleware/validation');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Current user routes
router.get('/me', userController.getMe, userController.getUser);
router.patch('/me', userValidation.update, userController.updateMe);
router.delete('/me', userController.deleteMe);

// User management routes - admin only for most operations
router.get('/stats', restrictTo('admin'), userController.getUserStats);
router.get('/', restrictTo('admin'), paginationValidation, userController.getAllUsers);

// Admin-only user creation
router.post('/', restrictTo('admin'), userValidation.create, userController.createUser);

router
  .route('/:id')
  .get(userValidation.params, userController.getUser)
  .patch(userValidation.params, userValidation.update, restrictTo('admin'), userController.updateUser)
  .delete(userValidation.params, restrictTo('admin'), userController.deleteUser);

router.patch(
  '/:id/change-password',
  userValidation.params,
  userValidation.changePassword,
  restrictTo('admin'),
  userController.changePassword
);

module.exports = router;
