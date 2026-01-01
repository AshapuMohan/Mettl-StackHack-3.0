const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const categoryRoutes = require('./routes/categories');
const sellerRoutes = require('./routes/sellers');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.CLIENT_URL,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   }
// });
app.use(cors({
  origin: [
    "https://mettl-stack-hack-3-0.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Middleware to check MongoDB connection
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database connection not ready', 
      status: 'connecting' 
    });
  }
  next();
});

// Socket.io for real-time delivery tracking
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'OK', 
    message: 'Marketplace API is running',
    database: {
      status: dbStatusText[dbStatus] || 'unknown',
      readyState: dbStatus
    },
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    console.log(`Database URL: ${process.env.MONGODB_URI}`)
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
  // Try to reconnect
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Initialize database connection
connectDB();

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
