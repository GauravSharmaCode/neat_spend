const { logWithMeta } = require('../index');

describe('logWithMeta', () => {
  it('should log a message with metadata', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logWithMeta('Test message', { foo: 'bar' });
    expect(spy).toHaveBeenCalledWith('Test message', { foo: 'bar' });
    spy.mockRestore();
  });
});
