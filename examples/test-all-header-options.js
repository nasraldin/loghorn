// Test ALL logging methods with header options
const { createLogger } = require('../lib');

console.log('🎛️ Testing ALL Logging Methods with Header Options\n');

// Create logger with no headers
const noHeaderLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showHeader: false,
});
noHeaderLogger.setContext({ projectName: 'my-app' });

console.log('🚫 ALL methods with no header:');
noHeaderLogger.info('Info message');
noHeaderLogger.error('Error message');
noHeaderLogger.warn('Warning message');
noHeaderLogger.debug('Debug message');
noHeaderLogger.trace('Trace message');
noHeaderLogger.logMessage('Log message');

// Test convenience methods
noHeaderLogger.success('Success message');
noHeaderLogger.failure('Failure message');
noHeaderLogger.start('Start message');
noHeaderLogger.end('End message');

// Test table logging
noHeaderLogger.table('User Data', [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 },
]);

// Test time logging
noHeaderLogger.time('Test Timer');
noHeaderLogger.timeEnd('Test Timer');

// Test group logging
noHeaderLogger.group('Test Group', () => {
  noHeaderLogger.info('Inside group');
});

console.log('\n✨ Custom header format:');
const customLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showEmoji: true,
  showTimestamp: false,
  showLevel: true,
  showProjectName: false,
});
customLogger.setContext({ projectName: 'my-app' });

customLogger.info('Custom format message');
customLogger.error('Custom format error');
customLogger.table('Custom Table', [{ test: 'data' }]);
