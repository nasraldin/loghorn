// Debug color issues
const { createLogger } = require('../lib');

console.log('🔍 Testing Color Debug\n');

// Test each log level individually
const logger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
});

console.log('Testing each log level:');
logger.info('INFO message');
logger.error('ERROR message');
logger.warn('WARN message');
logger.debug('DEBUG message');
logger.trace('TRACE message');
logger.logMessage('LOG message');

console.log('\nTesting with data:');
logger.info('Info with data', { test: 'data' });
logger.error('Error with data', { error: 'test' });
