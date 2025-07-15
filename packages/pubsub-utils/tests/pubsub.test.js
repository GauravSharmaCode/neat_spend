describe('pubsub-utils', () => {
  it('should export an object', () => {
    const pubsubUtils = require('../index');
    expect(typeof pubsubUtils).toBe('object');
  });
});
