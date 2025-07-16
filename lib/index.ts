import { Logger } from './core/logger';
import { NextJSLogger } from './frameworks/nextjs';
import type { NextJSLoggerConfig, PartialLoggerConfig } from './types';

// Core exports
export { Logger } from './core/logger';

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
  MiddlewareOptions,
  NextJSLoggerConfig,
  GroupOptions,
  AsyncGroupOptions,
} from './types';

// Utility exports
export { ColorManager } from './utils/colors';

// Middleware exports (Node.js only)
export {
  createLoggingMiddleware,
  createMorganMiddleware,
} from './middleware/express';
export { fastifyLoghorn } from './middleware/fastify';

// Factory function for easy setup
export function createLogger(config?: PartialLoggerConfig): Logger {
  const { createLoggerConfig, loadConfigFromEnv } = require('./config');

  // Load environment configuration
  const envConfig = loadConfigFromEnv();

  // Merge configurations
  const finalConfig = createLoggerConfig({
    ...envConfig,
    ...config,
  });

  return new Logger(finalConfig);
}

// Next.js specific factory function
export function createNextJSLogger(
  config?: Partial<NextJSLoggerConfig>,
): NextJSLogger {
  const { createLoggerConfig, loadConfigFromEnv } = require('./config');

  // Load environment configuration
  const envConfig = loadConfigFromEnv();

  // Merge configurations with Next.js defaults
  const finalConfig = createLoggerConfig({
    ...envConfig,
    ...config,
  }) as NextJSLoggerConfig;

  return new NextJSLogger(finalConfig);
}

// Default logger instance - lazy initialization
let defaultLogger: Logger | null = null;

function getDefaultLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger();
  }
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
