// Test colored console output (not pure JSON)
const { createLogger } = require('../lib');

const logger = createLogger({
  enableJSON: false, // Use console output for colors
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
});

console.log('🎨 Testing Colored Console Output\n');

logger.info('This will be colored and formatted nicely');
logger.debug('Debug message with colors');
logger.warn('Warning with yellow color');
logger.error('Error with red color');

// Test with data
logger.info('User action', { userId: '123', action: 'login' });
logger.error('Database error', {
  error: 'Connection failed',
  code: 'ECONNREFUSED',
});
