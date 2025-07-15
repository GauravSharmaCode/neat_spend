// Export shared utilities
// Note: For logging, use @gauravsharmacode/neat-logger directly in your services
const database = require('./database');

module.exports = {
  ...database
};
