const { AppError, globalErrorHandler } = require('../index');

describe('AppError', () => {
  it('should set statusCode and status', () => {
    const err = new AppError('fail', 400);
    expect(err.statusCode).toBe(400);
    expect(err.status).toBe('fail');
  });
});

describe('globalErrorHandler', () => {
  it('should send error response', () => {
    const err = new AppError('fail', 400);
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    globalErrorHandler(err, req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: 'fail', message: 'fail' });
  });
});
