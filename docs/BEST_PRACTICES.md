# LogHorn Best Practices

This guide provides best practices for using LogHorn effectively in different
scenarios and environments.

## Table of Contents

1. [General Best Practices](#general-best-practices)
2. [Next.js Best Practices](#nextjs-best-practices)
3. [Performance Monitoring Best Practices](#performance-monitoring-best-practices)
4. [Edge Runtime Best Practices](#edge-runtime-best-practices)
5. [Production Best Practices](#production-best-practices)
6. [Security Best Practices](#security-best-practices)
7. [Testing Best Practices](#testing-best-practices)

## General Best Practices

### 1. Logger Instantiation

**✅ Good**

```typescript
import { createLogger } from 'loghorn';

// Create logger once and reuse
const logger = createLogger({
  environment: process.env.NODE_ENV || 'development',
  projectName: 'my-app',
});

export default logger;
```

**❌ Avoid**

```typescript
// Don't create logger in every file
import { createLogger } from 'loghorn';

// In file1.ts
const logger1 = createLogger();

// In file2.ts
const logger2 = createLogger();
```

### 2. Context Management

**✅ Good**

```typescript
// Set context at the beginning of request
logger.setContext({
  requestId: req.headers['x-request-id'],
  userId: req.user?.id,
  sessionId: req.session?.id,
});

// Log with context
logger.info('User action', { action: 'login', timestamp: Date.now() });

// Clear context when done
logger.clearContext();
```

**❌ Avoid**

```typescript
// Don't pass context in every log call
logger.info('User action', {
  action: 'login',
  requestId: req.headers['x-request-id'],
  userId: req.user?.id,
  sessionId: req.session?.id,
  timestamp: Date.now(),
});
```

### 3. Error Logging

**✅ Good**

```typescript
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', error);
  // Re-throw if needed
  throw error;
}
```

**❌ Avoid**

```typescript
try {
  await someOperation();
} catch (error) {
  // Don't log error message only
  logger.error('Operation failed');
  // Don't log error object separately
  console.error(error);
}
```

### 4. Log Levels

**✅ Good**

```typescript
// Use appropriate log levels
logger.debug('Detailed debugging information');
logger.info('General application flow');
logger.warn('Deprecated feature used');
logger.error('Error that needs attention');
```

**❌ Avoid**

```typescript
// Don't use error for everything
logger.error('User logged in'); // Should be info
logger.error('API request received'); // Should be info
```

### 5. Structured Data

**✅ Good**

```typescript
logger.info('User authentication', {
  userId: '123',
  method: 'password',
  success: true,
  duration: 150,
});
```

**❌ Avoid**

```typescript
// Don't log unstructured data
logger.info('User 123 authenticated with password in 150ms');
```

## Next.js Best Practices

### 1. App Router Integration

**✅ Good**

```typescript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger({
  enableAppRouterLogging: true,
  enableServerComponents: true,
  enableClientComponents: true,
});

// In server components
logger.serverComponent('UserProfile', 'Component rendered', { userId: '123' });

// In client components
logger.clientComponent('UserForm', 'Component mounted', { formId: 'form-1' });

// In streaming
logger.streaming('Stream started', { chunkSize: 1024 });

// In suspense boundaries
logger.suspense('UserDataBoundary', 'Loading user data', { userId: '123' });
```

### 2. API Route Logging

**✅ Good**

```typescript
// In API routes
export async function GET(req: Request) {
  logger.api('GET /api/users', {
    query: req.nextUrl.searchParams.toString(),
    userAgent: req.headers.get('user-agent'),
  });

  try {
    const users = await getUsers();
    logger.success('Users fetched successfully', { count: users.length });
    return Response.json(users);
  } catch (error) {
    logger.error('Failed to fetch users', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
```

### 3. Middleware Logging

**✅ Good**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  logger.middleware('Request processed', {
    method: request.method,
    pathname: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
  });

  return NextResponse.next();
}
```

### 4. Error Boundaries

**✅ Good**

```typescript
// In error boundary components
logger.errorBoundary('UserErrorBoundary', 'Error caught', {
  errorType: 'fetch',
  component: 'UserProfile',
});
```

## Performance Monitoring Best Practices

### 1. Performance Tracking

**✅ Good**

```typescript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger({
  enablePerformanceLogging: true,
  performanceLogInterval: 30000,
});

// Track database operations
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

### 2. Performance Health Monitoring

**✅ Good**

```typescript
// Check performance health periodically
setInterval(() => {
  const health = logger.checkPerformanceHealth();
  if (!health.healthy) {
    console.log('Performance issues detected:');
    health.warnings.forEach((warning) => console.log('⚠️', warning));
    health.critical.forEach((critical) => console.log('❌', critical));
  }
}, 60000); // Check every minute
```

### 3. Performance Statistics

**✅ Good**

```typescript
// Log performance statistics periodically
logger.logPerformanceStats();

// Get detailed metrics
const stats = logger.getPerformanceStats();
console.log('Performance Summary:');
console.log(`- Total Operations: ${stats.totalOperations}`);
console.log(`- Success Rate: ${stats.successRate.toFixed(2)}%`);
console.log(`- Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
console.log(`- Throughput: ${stats.throughput.toFixed(2)} ops/sec`);
```

### 4. Slow Operation Detection

**✅ Good**

```typescript
// Get slow operations
const slowOps = logger.getSlowOperations(1000); // Operations > 1 second
if (slowOps.length > 0) {
  console.log(`Found ${slowOps.length} slow operations:`);
  slowOps.forEach((op) => {
    console.log(`- ${op.name}: ${op.duration}ms`);
  });
}
```

## Edge Runtime Best Practices

### 1. Edge Runtime Detection

**✅ Good**

```typescript
// Use Edge-specific color management
import { createLogger, EdgeColorManager } from 'loghorn';

// Automatically detects Edge Runtime
const logger = createLogger();

const edgeColorManager = new EdgeColorManager({
  enableColors: true,
  customColors: {
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
  },
});
```

### 2. Edge Runtime Limitations

**✅ Good**

```typescript
// Disable Node.js-specific features in Edge Runtime
const logger = createPerformanceLogger({
  performance: {
    enableMemoryTracking: false, // Not available in Edge Runtime
    enableCpuTracking: false, // Not available in Edge Runtime
  },
});
```

### 3. Edge Runtime Performance

**✅ Good**

```typescript
// Use async operations for heavy tasks
await logger.trackPerformance(
  'heavy-operation',
  async () => {
    // Heavy operation here
    return result;
  },
  'operations',
);
```

## Production Best Practices

### 1. Environment Configuration

**✅ Good**

```typescript
// Use environment variables for configuration
const logger = createLogger({
  environment: process.env.NODE_ENV || 'development',
  enableJSON: process.env.NODE_ENV === 'production',
  enableColors: process.env.NODE_ENV !== 'production',
  enableEmojis: process.env.NODE_ENV !== 'production',
  enableStackTraces: process.env.NODE_ENV !== 'production',
});
```

### 2. Log Level Management

**✅ Good**

```typescript
// Configure log levels based on environment
const logger = createLogger({
  logLevels: {
    debug: { enabled: process.env.NODE_ENV === 'development' },
    trace: { enabled: process.env.NODE_ENV === 'development' },
    info: { enabled: true },
    warn: { enabled: true },
    error: { enabled: true },
    log: { enabled: true },
  },
});
```

### 3. Performance Monitoring in Production

**✅ Good**

```typescript
const logger = createPerformanceLogger({
  enablePerformanceLogging: true,
  performanceLogInterval: 60000, // Log every minute
  performance: {
    maxMetricsHistory: 1000,
    autoCleanupInterval: 300000, // Cleanup every 5 minutes
    performanceThresholds: {
      slowOperationThreshold: 1000, // 1 second
      errorRateThreshold: 5, // 5%
    },
  },
});
```

### 4. Error Handling in Production

**✅ Good**

```typescript
// Comprehensive error logging
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', {
    operation: 'someOperation',
    error: error.message,
    stack: error.stack,
    context: {
      userId: req.user?.id,
      requestId: req.headers['x-request-id'],
    },
  });

  // Send to external monitoring service
  await sendToMonitoringService(error);
}
```

## Security Best Practices

### 1. Sensitive Data

**✅ Good**

```typescript
// Don't log sensitive information
logger.info('User authentication', {
  userId: '123',
  method: 'password',
  success: true,
  // Don't log: password, token, creditCard, etc.
});
```

**❌ Avoid**

```typescript
// Never log sensitive data
logger.info('User login', {
  email: 'user@example.com',
  password: 'secret123', // ❌ Never log passwords
  creditCard: '1234-5678-9012-3456', // ❌ Never log credit cards
  token: 'jwt-token-here', // ❌ Never log tokens
});
```

### 2. PII (Personal Identifiable Information)

**✅ Good**

```typescript
// Anonymize or hash PII
logger.info('User action', {
  userId: '123',
  action: 'login',
  ipHash: hashIP(req.ip), // Hash IP addresses
  userAgentHash: hashUserAgent(req.headers['user-agent']), // Hash user agent
});
```

### 3. Error Information

**✅ Good**

```typescript
// Log error details safely
logger.error('Database error', {
  error: error.message,
  errorCode: error.code,
  // Don't log: error.stack in production (contains file paths)
  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
});
```

## Testing Best Practices

### 1. Test Configuration

**✅ Good**

```typescript
// In test setup
const logger = createLogger({
  environment: 'test',
  enableColors: false,
  enableEmojis: false,
  enableTimestamps: false,
  enableJSON: true,
});

// Mock console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
```

### 2. Performance Logger Testing

**✅ Good**

```typescript
// In performance logger tests
const logger = createPerformanceLogger({
  enablePerformanceLogging: false, // Disable auto logging
  performance: {
    enableMemoryTracking: false, // Disable for tests
    enableCpuTracking: false, // Disable for tests
    autoCleanupInterval: 0, // Disable auto cleanup
  },
});

// Clean up after tests
afterEach(() => {
  logger.destroy();
});
```

### 3. Edge Runtime Testing

**✅ Good**

```typescript
// Test Edge Runtime compatibility
describe('Edge Runtime Compatibility', () => {
  beforeEach(() => {
    // Mock Edge Runtime environment
    global.EdgeRuntime = '1';
  });

  afterEach(() => {
    delete global.EdgeRuntime;
  });

  test('should work in Edge Runtime', () => {
    const logger = createLogger();
    expect(() => logger.info('test')).not.toThrow();
  });
});
```

## Advanced Best Practices

### 1. Custom Loggers

**✅ Good**

```typescript
// Create specialized loggers
class DatabaseLogger extends Logger {
  constructor() {
    super({
      projectName: 'database',
      customColors: {
        query: '#007acc',
        connection: '#28a745',
        error: '#dc3545',
      },
    });
  }

  query(sql: string, params?: unknown[]) {
    this.info('Database query', { sql, params });
  }

  connection(host: string, port: number) {
    this.info('Database connection', { host, port });
  }
}

const dbLogger = new DatabaseLogger();
```

### 2. Log Aggregation

**✅ Good**

```typescript
// Send logs to external service
logger.info('Application log', {
  service: 'external-logging',
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'User action',
  data: { userId: '123', action: 'login' },
});

// Or use a custom transport
class ExternalTransport {
  async log(level: string, message: string, data?: unknown) {
    await fetch('https://logs.example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, data }),
    });
  }
}
```

### 3. Log Rotation

**✅ Good**

```typescript
// Implement log rotation for Node.js environments
class RotatingLogger extends Logger {
  private logCount = 0;
  private maxLogs = 1000;

  log(level: string, message: string, data?: unknown) {
    super.log(level, message, data);

    this.logCount++;
    if (this.logCount >= this.maxLogs) {
      this.clearLogs();
      this.logCount = 0;
    }
  }

  private clearLogs() {
    // Clear old logs
    console.clear();
  }
}
```

## Performance Best Practices

### 1. Memory Management

**✅ Good**

```typescript
// Use object pooling for high-volume logging
const logger = createPerformanceLogger({
  performance: {
    maxMetricsHistory: 1000, // Limit memory usage
    autoCleanupInterval: 60000, // Cleanup every minute
  },
});

// Clear old metrics periodically
setInterval(() => {
  logger.clearPerformanceMetrics();
}, 300000); // Every 5 minutes
```

### 2. Rate Limiting

**✅ Good**

```typescript
// Use rate limiting for high-volume applications
const logger = createLogger({
  // Rate limiting is enabled by default
  // Configure limits based on your needs
});
```

### 3. Async Logging

**✅ Good**

```typescript
// Use async logging for non-blocking operations
await logger.groupAsync('Async Operation', async () => {
  logger.info('Starting async operation');

  const result = await someAsyncOperation();

  logger.success('Async operation completed', { result });
});
```

## Monitoring and Alerting

### 1. Health Checks

**✅ Good**

```typescript
// Implement health checks
setInterval(() => {
  const health = logger.checkPerformanceHealth();

  if (!health.healthy) {
    // Send alert
    sendAlert({
      type: 'performance_issue',
      warnings: health.warnings,
      critical: health.critical,
    });
  }
}, 60000); // Check every minute
```

### 2. Metrics Collection

**✅ Good**

```typescript
// Collect metrics for external monitoring
setInterval(() => {
  const stats = logger.getPerformanceStats();

  // Send to monitoring service
  sendMetrics({
    totalOperations: stats.totalOperations,
    successRate: stats.successRate,
    averageDuration: stats.averageDuration,
    throughput: stats.throughput,
  });
}, 30000); // Every 30 seconds
```

### 3. Error Tracking

**✅ Good**

```typescript
// Track errors for external monitoring
logger.error('Application error', {
  error: error.message,
  stack: error.stack,
  context: {
    userId: req.user?.id,
    requestId: req.headers['x-request-id'],
    userAgent: req.headers['user-agent'],
  },
  // Send to error tracking service
  service: 'sentry',
});
```

## Conclusion

Following these best practices will help you:

- ✅ **Improve performance** with efficient logging
- ✅ **Maintain security** by avoiding sensitive data logging
- ✅ **Ensure reliability** with proper error handling
- ✅ **Enable monitoring** with comprehensive metrics
- ✅ **Support Edge Runtime** with compatible configurations
- ✅ **Facilitate debugging** with structured logging
- ✅ **Scale applications** with proper resource management

Remember to adapt these practices to your specific use case and requirements.
