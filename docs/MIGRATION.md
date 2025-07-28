# Migration Guide

This guide helps you migrate from other popular logging libraries to LogHorn.

## Table of Contents

1. [From console.log](#from-consolelog)
2. [From winston](#from-winston)
3. [From pino](#from-pino)
4. [From debug](#from-debug)
5. [From log4js](#from-log4js)
6. [From bunyan](#from-bunyan)
7. [Common Patterns](#common-patterns)

## From console.log

### Before (console.log)

```javascript
console.log('User logged in', { userId: '123', timestamp: Date.now() });
console.warn('Deprecated API used');
console.error('Database connection failed', error);
console.info('Server started on port 3000');
```

### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger();

logger.info('User logged in', { userId: '123', timestamp: Date.now() });
logger.warn('Deprecated API used');
logger.error('Database connection failed', error);
logger.info('Server started on port 3000');
```

### Benefits

- ✅ **Structured logging** with context
- ✅ **Environment-aware** configuration
- ✅ **Performance monitoring** capabilities
- ✅ **Edge Runtime** compatibility
- ✅ **Next.js** integration

## From winston

### Before (winston)

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('User logged in', { userId: '123' });
logger.error('Database error', { error: 'connection failed' });
```

### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: 'production',
  enableJSON: true,
  enableTimestamps: true,
  projectName: 'my-app',
});

logger.info('User logged in', { userId: '123' });
logger.error('Database error', { error: 'connection failed' });
```

### Key Differences

| Feature           | Winston           | LogHorn                        |
| ----------------- | ----------------- | ------------------------------ |
| **Configuration** | Complex setup     | Simple, environment-aware      |
| **Edge Runtime**  | ❌ Not compatible | ✅ Full compatibility          |
| **Next.js**       | ❌ No integration | ✅ Deep integration            |
| **Performance**   | ❌ No monitoring  | ✅ Built-in monitoring         |
| **File logging**  | ✅ Built-in       | ❌ Console only (Edge Runtime) |

### Migration Tips

1. **Replace winston.createLogger** with `createLogger`
2. **Remove file transports** (not available in Edge Runtime)
3. **Use environment variables** for configuration
4. **Add performance monitoring** if needed

## From pino

### Before (pino)

```javascript
import pino from 'pino';

const logger = pino({
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

logger.info({ userId: '123' }, 'User logged in');
logger.error({ err: error }, 'Database error');
```

### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: 'production',
  enableJSON: true,
  enableTimestamps: true,
});

logger.info('User logged in', { userId: '123' });
logger.error('Database error', error);
```

### Key Differences

| Feature           | Pino              | LogHorn                        |
| ----------------- | ----------------- | ------------------------------ |
| **Performance**   | ✅ Very fast      | ✅ Fast + monitoring           |
| **Edge Runtime**  | ❌ Not compatible | ✅ Full compatibility          |
| **Next.js**       | ❌ No integration | ✅ Deep integration            |
| **Configuration** | Complex           | Simple, environment-aware      |
| **File logging**  | ✅ Built-in       | ❌ Console only (Edge Runtime) |

### Migration Tips

1. **Replace pino()** with `createLogger()`
2. **Move data to second parameter** (LogHorn format)
3. **Remove file transports** (Edge Runtime limitation)
4. **Add performance monitoring** if needed

## From debug

### Before (debug)

```javascript
import debug from 'debug';

const log = debug('app:auth');
const dbLog = debug('app:database');

log('User authentication started');
dbLog('Database query executed', { query: 'SELECT * FROM users' });
```

### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
});

// Use context for different modules
logger.setContext({ module: 'auth' });
logger.debug('User authentication started');

logger.setContext({ module: 'database' });
logger.debug('Database query executed', { query: 'SELECT * FROM users' });
```

### Key Differences

| Feature          | debug             | LogHorn                |
| ---------------- | ----------------- | ---------------------- |
| **Namespacing**  | ✅ Built-in       | ✅ Context-based       |
| **Environment**  | Manual setup      | ✅ Automatic           |
| **Edge Runtime** | ❌ Not compatible | ✅ Full compatibility  |
| **Performance**  | ❌ No monitoring  | ✅ Built-in monitoring |
| **Next.js**      | ❌ No integration | ✅ Deep integration    |

### Migration Tips

1. **Replace debug()** with `createLogger()`
2. **Use setContext()** for namespacing
3. **Add performance monitoring** if needed
4. **Use environment variables** for configuration

## From log4js

### Before (log4js)

```javascript
import log4js from 'log4js';

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: { type: 'file', filename: 'app.log' },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' },
  },
});

const logger = log4js.getLogger();
logger.info('User logged in', { userId: '123' });
logger.error('Database error', error);
```

### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: 'production',
  enableJSON: true,
  enableTimestamps: true,
  projectName: 'my-app',
});

logger.info('User logged in', { userId: '123' });
logger.error('Database error', error);
```

### Key Differences

| Feature           | log4js            | LogHorn                        |
| ----------------- | ----------------- | ------------------------------ |
| **Configuration** | Complex XML/JSON  | ✅ Simple, environment-aware   |
| **Edge Runtime**  | ❌ Not compatible | ✅ Full compatibility          |
| **Next.js**       | ❌ No integration | ✅ Deep integration            |
| **Performance**   | ❌ No monitoring  | ✅ Built-in monitoring         |
| **File logging**  | ✅ Built-in       | ❌ Console only (Edge Runtime) |

### Migration Tips

1. **Replace log4js.configure()** with `createLogger()`
2. **Remove file appenders** (Edge Runtime limitation)
3. **Use environment variables** for configuration
4. **Add performance monitoring** if needed

## From bunyan

### Before (bunyan)

```javascript
import bunyan from 'bunyan';

const logger = bunyan.createLogger({
  name: 'my-app',
  level: 'info',
  serializers: bunyan.stdSerializers,
});

logger.info({ userId: '123' }, 'User logged in');
logger.error({ err: error }, 'Database error');
```

### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: 'production',
  enableJSON: true,
  enableTimestamps: true,
  projectName: 'my-app',
});

