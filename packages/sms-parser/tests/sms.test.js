describe('sms-parser', () => {
  it('should export an object', () => {
    const smsParser = require('../index');
    expect(typeof smsParser).toBe('object');
  });
});
