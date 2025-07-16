const { createLogger } = require('../lib/index');

console.log('=== Unified Formatting System Demo ===\n');

// Test different formatting approaches
console.log('1. Elegant Formatting (Default):');
const elegantLogger = createLogger({
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  showHeader: true,
});
elegantLogger.info('User authentication successful', { userId: 123 });
elegantLogger.warn('Database connection slow', { responseTime: 2500 });
elegantLogger.error('API request failed', { status: 500 });

console.log('\n2. Compact Formatting:');
const compactLogger = createLogger({
  environment: 'development',
  enableColors: true,
  enableEmojis: false,
  showHeader: true,
});
compactLogger.info('Compact timestamp and level only');
compactLogger.warn('Minimal header format');

console.log('\n3. Minimal Formatting (showHeader: false):');
const minimalLogger = createLogger({
  showHeader: false,
  enableColors: true,
});
minimalLogger.info('Clean, minimal output');
minimalLogger.warn('Just the message and color');

console.log('\n4. Structured Formatting (Production-like):');
const structuredLogger = createLogger({
  environment: 'production',
  enableJSON: false, // Will use structured format
  enableColors: false,
  enableEmojis: false,
});
structuredLogger.info('Structured JSON for log aggregation', {
  user: { id: 123, name: 'John' },
  action: 'login',
});

console.log('\n5. JSON Output Mode:');
const jsonLogger = createLogger({
  enableJSON: true,
  prettyJSON: 2,
});
jsonLogger.info('Full JSON with all metadata', {
  nested: { data: 'with context' },
  timestamp: new Date().toISOString(),
});

console.log('\n6. Table Logging (Unified Format):');
const tableLogger = createLogger({
  environment: 'development',
  enableColors: true,
});
tableLogger.table('User Data', [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' },
  { id: 3, name: 'Charlie', role: 'user' },
]);

console.log('\n=== Unified Formatting Benefits ===');
console.log('✅ Consistent formatting across all methods');
console.log('✅ Centralized formatting logic');
console.log('✅ Easy to customize per level');
console.log('✅ Professional output in all environments');
console.log('✅ Backward compatibility maintained');
console.log('✅ Multiple format options: elegant, compact, structured, minimal');
