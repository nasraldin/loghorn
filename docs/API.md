# LogHorn API Documentation

## Table of Contents

1. [Core Classes](#core-classes)
2. [Factory Functions](#factory-functions)
3. [Performance Monitoring](#performance-monitoring)
4. [Configuration](#configuration)
5. [Types and Interfaces](#types-and-interfaces)
6. [Edge Runtime Compatibility](#edge-runtime-compatibility)
7. [Examples](#examples)

## Core Classes

### Logger

The base logging class that provides all core logging functionality.

```typescript
import { Logger } from 'loghorn';

class Logger {
  constructor(config: LoggerConfig);

  // Basic logging methods
  trace(message: string, data?: LogData): void;
  debug(message: string, data?: LogData): void;
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
  log(message: string, data?: LogData): void;

  // Specialized methods
  success(message: string, data?: LogData): void;
  failure(message: string, data?: LogData): void;
  start(message: string, data?: LogData): void;
  end(message: string, data?: LogData): void;

  // Group logging
  group(label: string, fn: () => void | Promise<void>, options?: GroupOptions): void;
  groupAsync<T>(label: string, fn: () => Promise<T>, options?: GroupOptions): Promise<T>;
  groupCollapsed(label: string, fn: () => void | Promise<void>, options?: GroupOptions): void;

  // Table logging
  table(title: string, data: TableData): void;

  // Time tracking
  time(label: string): void;
  timeEnd(label: string): void;

  // Context management
  setContext(context: LogContext): void;
  clearContext(): void;

  // Configuration
  updateConfig(config: Partial<LoggerConfig>): void;
  getConfig(): LoggerConfig;
}
```

### PerformanceLogger

Extends `Logger` with performance monitoring capabilities.

```typescript
import { PerformanceLogger } from 'loghorn';

class PerformanceLogger extends Logger {
  constructor(config: PerformanceLoggerConfig);

  // Performance tracking
  startPerformance(operation: string, category?: string, metadata?: Record<string, unknown>): string;
  completePerformance(metricId: string, error?: Error): PerformanceMetric | null;

  // Convenience methods
  trackPerformance<T>(operation: string, fn: () => Promise<T>, category?: string, metadata?: Record<string, unknown>): Promise<T>;
  trackPerformanceSync<T>(operation: string, fn: () => T, category?: string, metadata?: Record<string, unknown>): T;

  // Performance statistics
  getPerformanceStats(category?: string): PerformanceStats;
  logPerformanceStats(category?: string): void;
  logDetailedMetrics(count?: number): void;
  logPerformanceHealth(): void;

  // Performance analysis
  getSlowOperations(threshold?: number): PerformanceMetric[];
  getFailedOperations(): PerformanceMetric[];
  checkPerformanceHealth(): PerformanceHealth;

  // Performance monitoring
  getPerformanceMonitor(): PerformanceMonitor;
  clearPerformanceMetrics(): void;
  updatePerformanceConfig(config: Partial<PerformanceConfig>): void;
  getPerformanceConfig(): PerformanceConfig;

  // Performance logging control
  startPerformanceLogging(interval?: number): void;
  stopPerformanceLogging(): void;

  // Cleanup
  destroy(): void;
}
```

### PerformanceMonitor

Core performance monitoring engine.

```typescript
import { PerformanceMonitor } from 'loghorn';

class PerformanceMonitor {
  constructor(config?: Partial<PerformanceConfig>);

  // Metric management
  startMetric(name: string, category?: string, metadata?: Record<string, unknown>): string;
  completeMetric(id: string, error?: Error): PerformanceMetric | null;

  // Statistics
  getStats(category?: string): PerformanceStats;
  getSlowOperations(threshold?: number): PerformanceMetric[];
  getFailedOperations(): PerformanceMetric[];
  getMetricsByCategory(category: string): PerformanceMetric[];
  getRecentMetrics(count?: number): PerformanceMetric[];

  // Health monitoring
  checkPerformanceHealth(): PerformanceHealth;
  getPerformanceSummary(): Record<string, unknown>;

  // Management
  clear(): void;
  getRunningMetrics(): PerformanceMetric[];
  getAllMetrics(): PerformanceMetric[];
  updateConfig(config: Partial<PerformanceConfig>): void;
  getConfig(): PerformanceConfig;
  destroy(): void;
}
```

### EdgeColorManager

Optimized color management for Edge Runtime environments.

```typescript
import { EdgeColorManager } from 'loghorn';

class EdgeColorManager {
  constructor(options: EdgeColorOptions);

  // Color management
  colorize(text: string, color: string): string;
  getColorInfo(): ColorInfo;

  // Edge Runtime detection
  isEdgeRuntimeEnvironment(): boolean;
  detectEdgeRuntime(): boolean;
}
```

## Factory Functions

### createLogger

Creates a standard logger instance with automatic environment detection.

```typescript
import { createLogger } from 'loghorn';

function createLogger(config?: Partial<LoggerConfig>): Logger;
```

**Example:**

```typescript
const logger = createLogger({
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  projectName: 'my-app',
});
```

### createPerformanceLogger

Creates a performance logger with monitoring capabilities.

```typescript
import { createPerformanceLogger } from 'loghorn';

function createPerformanceLogger(
  config?: Partial<PerformanceLoggerConfig>,
): PerformanceLogger;
```

**Example:**

```typescript
const logger = createPerformanceLogger({
  enablePerformanceLogging: true,
  performanceLogInterval: 30000,
  performance: {
    enableMemoryTracking: false, // Edge Runtime compatible
    enableCpuTracking: false, // Edge Runtime compatible
    maxMetricsHistory: 1000,
  },
});
```

### createNextJSLogger

Creates a Next.js optimized logger with framework-specific methods.

```typescript
import { createNextJSLogger } from 'loghorn';

function createNextJSLogger(config?: Partial<NextJSLoggerConfig>): NextJSLogger;
```

**Example:**

```typescript
const logger = createNextJSLogger({
  enableAppRouterLogging: true,
  enableServerComponents: true,
  enableClientComponents: true,
  enableStreaming: true,
  enableSuspense: true,
  enableParallelRoutes: true,
  enableInterceptingRoutes: true,
});
```

## Performance Monitoring

### Performance Tracking

```typescript
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

// Automatic tracking
const users = await logger.trackPerformance(
  'fetch-users',
  async () => {
    const response = await fetch('/api/users');
    return response.json();
  },
  'api',
  { endpoint: '/api/users' },
);

// Sync tracking
const processedData = logger.trackPerformanceSync(
  'process-data',
  () => {
    return data.map((item) => ({ ...item, processed: true }));
  },
  'data-processing',
  { items: data.length },
);
```

### Performance Statistics

```typescript
// Get performance statistics
const stats = logger.getPerformanceStats();
console.log('Total operations:', stats.totalOperations);
console.log('Success rate:', stats.successRate);
console.log('Average duration:', stats.averageDuration);
console.log('Throughput:', stats.throughput);

// Log statistics
logger.logPerformanceStats();
logger.logDetailedMetrics(10);
logger.logPerformanceHealth();
```

### Performance Health

```typescript
// Check performance health
const health = logger.checkPerformanceHealth();
if (!health.healthy) {
  console.log('Performance issues detected:');
  health.warnings.forEach((warning) => console.log('⚠️', warning));
  health.critical.forEach((critical) => console.log('❌', critical));
}
```

## Configuration

### LoggerConfig

```typescript
interface LoggerConfig {
  environment?: 'development' | 'production' | 'test' | 'staging';
  enableColors?: boolean;
  enableEmojis?: boolean;
  enableTimestamps?: boolean;
  enableStackTraces?: boolean;
  enableJSON?: boolean;
  prettyJSON?: number;
  enableTable?: boolean;
  projectName?: string;

  // Header display options
  showEmoji?: boolean;
  showTimestamp?: boolean;
  showLevel?: boolean;
  showProjectName?: boolean;
  showHeader?: boolean;

  // Custom colors and emojis
  customColors?: Record<string, string>;
  customEmojis?: Record<string, string>;

  // Log levels
  logLevels?: LogLevels;
}
```

### PerformanceLoggerConfig

```typescript
interface PerformanceLoggerConfig extends LoggerConfig {
  // Performance monitoring
  enablePerformanceLogging?: boolean;
  enableAutoMetrics?: boolean;
  performanceLogInterval?: number;

  // Performance monitor configuration
  performance?: Partial<PerformanceConfig>;
}
```

### PerformanceConfig

```typescript
interface PerformanceConfig {
  enableMemoryTracking: boolean;
  enableCpuTracking: boolean;
  enableThroughputTracking: boolean;
  enableErrorTracking: boolean;
  maxMetricsHistory: number;
  autoCleanupInterval: number;
  performanceThresholds: {
    slowOperationThreshold: number;
    errorRateThreshold: number;
    memoryThreshold: number;
  };
}
```

### NextJSLoggerConfig

```typescript
interface NextJSLoggerConfig extends LoggerConfig {
  // App Router features
  enableAppRouterLogging?: boolean;
  enableServerComponents?: boolean;
  enableClientComponents?: boolean;
  enableStreaming?: boolean;
  enableSuspense?: boolean;
  enableParallelRoutes?: boolean;
  enableInterceptingRoutes?: boolean;

  // Legacy Next.js features
  enableSSRLogging?: boolean;
  enableAPILogging?: boolean;
  enablePageLogging?: boolean;
  enableConsoleMethods?: boolean;
  enableGrouping?: boolean;
  maxGroupDepth?: number;
}
```

## Types and Interfaces

### LogData

```typescript
type LogData = Record<string, unknown> | Error | null | undefined;
```

### LogContext

```typescript
type LogContext = Record<string, unknown>;
```

### LogLevels

```typescript
interface LogLevels {
  debug: LogLevel;
  info: LogLevel;
  warn: LogLevel;
  error: LogLevel;
  trace: LogLevel;
  log: LogLevel;
}

interface LogLevel {
  level: string;
  color: string;
  emoji: string;
  enabled: boolean;
}
```

### PerformanceMetric

```typescript
interface PerformanceMetric {
  id: string;
  name: string;
  category: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
  status: 'running' | 'completed' | 'failed';
  error?: Error | undefined;
}
```

### PerformanceStats

```typescript
interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
}
```

### PerformanceHealth

```typescript
interface PerformanceHealth {
  healthy: boolean;
  warnings: string[];
  critical: string[];
}
```

### EdgeColorOptions

```typescript
interface EdgeColorOptions {
  enableColors?: boolean;
  forcePlainText?: boolean;
  customColors?: Record<string, string>;
}
```

### ColorInfo

```typescript
interface ColorInfo {
  isEdgeRuntime: boolean;
  supportsColors: boolean;
  enableColors: boolean;
  forcePlainText: boolean;
}
```

## Edge Runtime Compatibility

### Automatic Detection

LogHorn automatically detects Edge Runtime environments and adjusts behavior
accordingly:

```typescript
// Automatically detects Edge Runtime
const logger = createLogger(); // Works in both Node.js and Edge Runtime

// Edge-specific color management
const edgeColorManager = new EdgeColorManager({
  enableColors: true,
  customColors: {
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
  },
});
```

### Edge Runtime Limitations

- **Memory Tracking**: Disabled in Edge Runtime (no `process.memoryUsage`)
- **CPU Tracking**: Disabled in Edge Runtime (no `process.cpuUsage`)
- **Node.js APIs**: Not available in Edge Runtime
- **File System**: Not available in Edge Runtime

### Edge Runtime Features

- ✅ **Performance Monitoring**: Works without Node.js APIs
- ✅ **Color Support**: ANSI codes for terminal colors
- ✅ **Asynchronous Logging**: Non-blocking operations
- ✅ **Rate Limiting**: Protection against log spam
- ✅ **Object Pooling**: Memory-efficient operations
- ✅ **Next.js Integration**: Full App Router support

## Examples

### Basic Usage

```typescript
import { createLogger } from 'loghorn';

const logger = createLogger();

logger.info('Application started');
logger.warn('Deprecated feature used');
logger.error('Database connection failed', { retryCount: 3 });
```

### Performance Monitoring

```typescript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger();

// Track database operations
const users = await logger.trackPerformance(
  'fetch-users',
  async () => {
    const response = await fetch('/api/users');
    return response.json();
  },
  'api',
);

// Monitor performance health
const health = logger.checkPerformanceHealth();
if (!health.healthy) {
  console.log('Performance issues detected');
}
```

### Next.js Integration

```typescript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

// App Router specific logging
logger.serverComponent('UserProfile', 'Component rendered', { userId: '123' });
logger.clientComponent('UserForm', 'Component mounted', { formId: 'form-1' });
logger.streaming('Stream started', { chunkSize: 1024 });
logger.suspense('UserDataBoundary', 'Loading user data', { userId: '123' });
```

### Group Logging

```typescript
logger.group('User Authentication', async () => {
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

### Context Management

```typescript
// Set request context
logger.setContext({
  requestId: req.headers['x-request-id'],
  userId: req.user?.id,
  sessionId: req.session?.id,
});

// Log with context
logger.info('User action', { action: 'login', timestamp: Date.now() });

// Clear context
logger.clearContext();
```

### Configuration Updates

```typescript
// Update configuration at runtime
logger.updateConfig({
  enableColors: false,
  enableEmojis: false,
  enableJSON: true,
});

// Get current configuration
const config = logger.getConfig();
console.log('Current environment:', config.environment);
```

### Performance Health Monitoring

```typescript
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
