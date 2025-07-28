// Edge Runtime compatibility test
// This simulates the Edge Runtime environment

// Mock Edge Runtime environment
globalThis.EdgeRuntime = 'edge-runtime';

// Import the logger
const { createLogger } = require('../dist/index.js');

// Test the logger
const logger = createLogger({
  environment: 'development',
  enableJSON: true,
  enableTimestamps: true,
  enableEmojis: true,
});

console.log('Testing Edge Runtime compatibility...');

// Test basic logging
logger.info('Hello from Edge Runtime!', { test: true });

// Test JSON logging
logger.error('Error test', { error: 'test error' });

// Test Next.js specific methods
logger.request(new Request('https://example.com'), { userId: 123 });
logger.response(new Response('OK'), { status: 200 });

console.log('✅ Edge Runtime compatibility test completed!');