logger.info('User logged in', { userId: '123' });
logger.error('Database error', error);
```

### Key Differences

| Feature          | bunyan            | LogHorn                        |
| ---------------- | ----------------- | ------------------------------ |
| **JSON logging** | ✅ Built-in       | ✅ Built-in                    |
| **Edge Runtime** | ❌ Not compatible | ✅ Full compatibility          |
| **Next.js**      | ❌ No integration | ✅ Deep integration            |
| **Performance**  | ❌ No monitoring  | ✅ Built-in monitoring         |
| **File logging** | ✅ Built-in       | ❌ Console only (Edge Runtime) |

### Migration Tips

1. **Replace bunyan.createLogger()** with `createLogger()`
2. **Move data to second parameter** (LogHorn format)
3. **Remove file logging** (Edge Runtime limitation)
4. **Add performance monitoring** if needed

## Common Patterns

### Request Logging

#### Before (Generic)

```javascript
// Middleware or API route
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
  next();
});
```

#### After (LogHorn)

```javascript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

// In middleware or API route
logger.request(req, {
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

// Or use context
logger.setContext({
  requestId: req.headers['x-request-id'],
  userId: req.user?.id,
});
logger.info(`${req.method} ${req.url}`);
```

### Error Handling

#### Before (Generic)

```javascript
try {
  await someOperation();
} catch (error) {
  console.error('Operation failed:', error);
  console.error('Stack trace:', error.stack);
}
```

#### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger();

try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', error);
}
```

### Performance Tracking

#### Before (Generic)

```javascript
const startTime = Date.now();
try {
  await someOperation();
  console.log(`Operation completed in ${Date.now() - startTime}ms`);
} catch (error) {
  console.error(`Operation failed after ${Date.now() - startTime}ms:`, error);
}
```

#### After (LogHorn)

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger();

// Manual tracking
const metricId = logger.startPerformance('some-operation', 'operations');
try {
  await someOperation();
  logger.completePerformance(metricId);
} catch (error) {
  logger.completePerformance(metricId, error);
}

// Or automatic tracking
await logger.trackPerformance(
  'some-operation',
  async () => {
    return await someOperation();
  },
  'operations',
);
```

### Group Logging

#### Before (Generic)

```javascript
console.group('User Authentication');
console.log('Starting authentication process');
console.log('Validating credentials');
console.log('User authenticated successfully');
console.groupEnd();
```

#### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger();

logger.group('User Authentication', () => {
  logger.info('Starting authentication process');
  logger.info('Validating credentials');
  logger.success('User authenticated successfully');
});
```

### Environment-Specific Configuration

#### Before (Generic)

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';
const logger = {
  info: (msg, data) => {
    if (isDevelopment) {
      console.log(`💡 ${msg}`, data);
    } else {
      console.log(JSON.stringify({ level: 'info', message: msg, data }));
    }
  },
};
```

#### After (LogHorn)

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: process.env.NODE_ENV || 'development',
  // Automatically configured based on environment
});

logger.info('Message', { data: 'value' });
// Development: 💡 Message { data: 'value' }
// Production: {"level":"info","message":"Message","data":{"data":"value"}}
```

### Next.js Integration

#### Before (Generic)

```javascript
// In Next.js pages or components
console.log('Page component mounted');
console.log('API request received', { method: 'GET', path: '/api/users' });
console.log('Server-side rendering completed');
```

#### After (LogHorn)

```javascript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

// Next.js specific methods
logger.page('Page component mounted');
logger.api('API request received', { method: 'GET', path: '/api/users' });
logger.ssr('Server-side rendering completed');

// App Router specific methods
logger.serverComponent('UserProfile', 'Component rendered', { userId: '123' });
logger.clientComponent('UserForm', 'Component mounted', { formId: 'form-1' });
logger.streaming('Stream started', { chunkSize: 1024 });
```

## Migration Checklist

### ✅ Basic Setup

- [ ] Install LogHorn: `npm install loghorn`
- [ ] Replace logging library imports
- [ ] Update logger instantiation
- [ ] Test basic logging functionality

### ✅ Configuration

- [ ] Set up environment-based configuration
- [ ] Configure log levels
- [ ] Set up custom colors/emojis (if needed)
- [ ] Test in different environments

### ✅ Advanced Features

- [ ] Add performance monitoring (if needed)
- [ ] Set up Next.js integration (if applicable)
- [ ] Configure Edge Runtime compatibility
- [ ] Test in Edge Runtime environment

### ✅ Testing

- [ ] Test all log levels
- [ ] Test error logging
- [ ] Test group logging
- [ ] Test performance monitoring
- [ ] Test Edge Runtime compatibility

### ✅ Production

- [ ] Update deployment configuration
- [ ] Set environment variables
- [ ] Monitor performance
- [ ] Verify Edge Runtime compatibility

## Troubleshooting

### Common Issues

#### 1. Edge Runtime Compatibility

**Issue**: Getting Node.js API errors in Edge Runtime

**Solution**: Use LogHorn's automatic Edge Runtime detection:

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger(); // Automatically detects Edge Runtime
```

#### 2. Performance Monitoring Not Working

**Issue**: Performance metrics not being tracked

**Solution**: Use PerformanceLogger for monitoring:

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger({
  enablePerformanceLogging: true,
});
```

#### 3. File Logging Not Available

**Issue**: Missing file logging in Edge Runtime

**Solution**: LogHorn is console-only in Edge Runtime. Use external logging
services:

```javascript
// Send logs to external service instead of files
logger.info('Application log', {
  service: 'external-logging',
  timestamp: new Date().toISOString(),
});
```

#### 4. Configuration Not Working

**Issue**: Environment variables not being read

**Solution**: Use LogHorn's built-in environment variable support:

```bash
# Set environment variables
LOGHORN_ENVIRONMENT=production
LOGHORN_ENABLE_JSON=true
LOGHORN_ENABLE_TIMESTAMPS=true
```

### Getting Help

- 📖 **Documentation**: Check the [API Documentation](API.md)
- 🐛 **Issues**: Report bugs on GitHub
- 💬 **Discussions**: Ask questions in GitHub Discussions
- 📝 **Examples**: See the [examples folder](../examples/) for more usage examples
