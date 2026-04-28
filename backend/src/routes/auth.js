const express = require('express');
const { register, login, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteAccount);

module.exports = router;