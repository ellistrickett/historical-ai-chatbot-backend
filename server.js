/**
 * @file server.js
 * @description Application entry point. Handles server startup and graceful shutdown.
 */
import 'dotenv/config';
import { app } from './app.js';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error("Error occurred, server can't start", error);
  });

  /**
   * Gracefully shuts down the server.
   * Closes the HTTP server and exits the process.
   */
  const shutdown = () => {
    console.log('Received kill signal, shutting down gracefully...');
    server.close(() => {
      console.log('Closed out remaining connections.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}