// Test elegant console output
const { createLogger } = require('../lib');

// Create logger with elegant output (default)
const logger = createLogger({
  enableJSON: false, // Use elegant console output
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
});

// Set project context
logger.setContext({ projectName: 'my-app' });

console.log('🎨 Testing Elegant Console Output\n');

// Test different log levels
logger.info('Document', {
  props: {
    locale: 'en',
    title: "Sorry we couldn't find this page.",
  },
});

logger.debug('Debug message');
logger.warn('Warning message');
logger.error('Error message');

// Test with complex data
logger.info('User action', {
  userId: '123',
  action: 'login',
  timestamp: new Date(),
  metadata: {
    browser: 'Chrome',
    version: '120.0.0',
  },
});

console.log('\n✨ Elegant output test completed!');
