// JSON Test for LogHorn
// This example shows JSON output functionality

const { createLogger } = require('../lib');

// Create logger with explicit JSON configuration
const logger = createLogger({
  enableJSON: true,
  prettyJSON: 2,
  enableColors: false, // Disable colors for cleaner JSON output
  enableEmojis: false, // Disable emojis for cleaner JSON output
});

console.log('📄 Testing LogHorn JSON Output\n');

// Test different log levels with JSON output
logger.info('This is an info message');
logger.debug('This is a debug message');
logger.warn('This is a warning message');
logger.error('This is an error message');

// Test with data
logger.info('User action', {
  userId: '123',
  action: 'login',
  timestamp: new Date(),
});
logger.error('Database error', {
  error: 'Connection failed',
  code: 'ECONNREFUSED',
  stack: new Error().stack,
});

// Test with complex data
logger.debug('Complex object', {
  user: {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  },
  session: {
    id: 'sess_123',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  },
});

console.log('\n✨ JSON test completed!');
