# Loghorn 🦄

A powerful, flexible, and production-ready logging library for Next.js with Edge
Runtime support.

[![npm version](https://badge.fury.io/js/loghorn.svg)](https://badge.fury.io/js/loghorn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **Next.js Optimized**: Built specifically for Next.js applications
- **Edge Runtime Compatible**: Works seamlessly with Next.js Edge Runtime
- **Edge Runtime Color Handling**: Optimized color handling for Edge Runtime
  environments
- **Performance Monitoring**: Real-time performance metrics and health checks
- **Memory Efficient**: Object pooling and automatic cleanup
- **Rate Limiting**: Built-in protection against log spam and DoS attacks
- **Asynchronous Logging**: Non-blocking batched operations
- **Universal**: Works in Node.js and browsers
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

### Performance Monitoring

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger({
  enablePerformanceLogging: true,
  performanceLogInterval: 30000, // Log stats every 30 seconds
  performance: {
    enableMemoryTracking: false, // Disabled for Edge Runtime
    enableCpuTracking: false, // Disabled for Edge Runtime
    autoCleanupInterval: 60000, // Cleanup every minute
  },
});

// Track performance automatically
const metricId = logger.startPerformance('database-query', 'database');
// ... perform operation
logger.completePerformance(metricId);

// Or use the convenient wrapper
await logger.trackPerformance(
  'api-request',
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  'api',
);
```

### Next.js Integration

```javascript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger({
  enableSSRLogging: true,
  enableAPILogging: true,
  enablePageLogging: true,
});

// Next.js specific methods
logger.ssr('Server-side rendering started');
logger.api('API request received', { method: 'GET', path: '/api/users' });
logger.page('Page component mounted');
logger.route('Route change detected');
logger.middleware('Middleware executed');
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

#### Performance Monitoring Methods

```javascript
// Start and complete performance tracking
const metricId = logger.startPerformance('operation-name', 'category');
logger.completePerformance(metricId);

// Track async operations
await logger.trackPerformance(
  'async-operation',
  async () => {
    // Your async operation here
    return result;
  },
  'category',
  { metadata: 'additional info' },
);

// Track sync operations
const result = logger.trackPerformanceSync(
  'sync-operation',
  () => {
    // Your sync operation here
    return result;
  },
  'category',
  { metadata: 'additional info' },
);

// Get performance statistics
const stats = logger.getPerformanceStats();
console.log('Total operations:', stats.totalOperations);
console.log('Success rate:', stats.successRate);
console.log('Average duration:', stats.averageDuration);

// Log performance statistics
logger.logPerformanceStats();
logger.logDetailedMetrics(10); // Show last 10 metrics
logger.logPerformanceHealth();

// Get slow operations
const slowOps = logger.getSlowOperations(1000); // Operations > 1 second
console.log('Slow operations:', slowOps.length);

// Get failed operations
const failedOps = logger.getFailedOperations();
console.log('Failed operations:', failedOps.length);

// Check performance health
const health = logger.checkPerformanceHealth();
console.log('Healthy:', health.healthy);
console.log('Warnings:', health.warnings);
console.log('Critical issues:', health.critical);
```

#### Next.js Specific Methods

```javascript
logger.ssr('Server-side rendering message');
logger.api('API route message');
logger.page('Page component message');
logger.route('Route change message');
logger.middleware('Middleware message');
logger.request(req, additionalData);
logger.response(res, additionalData);
logger.nextError(error, context);
logger.performance('Operation', duration, data);
logger.hydration('Hydration message');
logger.staticGen('Static generation message');
logger.imageOpt('Image optimization message');
logger.cache('Cache operation message');
logger.revalidate('Revalidation message');
```

#### Next.js 15 App Router Enhanced Methods

```javascript
// App Router Specific Methods
logger.serverComponent('UserProfile', 'Component rendered', { userId: '123' });
logger.clientComponent('UserForm', 'Component mounted', { formId: 'form-1' });
logger.streaming('Stream started', { chunkSize: 1024 });
logger.suspense('UserDataBoundary', 'Loading user data', { userId: '123' });
logger.parallelRoute('@modal', 'Modal route loaded', { modalType: 'user' });
logger.interceptingRoute('/users/[id]', 'Route intercepted', { userId: '123' });

// App Router Lifecycle Methods
logger.layout('RootLayout', 'Layout rendered', { pathname: '/dashboard' });
logger.template('UserTemplate', 'Template rendered', { templateId: 'user' });
logger.loading('UserLoading', 'Loading component rendered', {
  loadingType: 'skeleton',
});
logger.errorBoundary('UserErrorBoundary', 'Error caught', { errorType: 'fetch' });
logger.notFound('UserNotFound', 'User not found', { userId: '999' });

// App Router Data Fetching
logger.dataFetch('getUser', 'User data fetched', { userId: '123', cache: 'miss' });
logger.metadata('generateMetadata', 'Metadata generated', { page: '/users' });

// App Router Request/Response
logger.cookies('set', 'Cookie set', { name: 'session', value: 'abc123' });
logger.headers('set', 'Header set', { name: 'x-custom', value: 'value' });
logger.redirect('/old-path', '/new-path', { reason: 'migration' });
logger.searchParams({ page: '1', limit: '10' }, 'Search params processed', {
  query: 'users',
});
logger.segment('users', 'Segment processed', { segmentType: 'dynamic' });
```

#### Edge Runtime Color Handling

LogHorn automatically detects Edge Runtime environments and uses optimized color
handling:

```javascript
import { EdgeColorManager } from 'loghorn';

// Automatic Edge Runtime detection
const edgeColorManager = new EdgeColorManager({
  enableColors: true,
  customColors: {
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
  },
});

// Optimized for Edge Runtime
console.log(edgeColorManager.colorize('Success message', 'success'));
console.log(edgeColorManager.colorize('Warning message', 'warning'));
console.log(edgeColorManager.colorize('Error message', 'danger'));

// Get color information
const colorInfo = edgeColorManager.getColorInfo();
console.log('Is Edge Runtime:', colorInfo.isEdgeRuntime);
console.log('Supports Colors:', colorInfo.supportsColors);
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

#### Production

- ❌ Colors disabled
- ❌ Emojis disabled
- ✅ Timestamps enabled
- ❌ Stack traces disabled
- ✅ Structured JSON format
- ❌ Debug and trace logs disabled

#### Test

- ❌ Colors disabled
- ❌ Emojis disabled
- ❌ Timestamps disabled
- ❌ Stack traces disabled
- ✅ JSON format

### Performance Logger Configuration

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger({
  // Standard logger configuration
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  enableStackTraces: true,
  enableJSON: false,
  projectName: 'my-app',

  // Performance monitoring configuration
  enablePerformanceLogging: true,
  enableAutoMetrics: true,
  performanceLogInterval: 30000, // Log stats every 30 seconds

  // Performance monitor configuration
  performance: {
    enableMemoryTracking: false, // Disabled for Edge Runtime compatibility
    enableCpuTracking: false, // Disabled for Edge Runtime compatibility
    enableThroughputTracking: true,
    enableErrorTracking: true,
    maxMetricsHistory: 1000,
    autoCleanupInterval: 60000, // Cleanup every minute
    performanceThresholds: {
      slowOperationThreshold: 1000, // 1 second
      errorRateThreshold: 5, // 5%
      memoryThreshold: 100, // 100MB (Node.js only)
    },
  },

  // Log levels
  logLevels: {
    debug: { level: 'debug', color: 'gray', emoji: '🐛', enabled: true },
    info: { level: 'info', color: 'cyan', emoji: '💡', enabled: true },
    warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
    error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
    trace: { level: 'trace', color: 'purple', emoji: '🔍', enabled: true },
    log: { level: 'log', color: 'green', emoji: '📝', enabled: true },
  },
});
```

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

# Performance Monitoring
LOGHORN_ENABLE_PERFORMANCE_LOGGING=true
LOGHORN_ENABLE_AUTO_METRICS=true
LOGHORN_PERFORMANCE_LOG_INTERVAL=30000
LOGHORN_MAX_METRICS_HISTORY=1000
LOGHORN_AUTO_CLEANUP_INTERVAL=60000
LOGHORN_SLOW_OPERATION_THRESHOLD=1000
LOGHORN_ERROR_RATE_THRESHOLD=5
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

### Performance Monitoring Output

```javascript
// Performance statistics
logger.logPerformanceStats();
// Output:
// 📊 Performance Statistics
// Total Operations: 150
// Average Duration: 45ms
// Success Rate: 98.5%
// Error Rate: 1.5%
// Throughput: 2.5 ops/sec

// Performance health check
logger.logPerformanceHealth();
// Output:
// ✅ Performance Health: Healthy
// ⚠️  Warnings: 2 slow operations detected
// ❌ Critical: None
```

### Browser Console Output

Professional browser console output with colors and grouping:

```javascript
// Browser console with colors and groups
logger.info('User action', { userId: '123', action: 'login' });
// Outputs: %c💡 [my-app] [INFO] User action with CSS styling
```

## 🔧 Advanced Usage

### Performance Monitoring Examples

#### Basic Performance Tracking

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger();

// Manual tracking
const metricId = logger.startPerformance('database-query', 'database');
try {
  const result = await db.query('SELECT * FROM users');
  logger.completePerformance(metricId);
  // return result;
} catch (error) {
  logger.completePerformance(metricId, error);
  throw error;
}
```

#### Automatic Performance Tracking

```javascript
// Track async operations
const users = await logger.trackPerformance(
  'fetch-users',
  async () => {
    const response = await fetch('/api/users');
    return response.json();
  },
  'api',
  { endpoint: '/api/users' },
);

// Track sync operations
const processedData = logger.trackPerformanceSync(
  'process-data',
  () => {
    return data.map((item) => ({ ...item, processed: true }));
  },
  'data-processing',
  { items: data.length },
);
```

#### Performance Monitoring in Groups

```javascript
logger.group('User Authentication', async () => {
  // This group will be automatically tracked
  logger.info('Starting authentication');

  const user = await logger.trackPerformance(
    'validate-credentials',
    async () => {
      return await validateUser(credentials);
    },
    'auth',
  );

  logger.success('Authentication completed', { userId: user.id });
});
```

#### Performance Health Monitoring

```javascript
// Check performance health
const health = logger.checkPerformanceHealth();
if (!health.healthy) {
  console.log('Performance issues detected:');
  health.warnings.forEach((warning) => console.log('⚠️', warning));
  health.critical.forEach((critical) => console.log('❌', critical));
}

// Get performance statistics
const stats = logger.getPerformanceStats();
console.log('Performance Summary:');
console.log(`- Total Operations: ${stats.totalOperations}`);
console.log(`- Success Rate: ${stats.successRate.toFixed(2)}%`);
console.log(`- Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
console.log(`- Throughput: ${stats.throughput.toFixed(2)} ops/sec`);
```

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
// In Next.js middleware or API routes
logger.setContext({
  requestId: req.headers['x-request-id'],
  userId: req.user?.id,
  sessionId: req.session?.id,
});
```

### Next.js 15 App Router Enhanced Configuration

The enhanced Next.js logger includes specific configuration options for App Router
features:

```javascript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger({
  // Standard configuration
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  enableStackTraces: true,
  enableJSON: false,
  projectName: 'my-nextjs-app',

  // App Router specific configuration
  enableAppRouterLogging: true,
  enableServerComponents: true,
  enableClientComponents: true,
  enableStreaming: true,
  enableSuspense: true,
  enableParallelRoutes: true,
  enableInterceptingRoutes: true,

  // Legacy Next.js features
  enableSSRLogging: true,
  enableAPILogging: true,
  enablePageLogging: true,
  enableConsoleMethods: true,
  enableGrouping: true,
  maxGroupDepth: 10,
});
```

#### App Router Configuration Options

| Option                     | Default | Description                            |
| -------------------------- | ------- | -------------------------------------- |
| `enableAppRouterLogging`   | `true`  | Enable all App Router specific logging |
| `enableServerComponents`   | `true`  | Enable server component logging        |
| `enableClientComponents`   | `true`  | Enable client component logging        |
| `enableStreaming`          | `true`  | Enable streaming logging               |
| `enableSuspense`           | `true`  | Enable suspense boundary logging       |
| `enableParallelRoutes`     | `true`  | Enable parallel routes logging         |
| `enableInterceptingRoutes` | `true`  | Enable intercepting routes logging     |

#### Dynamic Configuration Updates

```javascript
// Update configuration at runtime
logger.updateNextJSConfig({
  enableServerComponents: false,
  enableClientComponents: false,
  enableStreaming: true,
});

// Get current configuration
const config = logger.getNextJSConfig();
console.log('Server Components:', config.enableServerComponents);
console.log('Client Components:', config.enableClientComponents);
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
- ✅ Performance monitoring enabled

### Production

- ❌ Colors disabled
- ❌ Emojis disabled
- ✅ Timestamps enabled
- ❌ Stack traces disabled
- ✅ Structured JSON format
- ❌ Debug and trace logs disabled
- ✅ Performance monitoring enabled

### Test

- ❌ Colors disabled
- ❌ Emojis disabled
- ❌ Timestamps disabled
- ❌ Stack traces disabled
- ✅ JSON format
- ✅ Performance monitoring enabled

### Staging

- ✅ Colors enabled
- ✅ Emojis enabled
- ✅ Timestamps enabled
- ✅ Stack traces enabled
- ✅ JSON format
- ✅ Performance monitoring enabled

## 📦 Exports

### Core Exports

```javascript
import {
  ColorManager,
  createLogger,
  createNextJSLogger,
  createPerformanceLogger,
  EdgeColorManager,
  Logger,
  PerformanceLogger,
  PerformanceMonitor,
} from 'loghorn';
```

### Performance Monitoring Types

```javascript
import type {
  PerformanceLoggerConfig,
  PerformanceConfig,
  PerformanceMetric,
  PerformanceStats
} from 'loghorn';
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

## 🚀 Performance Features

### Memory Efficiency

LogHorn uses object pooling to reduce memory allocations and garbage collection
overhead:

```javascript
// Automatic object reuse for better performance
const logger = createPerformanceLogger({
  // Object pooling is enabled by default
  // No additional configuration needed
});
```

### Rate Limiting

Built-in protection against log spam and DoS attacks:

```javascript
const logger = createLogger({
  // Rate limiting is enabled by default
  // Configurable limits for different log levels
});
```

### Asynchronous Logging

Non-blocking operations that don't impact your application's performance:

```javascript
// All logging operations are asynchronous
logger.info("This won't block your application");
logger.error('Error logging is also non-blocking');
```

### Edge Runtime Compatibility

100% compatible with Next.js Edge Runtime:

```javascript
// Works perfectly in Edge Runtime
// No Node.js APIs used
// Optimized for serverless environments
const logger = createLogger(); // Automatically detects Edge Runtime
```

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in minutes
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Best Practices](docs/BEST_PRACTICES.md)** - Guidelines for effective usage
- **[Migration Guide](docs/MIGRATION.md)** - Migrate from other logging libraries
- **[Examples](examples/README.md)** - Practical examples and demos

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for
details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for
details.

## 🙏 Acknowledgments

- Built with TypeScript for type safety
- Uses [safe-stable-stringify](https://github.com/BridgeAR/safe-stable-stringify)
  for safe JSON serialization
- Optimized for Next.js 15 and Edge Runtime
- Inspired by modern logging practices and frameworks
