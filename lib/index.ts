import { Logger } from './core/logger';
import type { LoggerConfig } from './types';

// Core exports
export { Logger } from './core/logger';

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
  LoggerConfig,
  LogEntry,
  LogContext,
  MiddlewareOptions,
  BrowserLoggerConfig,
  NestJSLoggerConfig,
  ReactLoggerConfig,
  VueLoggerConfig,
  AngularLoggerConfig,
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
export function createLogger(config?: Partial<LoggerConfig>): Logger {
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

// Default logger instance
export const logger = createLogger();

// Convenience exports for common use cases
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const trace = logger.trace.bind(logger);
export const log = logger.logMessage.bind(logger);

// Convenience methods
export const success = logger.success.bind(logger);
export const failure = logger.failure.bind(logger);
export const start = logger.start.bind(logger);
export const end = logger.end.bind(logger);
export const group = logger.group.bind(logger);
export const groupCollapsed = logger.groupCollapsed.bind(logger);
export const groupAsync = logger.groupAsync.bind(logger);
export const time = logger.time.bind(logger);
export const timeEnd = logger.timeEnd.bind(logger);
