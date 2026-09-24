const express = require('express');
const { authMiddleware, optionalAuth, adminOnly } = require('../middleware/auth');
const { createOrder, getAllOrders, getUserOrders, getOrderById, updateOrderStatus, getTodayStats } = require('../controllers/orderController');

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/', authMiddleware, adminOnly, getAllOrders);
router.get('/my', authMiddleware, getUserOrders);
router.get('/stats', authMiddleware, adminOnly, getTodayStats);
router.get('/:id', authMiddleware, getOrderById);
router.patch('/:id', authMiddleware, adminOnly, updateOrderStatus);

module.exports = router;