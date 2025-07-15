const { Logger } = require('../dist');

// Create a logger instance
const logger = new Logger({
  level: 'info',
  enableEmojis: true,
  enableTimestamps: true,
  enableJSON: false,
  logLevels: {
    trace: { enabled: true },
    debug: { enabled: true },
    info: { enabled: true },
    warn: { enabled: true },
    error: { enabled: true },
  },
});

// Example 1: Basic group logging
console.log('\n=== Basic Group Logging ===');
logger.group('User Authentication', () => {
  logger.info('Starting authentication process');
  logger.info('Validating credentials');
  logger.success('User authenticated successfully');
});

// Example 2: Collapsed group logging
console.log('\n=== Collapsed Group Logging ===');
logger.groupCollapsed('Database Operations', () => {
  logger.info('Connecting to database');
  logger.info('Executing query');
  logger.info('Processing results');
  logger.success('Database operation completed');
});

// Example 3: Async group logging
console.log('\n=== Async Group Logging ===');
async function demonstrateAsyncGroups() {
  await logger.groupAsync('API Request Processing', async () => {
    logger.info('Initiating API request');

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    logger.info('Processing response');
    logger.success('API request completed successfully');
  });
}

// Example 4: Nested groups with context
console.log('\n=== Nested Groups with Context ===');
logger.group('Order Processing', () => {
  logger.setContext({ orderId: '12345', userId: 'user123' });
  logger.info('Starting order processing');

  logger.group('Payment Processing', () => {
    logger.setContext({ paymentMethod: 'credit_card' });
    logger.info('Validating payment method');
    logger.info('Processing payment');
    logger.success('Payment processed successfully');
  });

  logger.group('Inventory Check', () => {
    logger.info('Checking inventory levels');
    logger.info('Reserving items');
    logger.success('Inventory reserved');
  });

  logger.success('Order processed successfully');
});

// Example 5: Error handling in groups
console.log('\n=== Error Handling in Groups ===');
logger.group('Error Handling Demo', () => {
  logger.info('Starting operation');

  try {
    throw new Error('Simulated error');
  } catch (error) {
    logger.error('Operation failed', error);
  }

  logger.info('Error handled gracefully');
});

// Example 6: Async error handling
console.log('\n=== Async Error Handling ===');
async function demonstrateAsyncErrorHandling() {
  try {
    await logger.groupAsync('Async Error Demo', async () => {
      logger.info('Starting async operation');

      // Simulate async error
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Async error')), 50),
      );

      logger.info('This should not be reached');
    });
  } catch (error) {
    logger.error('Caught async error outside group');
  }
}

// Run the examples
async function runExamples() {
  await demonstrateAsyncGroups();
  await demonstrateAsyncErrorHandling();

  console.log('\n=== Group Logging Examples Completed ===');
}

runExamples().catch(console.error);
