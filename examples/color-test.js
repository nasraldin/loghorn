// Color Test for LogHorn
// This example shows the colored output in different environments

const {
  info,
  debug,
  warn,
  error,
  success,
  failure,
  start,
  end,
} = require('../lib');

console.log('🎨 Testing LogHorn Colors\n');

// Test different log levels
info('This is an info message');
debug('This is a debug message');
warn('This is a warning message');
error('This is an error message');

// Test convenience methods
success('Operation completed successfully!');
failure('Operation failed!');
start('Starting process...');
end('Process completed!');

// Test with data
info('User action', { userId: '123', action: 'login' });
error('Database error', new Error('Connection failed'));

console.log('\n✨ Color test completed!');
