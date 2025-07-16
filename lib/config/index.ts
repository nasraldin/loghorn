import type {
  Environment,
  LogConfig,
  LoggerConfig,
  LogLevel,
  PartialLoggerConfig,
} from '../types';

export const DEFAULT_LOG_LEVELS: Record<LogLevel, LogConfig> = {
  debug: {
    level: 'debug',
    color: '#6c757d',
    emoji: '🔧',
    enabled: true,
  },
  info: {
    level: 'info',
    color: '#17a2b8',
    emoji: '💡',
    enabled: true,
  },
  warn: {
    level: 'warn',
    color: '#ffc107',
    emoji: '⚡',
    enabled: true,
  },
  error: {
    level: 'error',
    color: '#dc3545',
    emoji: '💥',
    enabled: true,
  },
  trace: {
    level: 'trace',
    color: '#6f42c1',
    emoji: '🔬',
    enabled: true,
  },
  log: {
    level: 'log',
    color: '#28a745',
    emoji: '📋',
    enabled: true,
  },
};

export const ENVIRONMENT_CONFIGS: Record<Environment, Partial<LoggerConfig>> = {
  development: {
    enableColors: true,
    enableEmojis: true,
    enableTimestamps: true,
    enableStackTraces: true,
    enableJSON: false, // Use elegant console output by default
    prettyJSON: 2, // Pretty print JSON in development
    enableTable: true,
    // Header display options - explicitly enable all headers in development
    showEmoji: true,
    showTimestamp: true,
    showLevel: true,
    showProjectName: true,
    showHeader: true,
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
    // Header display options - minimal headers in production
    showEmoji: false,
    showTimestamp: true,
    showLevel: true,
    showProjectName: true,
    showHeader: true,
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
  // Check for browser environment first
  if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
    return 'development'; // Default to development in browser
  }

  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    const env = process.env['NODE_ENV']?.toLowerCase() as Environment;
    return env && ENVIRONMENT_CONFIGS[env] ? env : 'development';
  }

  // Fallback
  return 'development';
}

