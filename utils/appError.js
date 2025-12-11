// src/utils/AppError.js

class AppError extends Error {
  /**
   * @param {string} message - The error message
   * @param {number} statusCode - The HTTP status code (e.g., 404, 400)
   */
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    
    // Categorize error: 400s are 'fail', 500s are 'error'
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // 'Operational' means it's a known error we planned for (like "User not found")
    // as opposed to a bug (like "variable is undefined")
    this.isOperational = true;

    // Capture stack trace but exclude this constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;