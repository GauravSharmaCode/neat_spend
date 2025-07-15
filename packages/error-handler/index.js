// Error Handler - shared error handling
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}
function globalErrorHandler(err, req, res, next) {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message
  });
}
module.exports = { AppError, globalErrorHandler };
