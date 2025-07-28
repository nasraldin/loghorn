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

// Helper function to get environment variables with framework prefixes
function getEnvVar(key: string): string | undefined {
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
}

// Helper function to check if any environment variables are available
function hasAnyEnvironmentVariables(): boolean {
  if (
    typeof process === 'undefined' &&
    typeof globalThis !== 'undefined' &&
    'window' in globalThis
  ) {
    const envVarKeys = [
      'LOGHORN_SHOW_HEADER',
      'LOGHORN_ENABLE_COLORS',
      'LOGHORN_ENVIRONMENT',
      'NEXT_PUBLIC_LOGHORN_SHOW_HEADER',
      'VITE_LOGHORN_SHOW_HEADER',
      'REACT_APP_LOGHORN_SHOW_HEADER',
    ];
    return envVarKeys.some((key) => getEnvVar(key) !== undefined);
  }
  return true;
}

// Helper function to set boolean config from environment variable
function setBooleanConfig(
  config: Partial<LoggerConfig>,
  envKey: string,
  configKey: keyof LoggerConfig,
): void {
  const value = getEnvVar(envKey);
  if (value !== undefined) {
    (config as any)[configKey] = value === 'true';
  }
}

// Helper function to load project name from various sources
function loadProjectName(): string | undefined {
  return (
    getEnvVar('LOGHORN_PROJECT_NAME') ||
    process.env['PROJECT_NAME'] ||
    process.env['APP_NAME'] ||
    process.env['NEXT_PUBLIC_APP_NAME'] ||
    process.env['VITE_APP_NAME'] ||
    process.env['REACT_APP_NAME'] ||
    process.env['npm_package_name']
  );
}

// Helper function to load log levels configuration
function loadLogLevels(): Record<LogLevel, LogConfig> {
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

  return logLevels;
}

export function loadConfigFromEnv(): Partial<LoggerConfig> {
  const config: Partial<LoggerConfig> = {};

  // Early return if no environment access
  if (!hasAnyEnvironmentVariables()) {
    return config;
  }

  // Environment
  const environment = getEnvVar('LOGHORN_ENVIRONMENT');
  if (environment) {
    config.environment = environment as Environment;
  }

  // Project name
  const projectName = loadProjectName();
  if (projectName) {
    config.projectName = projectName;
  }

  // Features
  setBooleanConfig(config, 'LOGHORN_ENABLE_COLORS', 'enableColors');
  setBooleanConfig(config, 'LOGHORN_ENABLE_EMOJIS', 'enableEmojis');
  setBooleanConfig(config, 'LOGHORN_ENABLE_TIMESTAMPS', 'enableTimestamps');
  setBooleanConfig(config, 'LOGHORN_ENABLE_STACK_TRACES', 'enableStackTraces');
  setBooleanConfig(config, 'LOGHORN_ENABLE_JSON', 'enableJSON');
  setBooleanConfig(config, 'LOGHORN_ENABLE_TABLE', 'enableTable');
  setBooleanConfig(config, 'LOGHORN_SHOW_EMOJI', 'showEmoji');
  setBooleanConfig(config, 'LOGHORN_SHOW_TIMESTAMP', 'showTimestamp');
  setBooleanConfig(config, 'LOGHORN_SHOW_LEVEL', 'showLevel');
  setBooleanConfig(config, 'LOGHORN_SHOW_PROJECT_NAME', 'showProjectName');
  setBooleanConfig(config, 'LOGHORN_SHOW_HEADER', 'showHeader');

  // Log levels
  config.logLevels = loadLogLevels();

  return config;
}
