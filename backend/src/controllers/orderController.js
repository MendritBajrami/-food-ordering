const db = require('../config/database');

let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const createOrder = async (req, res) => {
  let client;
  try {
    const { customer_name, phone, address, delivery_type, items } = req.body;

    if (!customer_name || !phone || !delivery_type || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer name, phone, delivery type, and items are required' });
    }

    client = await db.getClient();
    await client.query('BEGIN');

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product with id ${item.product_id} not found` });
      }
      const product = productResult.rows[0];
      const itemTotal = parseFloat(product.price) * item.quantity;
      totalPrice += itemTotal;
      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price
      });
    }

    const userId = req.user ? req.user.id : null;
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, customer_name, phone, address, delivery_type, total_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, customer_name, phone, address, delivery_type, totalPrice]
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price_at_purchase]
      );
    }

    await client.query('COMMIT');

    if (io) {
      io.to('admin').emit('new-order', { order });
    }

    res.status(201).json({ order });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (client) client.release();
  }
};

const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, 
        json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price_at_purchase', oi.price_at_purchase)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT o.*, 
        json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price_at_purchase', oi.price_at_purchase)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: pending, preparing, ready, or delivered' });
    }

    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (io) {
      io.to('admin').emit('order-updated', { order_id: id, status });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTodayStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT COUNT(*) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    res.json({
      stats: {
        total_orders: parseInt(result.rows[0].total_orders),
        total_revenue: parseFloat(result.rows[0].total_revenue)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(`
      SELECT o.*, 
        json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price_at_purchase', oi.price_at_purchase)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);
    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createOrder, getAllOrders, getUserOrders, getOrderById, updateOrderStatus, getTodayStats, setIO };