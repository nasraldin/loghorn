# Loghorn

A powerful, flexible, and production-ready logging library for Node.js and browsers with support for multiple frameworks.

## Features

- 🚀 **Universal**: Works in Node.js, browsers, and all major frameworks
- 🎨 **Beautiful**: Colored output, emojis, and customizable formatting
- 📊 **Structured**: JSON logging with context and metadata
- 🕒 **Timing**: Built-in performance measurement
- 📋 **Tables**: Console table support with fallback
- 📁 **Groups**: Organized logging with collapsible groups
- 🔧 **Flexible**: Extensive configuration options
- 🛡️ **Robust**: Production-ready with error handling
- 🧪 **Tested**: Comprehensive test coverage

## Quick Start

```javascript
import { Logger } from 'loghorn';

const logger = new Logger({
  level: 'info',
  enableEmojis: true,
  enableTimestamps: true
});

logger.info('Hello, World!');
logger.success('Operation completed!');
logger.error('Something went wrong', error);
```

## Group Logging

Loghorn provides powerful group logging capabilities to organize related log messages:

### Basic Groups

```javascript
logger.group('User Authentication', () => {
  logger.info('Starting authentication process');
  logger.info('Validating credentials');
  logger.success('User authenticated successfully');
});
```

### Collapsed Groups

```javascript
logger.groupCollapsed('Database Operations', () => {
  logger.info('Connecting to database');
  logger.info('Executing query');
  logger.success('Database operation completed');
});
```

### Async Groups

```javascript
await logger.groupAsync('API Request Processing', async () => {
  logger.info('Initiating API request');

  // Simulate async operation
  await fetch('/api/data');

  logger.info('Processing response');
  logger.success('API request completed successfully');
});
```

### Nested Groups with Context

```javascript
logger.group('Order Processing', () => {
  logger.setContext({ orderId: '12345', userId: 'user123' });
  logger.info('Starting order processing');

  logger.group('Payment Processing', () => {
    logger.setContext({ paymentMethod: 'credit_card' });
    logger.info('Validating payment method');
    logger.success('Payment processed successfully');
  });

  logger.group('Inventory Check', () => {
    logger.info('Checking inventory levels');
    logger.success('Inventory reserved');
  });

  logger.success('Order processed successfully');
});
```

### Error Handling in Groups

```javascript
logger.group('Error Handling Demo', () => {
  logger.info('Starting operation');

  try {
    throw new Error('Simulated error');
  } catch (error) {
    logger.error('Operation failed', error);
  }

  logger.info('Error handled gracefully');
});
```

### Group Features

- **Native Support**: Uses `console.group()` when available
- **Fallback**: Custom indentation for environments without native support
- **Context Propagation**: Groups inherit and can extend parent context
- **Error Handling**: Graceful error handling with proper cleanup
- **Async Support**: Full async/await support with proper error propagation
- **Nested Groups**: Support for unlimited nesting levels
- **Collapsed Groups**: Option to start groups in collapsed state

## Table Logging

Loghorn supports table logging with automatic fallback:

```javascript
const data = [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
  { name: 'Bob', age: 35, city: 'Chicago' }
];

logger.table('User Data', data);
```

## Timing

Measure performance with built-in timing:

```javascript
logger.time('Database Query');
// ... perform operation
logger.timeEnd('Database Query');
```

## Configuration

```javascript
const logger = new Logger({
  level: 'info',                    // Minimum log level
  enableEmojis: true,              // Enable emoji support
  enableTimestamps: true,          // Include timestamps
  enableJSON: false,               // JSON output format
  enableStackTraces: true,         // Include stack traces
  enableTable: true,               // Enable table logging
  logLevels: {                     // Configure individual levels
    trace: { enabled: true },
    debug: { enabled: true },
    info: { enabled: true },
    warn: { enabled: true },
    error: { enabled: true }
  }
});
```

## Framework Integration

### Express.js

```javascript
import { expressMiddleware } from 'loghorn';

app.use(expressMiddleware(logger));
```

### Fastify

```javascript
import { fastifyPlugin } from 'loghorn';

fastify.register(fastifyPlugin, { logger });
```

### NestJS

```javascript
import { NestJSLogger } from 'loghorn';

const logger = new NestJSLogger();
app.useLogger(logger);
```

## Production Features

- **Circular Reference Safe**: Handles circular references gracefully
- **Memory Protection**: Hard limits on data sizes
- **Error Recovery**: Never crashes your application
- **Performance Optimized**: Efficient string operations
- **Type Safe**: Full TypeScript support

## Installation

```bash
npm install loghorn
```

## License

MIT