export function createLoggerConfig(
  overrides: PartialLoggerConfig = {},
): LoggerConfig {
  const environment = overrides.environment || getEnvironment();
  const baseConfig = ENVIRONMENT_CONFIGS[environment] || {};

  // Merge log levels properly
  const mergedLogLevels: Record<LogLevel, LogConfig> = { ...DEFAULT_LOG_LEVELS };

  // Apply base config log levels
  if (baseConfig.logLevels) {
    Object.keys(baseConfig.logLevels).forEach((level) => {
      if (
        mergedLogLevels[level as LogLevel] &&
        baseConfig.logLevels?.[level as LogLevel]
      ) {
        mergedLogLevels[level as LogLevel] = {
          ...mergedLogLevels[level as LogLevel],
          ...baseConfig.logLevels[level as LogLevel],
        };
      }
    });
  }

  // Apply override log levels
  if (overrides.logLevels) {
    Object.keys(overrides.logLevels).forEach((level) => {
      if (
        mergedLogLevels[level as LogLevel] &&
        overrides.logLevels?.[level as LogLevel]
      ) {
        mergedLogLevels[level as LogLevel] = {
          ...mergedLogLevels[level as LogLevel],
          ...overrides.logLevels[level as LogLevel],
        };
      }
    });
  }

  const config: LoggerConfig = {
    environment,
    logLevels: mergedLogLevels,
    enableColors: overrides.enableColors ?? baseConfig.enableColors ?? true,
    enableEmojis: overrides.enableEmojis ?? baseConfig.enableEmojis ?? true,
    enableTimestamps:
      overrides.enableTimestamps ?? baseConfig.enableTimestamps ?? true,
    enableStackTraces:
      overrides.enableStackTraces ?? baseConfig.enableStackTraces ?? true, // Enable by default
    enableJSON: overrides.enableJSON ?? baseConfig.enableJSON ?? true, // Enable by default
    prettyJSON: overrides.prettyJSON ?? baseConfig.prettyJSON ?? 2, // Pretty print by default
    enableTable: overrides.enableTable ?? baseConfig.enableTable ?? true,
    // Header display options
    showEmoji: overrides.showEmoji ?? baseConfig.showEmoji ?? true,
    showTimestamp: overrides.showTimestamp ?? baseConfig.showTimestamp ?? true,
    showLevel: overrides.showLevel ?? baseConfig.showLevel ?? true,
    showProjectName:
      overrides.showProjectName ?? baseConfig.showProjectName ?? true,
    showHeader: overrides.showHeader ?? baseConfig.showHeader ?? true,
    ...(overrides.projectName !== undefined || baseConfig.projectName !== undefined
      ? { projectName: overrides.projectName ?? baseConfig.projectName }
      : {}),
    middleware: {
      enabled: baseConfig.middleware?.enabled ?? true, // Enable by default
      logRequests: baseConfig.middleware?.logRequests ?? true, // Enable by default
      logResponses: baseConfig.middleware?.logResponses ?? true, // Enable by default
      logErrors: baseConfig.middleware?.logErrors ?? true, // Enable by default
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

  // Helper function to get environment variables with framework prefixes
  const getEnvVar = (key: string): string | undefined => {
    // Check if we're in a browser environment with access to process.env
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env[key] ||
        process.env[`NEXT_PUBLIC_${key}`] ||
        process.env[`VITE_${key}`] ||
        process.env[`REACT_APP_${key}`] ||
        process.env[`NUXT_${key}`] ||
        process.env[`SVELTE_${key}`]
      );
    }

    // For browser environments, try to access window.__ENV__ or similar
    if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
      const windowAny = globalThis as any;
      return (
        windowAny.__ENV__?.[key] ||
        windowAny.__ENV__?.[`NEXT_PUBLIC_${key}`] ||
        windowAny.__ENV__?.[`VITE_${key}`] ||
        windowAny.__ENV__?.[`REACT_APP_${key}`] ||
        windowAny.__ENV__?.[`NUXT_${key}`] ||
        windowAny.__ENV__?.[`SVELTE_${key}`]
      );
    }

    return undefined;
  };

  // Early return if no environment access
  if (
    typeof process === 'undefined' &&
    typeof globalThis !== 'undefined' &&
    'window' in globalThis
  ) {
    // Try to load from browser environment
    const hasAnyEnvVar = [
      'LOGHORN_SHOW_HEADER',
      'LOGHORN_ENABLE_COLORS',
      'LOGHORN_ENVIRONMENT',
      'NEXT_PUBLIC_LOGHORN_SHOW_HEADER',
      'VITE_LOGHORN_SHOW_HEADER',
      'REACT_APP_LOGHORN_SHOW_HEADER',
    ].some((key) => getEnvVar(key) !== undefined);

    if (!hasAnyEnvVar) {
      return config;
    }
  }

  // Environment
  if (getEnvVar('LOGHORN_ENVIRONMENT')) {
    config.environment = getEnvVar('LOGHORN_ENVIRONMENT') as Environment;
  }

  // Project name - support multiple framework prefixes
  const projectName =
    getEnvVar('LOGHORN_PROJECT_NAME') ||
    process.env['PROJECT_NAME'] ||
    process.env['APP_NAME'] ||
    process.env['NEXT_PUBLIC_APP_NAME'] ||
    process.env['VITE_APP_NAME'] ||
    process.env['REACT_APP_NAME'] ||
    process.env['npm_package_name'];

  if (projectName) {
    config.projectName = projectName;
  }

  // Features
  if (getEnvVar('LOGHORN_ENABLE_COLORS') !== undefined) {
    config.enableColors = getEnvVar('LOGHORN_ENABLE_COLORS') === 'true';
  }

  if (getEnvVar('LOGHORN_ENABLE_EMOJIS') !== undefined) {
    config.enableEmojis = getEnvVar('LOGHORN_ENABLE_EMOJIS') === 'true';
  }

  if (getEnvVar('LOGHORN_ENABLE_TIMESTAMPS') !== undefined) {
    config.enableTimestamps = getEnvVar('LOGHORN_ENABLE_TIMESTAMPS') === 'true';
  }

  if (getEnvVar('LOGHORN_ENABLE_STACK_TRACES') !== undefined) {
    config.enableStackTraces = getEnvVar('LOGHORN_ENABLE_STACK_TRACES') === 'true';
  }

  if (getEnvVar('LOGHORN_ENABLE_JSON') !== undefined) {
    config.enableJSON = getEnvVar('LOGHORN_ENABLE_JSON') === 'true';
  }

  if (getEnvVar('LOGHORN_ENABLE_TABLE') !== undefined) {
    config.enableTable = getEnvVar('LOGHORN_ENABLE_TABLE') === 'true';
  }

  if (getEnvVar('LOGHORN_SHOW_EMOJI') !== undefined) {
    config.showEmoji = getEnvVar('LOGHORN_SHOW_EMOJI') === 'true';
  }

  if (getEnvVar('LOGHORN_SHOW_TIMESTAMP') !== undefined) {
    config.showTimestamp = getEnvVar('LOGHORN_SHOW_TIMESTAMP') === 'true';
  }

  if (getEnvVar('LOGHORN_SHOW_LEVEL') !== undefined) {
    config.showLevel = getEnvVar('LOGHORN_SHOW_LEVEL') === 'true';
  }

  if (getEnvVar('LOGHORN_SHOW_PROJECT_NAME') !== undefined) {
    config.showProjectName = getEnvVar('LOGHORN_SHOW_PROJECT_NAME') === 'true';
  }

  if (getEnvVar('LOGHORN_SHOW_HEADER') !== undefined) {
    config.showHeader = getEnvVar('LOGHORN_SHOW_HEADER') === 'true';
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
