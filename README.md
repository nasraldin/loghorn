# Loghorn 🦄

A powerful, flexible, and production-ready logging library for Node.js and browsers
with support for multiple frameworks and environments.

[![npm version](https://badge.fury.io/js/loghorn.svg)](https://badge.fury.io/js/loghorn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **Universal**: Works in Node.js and browsers
- **Framework Support**: Express, Fastify, Next.js
- **Environment Aware**: Automatic configuration based on environment
- **Professional Output**: Elegant console output with colors and emojis
- **Structured Logging**: JSON format for production environments
- **Header Customization**: Control emoji, timestamp, level, and project name
  display
- **Group Logging**: Organize logs with collapsible groups
- **Table Logging**: Beautiful table output for data visualization
- **Context Management**: Add request IDs, user info, and custom context
- **Performance Tracking**: Built-in timing and performance logging
- **Error Handling**: Comprehensive error logging with stack traces
- **Middleware**: Request/response logging for web frameworks

## 🚀 Quick Start

### 📦 Installation

```bash
npm install loghorn
# or
yarn add loghorn
# or
pnpm add loghorn
```

### Basic Usage

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger();

logger.info('Hello, LogHorn!');
logger.warn('This is a warning');
logger.error('Something went wrong', { error: 'details' });
```

### Framework Integration

#### Express.js

```javascript
import express from 'express';
import { createLogger, createLoggingMiddleware } from 'loghorn';

const app = express();
const logger = createLogger();

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

#### Fastify

```javascript
import Fastify from 'fastify';
import { createLogger, fastifyLoghorn } from 'loghorn';

const fastify = Fastify();
const logger = createLogger();

// Register the plugin
await fastify.register(fastifyLoghorn, { logger });
```

#### Next.js

```javascript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger({
  enableSSRLogging: true,
  enableAPILogging: true,
  enablePageLogging: true,
});
```

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
logger.group('User Session', { userId: '123' }, () => {
  logger.info('Session started');

  logger.group('Database Query', () => {
    logger.info('Executing SELECT query');
    logger.info('Query completed', { rows: 42 });
  });

  logger.success('Session completed');
});
```

### Table Logging

Display data in beautiful table format:

```javascript
// Array of objects
logger.table('Users', [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
]);

// Object with key-value pairs
logger.table('Configuration', {
  environment: 'production',
  port: 3000,
  database: 'postgresql',
});
```

### Time Tracking

```javascript
logger.time('Database Query');
// ... perform operation
logger.timeEnd('Database Query');
```

## ⚙️ Configuration

### Environment-Based Configuration

LogHorn automatically configures itself based on your environment:

#### Development

- ✅ Colors enabled
- ✅ Emojis enabled
- ✅ Timestamps enabled
- ✅ Stack traces enabled
- ✅ Elegant console output
- ✅ Table logging enabled
- ✅ Debug and trace logs enabled
- ✅ Request/response logging

#### Production

- ❌ Colors disabled
- ❌ Emojis disabled
- ✅ Timestamps enabled
- ❌ Stack traces disabled
- ✅ Structured JSON format
- ❌ Debug and trace logs disabled
- ❌ Request/response logging (errors only)

#### Test

- ❌ Colors disabled
- ❌ Emojis disabled
- ❌ Timestamps disabled
- ❌ Stack traces disabled
- ✅ JSON format
- ❌ All middleware disabled

### Custom Configuration

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  enableStackTraces: true,
  enableJSON: false, // Use elegant console output
  prettyJSON: 2, // Pretty print JSON
  enableTable: true,
  projectName: 'my-app',

  // Header display options
  showEmoji: true,
  showTimestamp: true,
  showLevel: true,
  showProjectName: true,
  showHeader: true,

  // Custom colors and emojis
  customColors: {
    success: '#28a745',
    failure: '#dc3545',
    custom: '#6f42c1',
  },
  customEmojis: {
    success: '🎉',
    failure: '💥',
    custom: '🔧',
  },

  // Log levels
  logLevels: {
    debug: { enabled: true, color: '#6c757d', emoji: '🔧' },
    info: { enabled: true, color: '#17a2b8', emoji: '💡' },
    warn: { enabled: true, color: '#ffc107', emoji: '⚡' },
    error: { enabled: true, color: '#dc3545', emoji: '💥' },
    trace: { enabled: true, color: '#6f42c1', emoji: '🔬' },
    log: { enabled: true, color: '#28a745', emoji: '📋' },
  },
});
```

### Environment Variables

Configure LogHorn using environment variables:

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

# Header display options
LOGHORN_SHOW_EMOJI=true
LOGHORN_SHOW_TIMESTAMP=true
LOGHORN_SHOW_LEVEL=true
LOGHORN_SHOW_PROJECT_NAME=true
LOGHORN_SHOW_HEADER=true

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

## 🎨 Output Formats

### Elegant Console Output (Development)

```
💡 [my-app] [2024-01-15T10:30:45.123Z] [INFO] User authentication started
✅ [my-app] [2024-01-15T10:30:45.456Z] [INFO] Authentication successful
📊 [my-app] [2024-01-15T10:30:45.789Z] [INFO] 📊 User Data
┌─ name ─┬─ age ─┬─ city ─┐
│ John   │ 30    │ NYC    │
│ Jane   │ 25    │ LA     │
└────────┴───────┴────────┘
```

### Structured JSON Output (Production)

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "User authentication started",
  "project": "my-app",
  "context": {
    "requestId": "req-123",
    "userId": "user-456"
  }
}
```

### Browser Console Output

Professional browser console output with colors and grouping:

```javascript
// Browser console with colors and groups
logger.info('User action', { userId: '123', action: 'login' });
// Outputs: %c💡 [my-app] [INFO] User action with CSS styling
```

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

### Performance Monitoring

```javascript
logger.group('Performance Test', async () => {
  logger.time('Database Query');

  // Simulate database operation
  await new Promise((resolve) => setTimeout(resolve, 100));

  logger.timeEnd('Database Query');
  logger.success('Performance test completed');
});
```

### Request Context

```javascript
// In Express middleware
app.use((req, res, next) => {
  logger.setContext({
    requestId: req.headers['x-request-id'],
    userId: req.user?.id,
    sessionId: req.session?.id,
  });
  next();
});
```

## 🌍 Environment Configurations

### Development

- ✅ Colors enabled
- ✅ Emojis enabled
- ✅ Timestamps enabled
- ✅ Stack traces enabled
- ✅ Elegant console output
- ✅ Table logging enabled
- ✅ Debug and trace logs enabled
- ✅ Request/response logging
- ✅ All middleware enabled

### Production

- ❌ Colors disabled
- ❌ Emojis disabled
- ✅ Timestamps enabled
- ❌ Stack traces disabled
- ✅ Structured JSON format
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

## 📦 Exports

### Core Exports

```javascript
import { ColorManager, createLogger, createNextJSLogger, Logger } from 'loghorn';
```

### Convenience Methods

```javascript
import {
  debug,
  end,
  error,
  failure,
  group,
  groupAsync,
  groupCollapsed,
  info,
  log,
  start,
  success,
  table,
  time,
  timeEnd,
  trace,
  warn,
} from 'loghorn';
```

### Middleware

```javascript
import {
  createLoggingMiddleware,
  createMorganMiddleware,
  fastifyLoghorn,
} from 'loghorn';
```

### Configuration

```javascript
import {
  createLoggerConfig,
  DEFAULT_LOG_LEVELS,
  ENVIRONMENT_CONFIGS,
  getEnvironment,
  loadConfigFromEnv,
} from 'loghorn';
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for
details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for
details.

## 🙏 Acknowledgments

- Built with TypeScript for type safety
- Uses [chalk](https://github.com/chalk/chalk) for terminal colors
- Uses [safe-stable-stringify](https://github.com/BridgeAR/safe-stable-stringify)
  for safe JSON serialization
- Inspired by modern logging practices and frameworks
