// Simple JSON test
const { createLogger } = require('../lib');

const logger = createLogger({
  enableJSON: true,
  prettyJSON: 2,
  enableColors: false,
  enableEmojis: false,
});

console.log('Testing JSON output...');
logger.info('Test message');
logger.error('Test error', { error: 'test' });
