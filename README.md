# Loghorn 🎺

A powerful, flexible, and production-ready logging library for Node.js and browsers
with support for multiple frameworks and environments.

[![npm version](https://badge.fury.io/js/loghorn.svg)](https://badge.fury.io/js/loghorn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Features

- 🚀 **Universal**: Works in Node.js, browsers, and all major frameworks
- 🎨 **Beautiful**: Colored output, emojis, and customizable formatting
- 📊 **Structured**: JSON logging with context and metadata
- 🕒 **Timing**: Built-in performance measurement
- 📋 **Tables**: Console table support with fallback
- 📁 **Groups**: Organized logging with collapsible groups
- 🔧 **Flexible**: Extensive configuration options
- 🛡️ **Robust**: Production-ready with error handling
- 🧪 **Tested**: Comprehensive test coverage
- 🌍 **Environment-aware**: Automatic configuration based on NODE_ENV
- 🔌 **Framework Integration**: Express, Fastify, NestJS, React, Vue, Angular,
  Next.js

## 📦 Installation

```bash
npm install loghorn
# or
yarn add loghorn
# or
pnpm add loghorn
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { Logger } from 'loghorn';

const logger = new Logger();

logger.info('Hello, World!');
logger.success('Operation completed!');
logger.error('Something went wrong', error);
```

### Using the Default Logger

```javascript
import { error, info, logger, success } from 'loghorn';

info('Application started');
success('User logged in successfully');
error('Database connection failed', error);
```

### Environment-Based Configuration

Loghorn automatically configures itself based on your `NODE_ENV`:

- **Development**: Colorful output with emojis and debug logs
- **Production**: JSON format, no colors, minimal logging
- **Test**: JSON format, minimal output
- **Staging**: Balanced configuration for testing

## 📚 API Reference

### Core Methods

#### Basic Logging

```javascript
logger.trace('Detailed debugging information');
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message', error);
logger.log('Generic log message');
```

#### Specialized Methods

```javascript
logger.success('Operation completed successfully');
logger.failure('Operation failed');
logger.start('Starting process');
logger.end('Process completed');
```

#### Context Management

```javascript
logger.setContext({ userId: '123', requestId: 'req-456' });
logger.clearContext();
```

### Group Logging

Organize related log messages into collapsible groups:

#### Basic Groups

```javascript
logger.group('User Authentication', () => {
  logger.info('Starting authentication process');
  logger.info('Validating credentials');
  logger.success('User authenticated successfully');
});
```

#### Collapsed Groups

```javascript
logger.groupCollapsed('Database Operations', () => {
  logger.info('Connecting to database');
  logger.info('Executing query');
  logger.success('Database operation completed');
});
```

#### Async Groups

```javascript
await logger.groupAsync('API Request Processing', async () => {
  logger.info('Initiating API request');

  // Simulate async operation
  const response = await fetch('/api/data');

  logger.info('Processing response');
  logger.success('API request completed successfully');
});
```

#### Nested Groups with Context

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

### Timing

Measure performance with built-in timing:

```javascript
logger.time('Database Query');
// ... perform operation
logger.timeEnd('Database Query');
```

### Table Logging

Display structured data in table format:

```javascript
const users = [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
  { name: 'Bob', age: 35, city: 'Chicago' },
];

logger.table('User Data', users);
```

## ⚙️ Configuration

### Basic Configuration

```javascript
import { Logger } from 'loghorn';

const logger = new Logger({
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  enableStackTraces: true,
  enableJSON: false,
  enableTable: true,
});
```

### Advanced Configuration

```javascript
const logger = new Logger({
  environment: 'production',
  logLevels: {
    trace: { enabled: false, color: '#6f42c1', emoji: '🔍' },
    debug: { enabled: false, color: '#6c757d', emoji: '🐛' },
    info: { enabled: true, color: '#17a2b8', emoji: 'ℹ️' },
    warn: { enabled: true, color: '#ffc107', emoji: '⚠️' },
    error: { enabled: true, color: '#dc3545', emoji: '❌' },
    log: { enabled: true, color: '#28a745', emoji: '📝' },
  },
  customColors: {
    success: '#28a745',
    failure: '#dc3545',
  },
  customEmojis: {
    success: '✅',
    failure: '❌',
  },
  prettyJSON: 2, // 2-space indentation for JSON
});
```

### Environment Variables

Configure Loghorn using environment variables:

```bash
# Environment
LOGHORN_ENVIRONMENT=production

# Features
LOGHORN_ENABLE_COLORS=true
LOGHORN_ENABLE_EMOJIS=true
LOGHORN_ENABLE_TIMESTAMPS=true
LOGHORN_ENABLE_STACK_TRACES=false
LOGHORN_ENABLE_JSON=true
LOGHORN_ENABLE_TABLE=true

# Log Levels
LOGHORN_DEBUG_ENABLED=false
LOGHORN_TRACE_ENABLED=false

# Middleware
LOGHORN_MIDDLEWARE_ENABLED=true
LOGHORN_MIDDLEWARE_LOG_REQUESTS=false
LOGHORN_MIDDLEWARE_LOG_RESPONSES=false
LOGHORN_MIDDLEWARE_LOG_ERRORS=true
LOGHORN_MIDDLEWARE_EXCLUDE_PATHS=/health,/metrics
```

## 🔌 Framework Integration

### Express.js

```javascript
import express from 'express';
import { createLoggingMiddleware, logger } from 'loghorn';

const app = express();

// Basic middleware
app.use(createLoggingMiddleware(logger));

// Custom middleware configuration
app.use(
  createLoggingMiddleware(logger, {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    excludePaths: ['/health', '/metrics'],
  }),
);
```

### Fastify

```javascript
import Fastify from 'fastify';
import { fastifyLoghorn } from 'loghorn';

const fastify = Fastify();

// Register the plugin
await fastify.register(fastifyLoghorn, { logger });
```

### NestJS

```javascript
import { NestJSLogger } from 'loghorn';

const logger = new NestJSLogger({
  enableDecorators: true,
  enableInterceptors: true,
  enableGuards: true,
});

app.useLogger(logger);
```

### React

```javascript
import { ReactLogger } from 'loghorn';

const logger = new ReactLogger({
  enableComponentLogging: true,
  enableHookLogging: true,
  enableStateLogging: true,
});
```

### Vue

```javascript
import { VueLogger } from 'loghorn';

const logger = new VueLogger({
  enableComponentLogging: true,
  enableLifecycleLogging: true,
  enableReactivityLogging: true,
});
```

### Angular

```javascript
import { AngularLogger } from 'loghorn';

const logger = new AngularLogger({
  enableComponentLogging: true,
  enableServiceLogging: true,
  enableGuardLogging: true,
});
```

### Next.js

```javascript
import { NextJSLogger } from 'loghorn';

const logger = new NextJSLogger({
  enableSSRLogging: true,
  enableAPILogging: true,
  enablePageLogging: true,
});
```

## 🌍 Environment Configurations

### Development

- ✅ Colors enabled
- ✅ Emojis enabled
- ✅ Timestamps enabled
- ✅ Stack traces enabled
- ✅ Debug and trace logs enabled
- ✅ Request/response logging

### Production

- ❌ Colors disabled
- ❌ Emojis disabled
- ✅ Timestamps enabled
- ❌ Stack traces disabled
- ❌ Debug and trace logs disabled
- ❌ Request/response logging (errors only)

### Test

- ❌ Colors disabled
- ❌ Emojis disabled
- ❌ Timestamps disabled
- ❌ Stack traces disabled
- ✅ JSON format
- ❌ All middleware disabled

### Staging

- ✅ Colors enabled
- ✅ Emojis enabled
- ✅ Timestamps enabled
- ✅ Stack traces enabled
- ✅ JSON format
- ✅ Request/response logging

## 🔧 Advanced Usage

### Custom Color Management

```javascript
import { ColorManager } from 'loghorn';

const colorManager = new ColorManager({
  enableColors: true,
  customColors: {
    success: '#28a745',
    failure: '#dc3545',
    custom: '#6f42c1',
  },
});
```

### Factory Function

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  enableColors: true,
  enableEmojis: true,
});
```

### Error Handling

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

### Async Error Handling

```javascript
try {
  await logger.groupAsync('Async Error Demo', async () => {
    logger.info('Starting async operation');

    // Simulate async error
    await Promise.reject(new Error('Async error'));

    logger.info('This should not be reached');
  });
} catch (error) {
  logger.error('Caught async error outside group');
}
```

## 🛡️ Production Features

- **Circular Reference Safe**: Handles circular references gracefully
- **Memory Protection**: Hard limits on data sizes to prevent memory issues
- **Error Recovery**: Never crashes your application
- **Performance Optimized**: Efficient string operations and minimal overhead
- **Type Safe**: Full TypeScript support with comprehensive type definitions
- **Environment Detection**: Automatic configuration based on NODE_ENV
- **Middleware Support**: Built-in Express and Fastify middleware
- **Framework Integration**: Native support for popular frameworks

## 📊 Performance

Loghorn is designed for high-performance logging:

- **Minimal Overhead**: Efficient string operations and conditional logging
- **Memory Safe**: Automatic truncation of large log entries
- **Async Ready**: Non-blocking async operations
- **Production Optimized**: Disabled features in production for maximum performance

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for
details.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/loghorn.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes
6. Run tests: `npm test`
7. Submit a pull request

### Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run lint` to check for issues
- Run `npm run lint:fix` to automatically fix issues
- Run `npm run format` to format code with Prettier

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for
details.

## 👨‍💻 Author

**Nasr Aldin** - [@nasraldin](https://github.com/nasraldin)

- Website: [https://nasraldin.com](https://nasraldin.com)
- Email: ns@nasraldin.com

## 🙏 Acknowledgments

- Built with TypeScript for type safety
- Uses Chalk for beautiful terminal colors
- Safe-stable-stringify for reliable JSON serialization
- Comprehensive test suite with Jest

---

**Made with ❤️ by Nasr Aldin**
