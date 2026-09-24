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

const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

setIO(io);

app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint (Returns HTTP 200 so Railway proxy considers service healthy)
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/database');
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(200).json({ status: 'ok', database: 'connecting/error', error: err.message, timestamp: new Date().toISOString() });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
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

const { createTables } = require('../database/migrate');

async function startServer() {
  // Bind server explicitly to 0.0.0.0 so Railway reverse proxy can route traffic
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });

  // Run migrations asynchronously in background
  try {
    console.log('Running database migrations...');
    await createTables();
    console.log('Database tables verified / created successfully.');
  } catch (error) {
    console.error('Database migration notice:', error.message);
  }
}

startServer();