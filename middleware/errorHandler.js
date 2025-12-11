// src/middleware/errorHandler.js

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // 1. Get defaults (if it's a crash/bug, these won't be set on the error object)
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Internal Server Error';

  // 2. Logging Strategy
  if (statusCode === 500) {
    // For 500s (Bugs/Crashes): Log the full stack trace so you can fix it
    console.error('💥 SERVER ERROR:', err);
  } else {
    // For 4xx (Operational): Just log the warning (e.g., "Chat 123 not found")
    console.warn(`⚠️  [${statusCode}] ${message}`);
  }

  // 3. Send Response to Client
  res.status(statusCode).json({
    status: status,
    message: message,
    // Only show stack trace in development for easier debugging
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};