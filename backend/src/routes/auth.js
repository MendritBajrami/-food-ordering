const express = require('express');
const { register, login, getMe, updateProfile, deleteAccount, getAllUsers, adminAddUser, adminUpdateUser, adminDeleteUser } = require('../controllers/authController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteAccount);

// Admin User Management
router.get('/users', authMiddleware, adminOnly, getAllUsers);
router.post('/users', authMiddleware, adminOnly, adminAddUser);
router.patch('/users/:id', authMiddleware, adminOnly, adminUpdateUser);
router.delete('/users/:id', authMiddleware, adminOnly, adminDeleteUser);

module.exports = router;