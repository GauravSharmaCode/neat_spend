describe('db-utils', () => {
  it('should export an object', () => {
    const dbUtils = require('../index');
    expect(typeof dbUtils).toBe('object');
  });
});
