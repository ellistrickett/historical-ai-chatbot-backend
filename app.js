/**
 * @file app.js
 * @description Express application setup and configuration.
 * Includes middleware, routes, and global error handling.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import chatRoutes from './routes/chatRoutes.js';
import { loadPersonas } from './services/personaService.js';

/**
 * Express application instance.
 * @type {express.Application}
 */
export const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ==========================================
// 2. INITIALIZATION
// ==========================================
try {
  loadPersonas();
} catch (error) {
  // This outer catch block will execute if personas fail to load
  console.error(
    '🚨 Critical Error: Failed to load personas and start server.',
    error
  );
  process.exit(1); // Explicitly stop the server
}

// ==========================================
// 3. ROUTES
// ==========================================
app.use('/api', chatRoutes);

// ==========================================
// 4. CATCH 404 (UNKNOWN ROUTES)
// ==========================================
// This must be placed AFTER your routes but BEFORE the global error handler.
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.statusCode = 404;
  next(error); // Pass error to the Global Handler below
});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error('Unhandled Error:', err.stack);
  } else {
    console.warn(`[${statusCode}] ${message}`);
  }

  res.status(statusCode).json({ message });
});
