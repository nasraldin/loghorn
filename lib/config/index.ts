import type { Environment, LogConfig, LoggerConfig, LogLevel } from '../types';

export const DEFAULT_LOG_LEVELS: Record<LogLevel, LogConfig> = {
  debug: {
    level: 'debug',
    color: '#6c757d',
    emoji: '🐛',
    enabled: true,
  },
  info: {
    level: 'info',
    color: '#17a2b8',
    emoji: 'ℹ️',
    enabled: true,
  },
  warn: {
    level: 'warn',
    color: '#ffc107',
    emoji: '⚠️',
    enabled: true,
  },
  error: {
    level: 'error',
    color: '#dc3545',
    emoji: '❌',
    enabled: true,
  },
  trace: {
    level: 'trace',
    color: '#6f42c1',
    emoji: '🔍',
    enabled: true,
  },
  log: {
    level: 'log',
    color: '#28a745',
    emoji: '📝',
    enabled: true,
  },
};

export const ENVIRONMENT_CONFIGS: Record<Environment, Partial<LoggerConfig>> = {
  development: {
    enableColors: true,
    enableEmojis: true,
    enableTimestamps: true,
    enableStackTraces: true,
    enableJSON: false,
    logLevels: {
      ...DEFAULT_LOG_LEVELS,
      debug: { ...DEFAULT_LOG_LEVELS.debug, enabled: true },
      trace: { ...DEFAULT_LOG_LEVELS.trace, enabled: true },
    },
    middleware: {
      enabled: true,
      logRequests: true,
      logResponses: true,
      logErrors: true,
      excludePaths: ['/health', '/metrics'],
    },
  },
  production: {
    enableColors: false,
    enableEmojis: false,
    enableTimestamps: true,
    enableStackTraces: false,
    enableJSON: true,
    logLevels: {
      ...DEFAULT_LOG_LEVELS,
      debug: { ...DEFAULT_LOG_LEVELS.debug, enabled: false },
      trace: { ...DEFAULT_LOG_LEVELS.trace, enabled: false },
    },
    middleware: {
      enabled: true,
      logRequests: false,
      logResponses: false,
      logErrors: true,
      excludePaths: ['/health', '/metrics', '/favicon.ico'],
    },
  },
  test: {
    enableColors: false,
    enableEmojis: false,
    enableTimestamps: false,
    enableStackTraces: false,
    enableJSON: true,
    logLevels: {
      ...DEFAULT_LOG_LEVELS,
      debug: { ...DEFAULT_LOG_LEVELS.debug, enabled: false },
      info: { ...DEFAULT_LOG_LEVELS.info, enabled: false },
      warn: { ...DEFAULT_LOG_LEVELS.warn, enabled: false },
      trace: { ...DEFAULT_LOG_LEVELS.trace, enabled: false },
    },
    middleware: {
      enabled: false,
      logRequests: false,
      logResponses: false,
      logErrors: false,
    },
  },
  staging: {
    enableColors: true,
    enableEmojis: true,
    enableTimestamps: true,
    enableStackTraces: true,
    enableJSON: true,
    logLevels: {
      ...DEFAULT_LOG_LEVELS,
      debug: { ...DEFAULT_LOG_LEVELS.debug, enabled: true },
      trace: { ...DEFAULT_LOG_LEVELS.trace, enabled: false },
    },
    middleware: {
      enabled: true,
      logRequests: true,
      logResponses: true,
      logErrors: true,
      excludePaths: ['/health', '/metrics'],
    },
  },
};

export function getEnvironment(): Environment {
  const env = (
    typeof process !== 'undefined'
      ? process.env['NODE_ENV']?.toLowerCase()
      : undefined
  ) as Environment;
  return env && ENVIRONMENT_CONFIGS[env] ? env : 'development';
}

