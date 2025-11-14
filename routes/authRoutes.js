// External Imports
const express = require('express');
const upload = require('../middlewares/upload')

// Internal Imports
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// ✅ User Authentication Routes
router.post('/user/register', userController.register);
router.post('/user/login', userController.login);
router.get('/user/logout', authMiddleware, userController.logout);

// ✅ User Profile Routes
router.get('/user/profile', authMiddleware, userController.getProfile);
router.put('/user/profile', authMiddleware, userController.updateProfile);
router.post('/profile/image', authMiddleware, upload, userController.updateProfileImage);

// ✅ User Password Routes
router.put('/user/password-update', authMiddleware, userController.updatePassword);
router.post('/user/password-forgot', userController.forgotPassword);
router.put('/user/password-reset/:token', userController.resetPassword);

// ✅ User Watchlist Routes
router.get('/user/watchlist', authMiddleware, userController.getWatchlist);
router.post('/user/watchlist/:productId', authMiddleware, userController.addToWatchlist);
router.delete('/user/watchlist/:productId', authMiddleware, userController.removeFromWatchlist);

// ✅ Admin Only Routes
router.get('/admin/users', authMiddleware, authorizeRoles("admin"), userController.getAllUsers);
router.get('/admin/user/:id', authMiddleware, authorizeRoles("admin"), userController.getUserDetails);
// router.put('/admin/user/:id', authMiddleware, authorizeRoles("admin"), userController.updateUser);
router.delete('/admin/user/:id', authMiddleware, authorizeRoles("admin"), userController.deleteUser);
router.get('/admin/user/:id/watchlist', authMiddleware, authorizeRoles("admin"), userController.userWatchlist);
router.get('/admin/user/:id/cart', authMiddleware, authorizeRoles("admin"), userController.userCart);
router.get('/admin/user/:id/order', authMiddleware, authorizeRoles("admin"), userController.userOrder);

module.exports = router;