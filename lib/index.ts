import { createLoggerConfig, loadConfigFromEnv } from './config';
import { EdgeLogger } from './core/edge-logger';
import { Logger } from './core/logger';
import { OptimizedLogger } from './core/optimized-logger';
import {
  PerformanceLogger,
  type PerformanceLoggerConfig,
} from './core/performance-logger';
import { NextJSLogger } from './frameworks/nextjs';
import type { NextJSLoggerConfig, PartialLoggerConfig } from './types';

// Core exports
export { Logger } from './core/logger';
export { OptimizedLogger } from './core/optimized-logger';
export { EdgeLogger } from './core/edge-logger';
export { AsyncLogger } from './core/async-logger';
export { LogEntryPool } from './core/object-pool';
export { RateLimiter } from './core/rate-limiter';

// Performance monitoring exports
export { PerformanceLogger } from './core/performance-logger';
export { PerformanceMonitor } from './core/performance-monitor';
export type { PerformanceLoggerConfig } from './core/performance-logger';
export type {
  PerformanceConfig,
  PerformanceMetric,
  PerformanceStats,
} from './core/performance-monitor';

// Framework-specific loggers
export { NextJSLogger } from './frameworks/nextjs';

// Configuration exports
export {
  createLoggerConfig,
  loadConfigFromEnv,
  getEnvironment,
  DEFAULT_LOG_LEVELS,
  ENVIRONMENT_CONFIGS,
} from './config';

// Type exports
export type {
  LogLevel,
  Environment,
  LogConfig,
  PartialLogConfig,
  LoggerConfig,
  PartialLoggerConfig,
  LogEntry,
  LogContext,
  NextJSLoggerConfig,
  GroupOptions,
  AsyncGroupOptions,
} from './types';

// Utility exports
export { ColorManager } from './utils/colors';
export { EdgeColorManager } from './utils/edge-colors';

// Helper function to detect Edge Runtime
function isEdgeRuntime(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    'EdgeRuntime' in globalThis &&
    typeof (globalThis as any).EdgeRuntime === 'string'
  );
}

// Factory function for easy setup
export function createLogger(config?: PartialLoggerConfig): Logger {
  // Load environment configuration
  const envConfig = loadConfigFromEnv();

  // Merge configurations
  const finalConfig = createLoggerConfig({
    ...envConfig,
    ...config,
  });

  // Use Edge Logger for Edge Runtime
  if (isEdgeRuntime()) {
    return new EdgeLogger(finalConfig);
  }

  // Use optimized logger for production
  if (finalConfig.environment === 'production') {
    return new OptimizedLogger(finalConfig);
  }

  return new Logger(finalConfig);
}

// Next.js specific factory function
export function createNextJSLogger(
  config?: Partial<NextJSLoggerConfig>,
): NextJSLogger {
  // Load environment configuration
  const envConfig = loadConfigFromEnv();

  // Merge configurations with Next.js defaults
  const finalConfig = createLoggerConfig({
    ...envConfig,
    ...config,
  }) as NextJSLoggerConfig;

  return new NextJSLogger(finalConfig);
}

// Performance monitoring factory function
export function createPerformanceLogger(
  config?: Partial<PerformanceLoggerConfig>,
): PerformanceLogger {
  // Load environment configuration
  const envConfig = loadConfigFromEnv();

  // Merge configurations
  const finalConfig = createLoggerConfig({
    ...envConfig,
    ...config,
  }) as PerformanceLoggerConfig;

  return new PerformanceLogger(finalConfig);
}

// Default logger instance - lazy initialization
let defaultLogger: Logger | null = null;

function getDefaultLogger(): Logger {
  defaultLogger ??= createLogger();
  return defaultLogger;
}

// Convenience exports for common use cases
export const debug = (...args: Parameters<Logger['debug']>) =>
  getDefaultLogger().debug(...args);
export const info = (...args: Parameters<Logger['info']>) =>
  getDefaultLogger().info(...args);
export const warn = (...args: Parameters<Logger['warn']>) =>
  getDefaultLogger().warn(...args);
export const error = (...args: Parameters<Logger['error']>) =>
  getDefaultLogger().error(...args);
export const trace = (...args: Parameters<Logger['trace']>) =>
  getDefaultLogger().trace(...args);
export const log = (...args: Parameters<Logger['logMessage']>) =>
  getDefaultLogger().logMessage(...args);

// Convenience methods
export const success = (...args: Parameters<Logger['success']>) =>
  getDefaultLogger().success(...args);
export const failure = (...args: Parameters<Logger['failure']>) =>
  getDefaultLogger().failure(...args);
export const start = (...args: Parameters<Logger['start']>) =>
  getDefaultLogger().start(...args);
export const end = (...args: Parameters<Logger['end']>) =>
  getDefaultLogger().end(...args);
export const group = (...args: Parameters<Logger['group']>) =>
  getDefaultLogger().group(...args);
export const groupCollapsed = (...args: Parameters<Logger['groupCollapsed']>) =>
  getDefaultLogger().groupCollapsed(...args);
export const groupAsync = (...args: Parameters<Logger['groupAsync']>) =>
  getDefaultLogger().groupAsync(...args);
export const time = (...args: Parameters<Logger['time']>) =>
  getDefaultLogger().time(...args);
export const timeEnd = (...args: Parameters<Logger['timeEnd']>) =>
  getDefaultLogger().timeEnd(...args);

// Export the default logger instance
export const logger = new Proxy({} as Logger, {
  get(_target, prop) {
    return getDefaultLogger()[prop as keyof Logger];
  },
});

// Cleanup function for tests
export async function cleanupDefaultLogger(): Promise<void> {
  if (
    defaultLogger &&
    'destroy' in defaultLogger &&
    typeof (defaultLogger as any).destroy === 'function'
  ) {
    await (defaultLogger as any).destroy();
    defaultLogger = null;
  }
}
