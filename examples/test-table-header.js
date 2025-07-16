// Test table logging with header options
const { createLogger } = require('../lib');

console.log('📊 Testing Table Logging with Header Options\n');

// Test with default headers
const defaultLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
});
defaultLogger.setContext({ projectName: 'my-app' });

console.log('📋 Default table format:');
defaultLogger.table('User Data', [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
]);

// Test with no headers
const noHeaderLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showHeader: false,
});
noHeaderLogger.setContext({ projectName: 'my-app' });

console.log('\n🚫 Table with no header:');
noHeaderLogger.table('User Data', [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
]);

// Test with custom header options
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

console.log('\n✨ Custom table format:');
customLogger.table('User Data', [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
]);
