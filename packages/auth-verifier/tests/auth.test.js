const { verifyToken } = require('../index');

describe('verifyToken', () => {
  it('should call next()', () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
