import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import chatRoutes from './routes/chatRoutes.js';
import { loadPersonas } from './services/personaService.js';

/**
 * Express application instance.
 * @type {express.Application}
 */
export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

loadPersonas();

app.use('/api', chatRoutes);

/**
 * Global error handler middleware.
 * @param {Error} err - The error object.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'test') {
  /**
   * Starts the server listening on the configured port.
   */
  app.listen(process.env.PORT, (error) => {
    if (!error)
      console.log(
        'Server is Successfully Running, and App is listening on port ' +
          process.env.PORT
      );
    else console.log("Error occurred, server can't start", error);
  });
}
