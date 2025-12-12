import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. Define the mock factory INLINE.
// This avoids hoisting issues because we don't rely on an outside variable.
jest.unstable_mockModule('express-rate-limit', () => {
  return {
    __esModule: true,
    default: jest.fn((options) => ({
      // We attach options to the return value so we can inspect them later
      _test_options: options,
      middleware: (req, res, next) => next(),
    })),
  };
});

describe('Rate Limiter Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Ensure the middleware file is re-evaluated
  });

  it('configures chatApiLimiter with a 1-hour window and 30 request limit', async () => {
    // 2. Retrieve the spy from the mocked module
    // We import it here to get the reference to the jest.fn() created in step 1
    const { default: rateLimitSpy } = await import('express-rate-limit');

    // 3. Import the middleware file
    // This executes the code, which calls our spy
    const { chatApiLimiter } = await import('../../middleware/rateLimiter.js');

    // 4. Verify the spy was called
    expect(rateLimitSpy).toHaveBeenCalled();

    // 5. Inspect the configuration
    // We can read the options directly from the object returned by our spy
    const config = chatApiLimiter._test_options;

    // 6. Assertions
    expect(config).toBeDefined();
    expect(config.windowMs).toBe(60 * 60 * 1000); // 1 hour
    expect(config.limit).toBe(30);
    expect(config.statusCode).toBe(429);
    expect(config.message.message).toContain('AI quota exceeded');
  });
});