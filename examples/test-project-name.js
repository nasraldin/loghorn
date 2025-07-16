// Test project name from environment variables
const { createLogger } = require('../lib');

console.log('🏷️ Testing Project Name Functionality\n');

// Test 1: No project name set
console.log('1. No project name:');
const logger1 = createLogger();
logger1.info('This log has no project name');

// Test 2: Project name from context
console.log('\n2. Project name from context:');
const logger2 = createLogger();
logger2.setContext({ projectName: 'my-app' });
logger2.info('This log has project name from context');

// Test 3: Project name from config
console.log('\n3. Project name from config:');
const logger3 = createLogger({ projectName: 'config-app' });
logger3.info('This log has project name from config');

// Test 4: Project name from environment variable (if set)
console.log('\n4. Project name from environment:');
const logger4 = createLogger();
logger4.info('This log may have project name from environment');

console.log('\n✨ Project name test completed!');
console.log('\nTo test with environment variables, run:');
