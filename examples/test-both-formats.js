// Test both colored JSON and colored console output
const { createLogger } = require('../lib');

console.log('🎨 Testing Both Formats\n');

// Option 1: Colored JSON output
console.log('📄 Colored JSON Output:');
const jsonLogger = createLogger({
  enableJSON: true,
  enableColors: true,
  prettyJSON: 2,
});

jsonLogger.info('This will be colored JSON');
jsonLogger.error('Error in colored JSON', { error: 'test' });

console.log('\n🎨 Colored Console Output:');
const consoleLogger = createLogger({
  enableJSON: false,
  enableColors: true,
  enableEmojis: true,
});

consoleLogger.info('This will be colored console');
consoleLogger.error('Error in colored console', { error: 'test' });
