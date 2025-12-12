import rateLimit from 'express-rate-limit';

// This limit is specifically for the expensive AI conversation endpoint.
export const chatApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30, // Max 30 AI requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  // Ensure the message format matches your global error handler's response structure
  message: {
    message:
      'AI quota exceeded. Please limit conversation requests to 30 per hour.',
  },
});
