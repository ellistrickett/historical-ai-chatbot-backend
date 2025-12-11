import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // Recommended for security
import morgan from 'morgan'; // Recommended for logging
import 'dotenv/config';

import chatRoutes from './routes/chatRoutes.js';
import { loadPersonas } from './services/personaService.js';

/**
 * Express application instance.
 * @type {express.Application}
 */
export const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================
// Helmet helps secure your app by setting various HTTP headers
app.use(helmet()); 

// CORS configuration (Open to all currently, restrict this in production)
app.use(cors());

// Request logging (only runs in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static('public'));

// ==========================================
// INITIALIZATION
// ==========================================
// Wrap initialization in a try/catch in case loading fails
try {
  loadPersonas();
} catch (error) {
  console.error("Critical Error: Failed to load personas on startup.", error);
  process.exit(1); // Exit if essential data fails to load
}

// ==========================================
// ROUTES
// ==========================================
app.use('/api', chatRoutes);

// ==========================================
// GLOBAL ERROR HANDLER
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

// ==========================================
// SERVER START
// ==========================================
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
  });

  // Handle server startup errors (e.g., EADDRINUSE)
  server.on('error', (error) => {
    console.error("Error occurred, server can't start", error);
  });
}