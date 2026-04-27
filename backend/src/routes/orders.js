const express = require('express');
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, getTodayStats } = require('../controllers/orderController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', createOrder);
router.get('/', authMiddleware, adminOnly, getAllOrders);
router.get('/stats', authMiddleware, adminOnly, getTodayStats);
router.get('/:id', authMiddleware, adminOnly, getOrderById);
router.patch('/:id', authMiddleware, adminOnly, updateOrderStatus);

module.exports = router;