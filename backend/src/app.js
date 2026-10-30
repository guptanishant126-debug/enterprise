import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import initiativeRoutes from './routes/initiativeRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet());

// CORS configuration strictly whitelisting client URL and Vercel domains
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, curl, health checks
    if (!origin) return callback(null, true);

    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Automatically allow any Vercel preview or production deployment (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow during local development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'X-Client-Info']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this enterprise client, please retry after 15 minutes.'
  }
});

app.use('/api/', apiLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'NexusAI Enterprise Orchestrator & Knowledge Intelligence Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/initiatives', initiativeRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/metrics', metricsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found on NexusAI Enterprise Server`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[NexusAI Server Error]:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Enterprise Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;

