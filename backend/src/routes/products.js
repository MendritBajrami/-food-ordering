const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct } = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, adminOnly, createProduct);
router.put('/:id', authMiddleware, adminOnly, updateProduct);

module.exports = router;