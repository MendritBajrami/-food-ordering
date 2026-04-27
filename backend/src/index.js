require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const { setIO } = require('./controllers/orderController');
const { JWT_SECRET } = require('./middleware/auth');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

setIO(io);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-admin', async (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = require('./config/database');
      const result = await db.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
      
      if (result.rows.length > 0 && result.rows[0].role === 'admin') {
        socket.join('admin');
        socket.emit('admin-joined', { success: true });
        console.log('Admin joined:', socket.id);
      } else {
        socket.emit('admin-joined', { success: false, error: 'Not authorized' });
      }
    } catch (error) {
      socket.emit('admin-joined', { success: false, error: 'Invalid token' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});