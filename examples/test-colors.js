// Test Node.js colors
const { createLogger } = require('../lib');

const logger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
});

console.log('🎨 Testing Node.js Colors\n');

logger.info('This should be cyan');
logger.error('This should be red');
logger.warn('This should be yellow');
logger.debug('This should be gray');
