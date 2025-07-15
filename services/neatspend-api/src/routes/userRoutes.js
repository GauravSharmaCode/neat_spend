const express = require('express');
const userController = require('../controllers/userController');
const { userValidation, paginationValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', userValidation.create, userController.createUser);

// Protected routes - require authentication
router.use(protect);

// Current user routes
router.get('/me', userController.getCurrentUser);
router.patch('/me', userValidation.update, userController.updateUser);

// User management routes
router.get('/stats', userController.getUserStats);
router.get('/', paginationValidation, userController.getUsers);

router
  .route('/:id')
  .get(userValidation.params, userController.getUser)
  .patch(userValidation.params, userValidation.update, userController.updateUser)
  .delete(userValidation.params, userController.deleteUser);

router.patch(
  '/:id/change-password',
  userValidation.params,
  userValidation.changePassword,
  userController.changePassword
);

router.patch(
  '/:id/deactivate',
  userValidation.params,
  userController.deactivateUser
);

module.exports = router;
