// =====================================================
// HOTEL MANAGEMENT SYSTEM - SERVER ENTRY POINT
// Express.js backend server configuration
// =====================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { checkConnection } from './database/config.sqlite.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import roomRoutes from './routes/room.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import foodRoutes from './routes/food.routes.js';
import eventRoutes from './routes/event.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// =====================================================
// MIDDLEWARE CONFIGURATION
// =====================================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================================================
// API ROUTES
// =====================================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await checkConnection();
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// API version prefix
const apiPrefix = '/api';

// Auth routes
app.use(`${apiPrefix}/auth`, authRoutes);

// Room routes
app.use(`${apiPrefix}/rooms`, roomRoutes);

// Booking routes
app.use(`${apiPrefix}/bookings`, bookingRoutes);

// Food & Beverage routes
app.use(`${apiPrefix}/food`, foodRoutes);

// Event routes
app.use(`${apiPrefix}/events`, eventRoutes);

// Admin routes
app.use(`${apiPrefix}/admin`, adminRoutes);

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =====================================================
// SERVER INITIALIZATION
// =====================================================

const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await checkConnection();
    if (dbConnected) {
      console.log('✅ Database connected successfully');
    } else {
      console.warn('⚠️  Database connection failed - server will start but DB operations may fail');
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Hotel Management API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