export function createLoggerConfig(
  overrides: Partial<LoggerConfig> = {},
): LoggerConfig {
  const environment = overrides.environment || getEnvironment();
  const baseConfig = ENVIRONMENT_CONFIGS[environment] || {};

  const config: LoggerConfig = {
    environment,
    logLevels: {
      ...DEFAULT_LOG_LEVELS,
      ...baseConfig.logLevels,
      ...overrides.logLevels,
    },
    enableColors: overrides.enableColors ?? baseConfig.enableColors ?? true,
    enableEmojis: overrides.enableEmojis ?? baseConfig.enableEmojis ?? true,
    enableTimestamps:
      overrides.enableTimestamps ?? baseConfig.enableTimestamps ?? true,
    enableStackTraces:
      overrides.enableStackTraces ?? baseConfig.enableStackTraces ?? false,
    enableJSON: overrides.enableJSON ?? baseConfig.enableJSON ?? false,
    prettyJSON: overrides.prettyJSON ?? baseConfig.prettyJSON ?? false,
    enableTable: overrides.enableTable ?? baseConfig.enableTable ?? true,
    middleware: {
      enabled: baseConfig.middleware?.enabled ?? false,
      logRequests: baseConfig.middleware?.logRequests ?? false,
      logResponses: baseConfig.middleware?.logResponses ?? false,
      logErrors: baseConfig.middleware?.logErrors ?? false,
      excludePaths: baseConfig.middleware?.excludePaths ?? [],
      ...overrides.middleware,
    },
  };

  // Handle optional properties
  if (overrides.customColors) {
    config.customColors = overrides.customColors;
  }
  if (overrides.customEmojis) {
    config.customEmojis = overrides.customEmojis;
  }

  return config;
}

export function loadConfigFromEnv(): Partial<LoggerConfig> {
  const config: Partial<LoggerConfig> = {};

  if (typeof process === 'undefined') {
    return config;
  }

  // Environment
  if (process.env['LOGHORN_ENVIRONMENT']) {
    config.environment = process.env['LOGHORN_ENVIRONMENT'] as Environment;
  }

  // Features
  if (process.env['LOGHORN_ENABLE_COLORS']) {
    config.enableColors = process.env['LOGHORN_ENABLE_COLORS'] === 'true';
  }

  if (process.env['LOGHORN_ENABLE_EMOJIS']) {
    config.enableEmojis = process.env['LOGHORN_ENABLE_EMOJIS'] === 'true';
  }

  if (process.env['LOGHORN_ENABLE_TIMESTAMPS']) {
    config.enableTimestamps = process.env['LOGHORN_ENABLE_TIMESTAMPS'] === 'true';
  }

  if (process.env['LOGHORN_ENABLE_STACK_TRACES']) {
    config.enableStackTraces =
      process.env['LOGHORN_ENABLE_STACK_TRACES'] === 'true';
  }

  if (process.env['LOGHORN_ENABLE_JSON']) {
    config.enableJSON = process.env['LOGHORN_ENABLE_JSON'] === 'true';
  }

  if (process.env['LOGHORN_ENABLE_TABLE']) {
    config.enableTable = process.env['LOGHORN_ENABLE_TABLE'] === 'true';
  }

  // Log levels
  const logLevels: Record<LogLevel, LogConfig> = { ...DEFAULT_LOG_LEVELS };

  Object.keys(DEFAULT_LOG_LEVELS).forEach((level) => {
    const envKey = `LOGHORN_${level.toUpperCase()}_ENABLED`;
    if (process.env[envKey] !== undefined) {
      logLevels[level as LogLevel] = {
        ...logLevels[level as LogLevel],
        enabled: process.env[envKey] === 'true',
      };
    }
  });

  config.logLevels = logLevels;

  // Middleware
  if (process.env['LOGHORN_MIDDLEWARE_ENABLED']) {
    config.middleware = {
      enabled: process.env['LOGHORN_MIDDLEWARE_ENABLED'] === 'true',
      logRequests: process.env['LOGHORN_MIDDLEWARE_LOG_REQUESTS'] === 'true',
      logResponses: process.env['LOGHORN_MIDDLEWARE_LOG_RESPONSES'] === 'true',
      logErrors: process.env['LOGHORN_MIDDLEWARE_LOG_ERRORS'] === 'true',
      excludePaths:
        process.env['LOGHORN_MIDDLEWARE_EXCLUDE_PATHS']
          ?.split(',')
          .map((p) => p.trim()) || [],
    };
  }

  return config;
}
