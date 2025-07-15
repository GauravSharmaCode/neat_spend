describe('validation', () => {
  it('should export an object', () => {
    const validation = require('../index');
    expect(typeof validation).toBe('object');
  });
});
