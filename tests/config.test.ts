import {
  createLoggerConfig,
  DEFAULT_LOG_LEVELS,
  ENVIRONMENT_CONFIGS,
  getEnvironment,
  loadConfigFromEnv,
} from '../lib/config';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnvironment', () => {
    test('should return development as default', () => {
      delete process.env['NODE_ENV'];
      const env = getEnvironment();
      expect(env).toBe('development');
    });

    test('should return correct environment from NODE_ENV', () => {
      process.env['NODE_ENV'] = 'production';
      const env = getEnvironment();
      expect(env).toBe('production');
    });

    test('should return development for invalid environment', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'invalid';
      const env = require('../lib/config').getEnvironment();
      process.env['NODE_ENV'] = originalEnv;
      expect(env).toBe('development');
    });

    test('getEnvironment returns development when NODE_ENV is undefined', () => {
      const originalEnv = process.env['NODE_ENV'];
      delete process.env['NODE_ENV'];
      const env = require('../lib/config').getEnvironment();
      process.env['NODE_ENV'] = originalEnv;
      expect(env).toBe('development');
    });

    test('getEnvironment returns development when environment exists but config is falsy', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'custom';
      // Temporarily set a falsy value for the custom environment
      (require('../lib/config').ENVIRONMENT_CONFIGS as any)['custom'] = null;
      const env = require('../lib/config').getEnvironment();
      process.env['NODE_ENV'] = originalEnv;
      // Restore the original config
      delete (require('../lib/config').ENVIRONMENT_CONFIGS as any)['custom'];
      expect(env).toBe('development');
    });

    test('getEnvironment returns development when ENVIRONMENT_CONFIGS[env] is null', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'custom';
      (require('../lib/config').ENVIRONMENT_CONFIGS as any)['custom'] = null;
      const env = require('../lib/config').getEnvironment();
      process.env['NODE_ENV'] = originalEnv;
      delete (require('../lib/config').ENVIRONMENT_CONFIGS as any)['custom'];
      expect(env).toBe('development');
    });

    test('getEnvironment returns development when ENVIRONMENT_CONFIGS[env] is 0', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'custom';
      (require('../lib/config').ENVIRONMENT_CONFIGS as any)['custom'] = 0;
      const env = require('../lib/config').getEnvironment();
      process.env['NODE_ENV'] = originalEnv;
      delete (require('../lib/config').ENVIRONMENT_CONFIGS as any)['custom'];
      expect(env).toBe('development');
    });

    test('getEnvironment returns env when NODE_ENV is valid and config exists', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';
      const env = require('../lib/config').getEnvironment();
      process.env['NODE_ENV'] = originalEnv;
      expect(env).toBe('production');
    });

    it('should return development for valid environment', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';

      expect(getEnvironment()).toBe('production');

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should return development for invalid environment', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'invalid-env';

      expect(getEnvironment()).toBe('development');

      process.env['NODE_ENV'] = originalEnv;
    });

    it('should return development when NODE_ENV is undefined', () => {
      const originalEnv = process.env['NODE_ENV'];
      delete process.env['NODE_ENV'];

      expect(getEnvironment()).toBe('development');

      process.env['NODE_ENV'] = originalEnv;
    });
  });

  describe('createLoggerConfig', () => {
    test('should create default config', () => {
      // Reset environment to ensure consistent test
      const originalEnv = process.env['NODE_ENV'];
      delete process.env['NODE_ENV'];

      const config = createLoggerConfig();
      expect(config).toMatchObject({
        environment: 'development',
        enableColors: true,
        enableEmojis: true,
        enableTimestamps: true,
        enableStackTraces: true,
        enableJSON: false,
      });

      // Restore environment
      process.env['NODE_ENV'] = originalEnv;
    });

    test('should merge custom config', () => {
      const customConfig = {
        environment: 'production' as const,
        enableColors: false,
        customColors: { custom: '#ff0000' },
      };

      const config = createLoggerConfig(customConfig);
      expect(config).toMatchObject({
        environment: 'production',
        enableColors: false,
        customColors: { custom: '#ff0000' },
      });
    });

    test('should merge log levels correctly', () => {
      const customLogLevels = {
        debug: {
          level: 'debug' as const,
          color: '#000',
          emoji: '🐛',
          enabled: false,
        },
        info: DEFAULT_LOG_LEVELS.info,
        warn: DEFAULT_LOG_LEVELS.warn,
        error: DEFAULT_LOG_LEVELS.error,
        trace: DEFAULT_LOG_LEVELS.trace,
        log: DEFAULT_LOG_LEVELS.log,
      };

      const config = createLoggerConfig({ logLevels: customLogLevels });
      expect(config.logLevels.debug.enabled).toBe(false);
      expect(config.logLevels.info.enabled).toBe(true); // Should keep default
    });

    test('should merge middleware config', () => {
      const customMiddleware = {
        enabled: true,
        logRequests: false,
        logResponses: true,
        logErrors: true,
        excludePaths: ['/health'],
      };

      const config = createLoggerConfig({ middleware: customMiddleware });
      expect(config.middleware).toMatchObject(customMiddleware);
    });

    test('should handle missing env vars gracefully', () => {
      // Reset environment to ensure no env vars are set
      const originalEnv = { ...process.env };
      process.env = {};

      const config = loadConfigFromEnv();
      expect(config).toHaveProperty('logLevels');

      // Restore environment
      process.env = originalEnv;
    });

    test('should include customColors in config if provided', () => {
      const config = createLoggerConfig({ customColors: { brand: '#123456' } });
      expect(config.customColors).toEqual({ brand: '#123456' });
    });

    test('should include customEmojis in config if provided', () => {
      const config = createLoggerConfig({ customEmojis: { info: '💡' } });
      expect(config.customEmojis).toEqual({ info: '💡' });
    });

    test('createLoggerConfig with production environment', () => {
      const config = createLoggerConfig({ environment: 'production' });
      expect(config.environment).toBe('production');
      expect(config.enableColors).toBe(false);
      expect(config.enableEmojis).toBe(false);
      expect(config.enableJSON).toBe(true);
      expect(config.middleware?.enabled).toBe(true);
      expect(config.middleware?.logRequests).toBe(false);
      expect(config.middleware?.logResponses).toBe(false);
      expect(config.middleware?.logErrors).toBe(true);
    });

    test('createLoggerConfig with staging environment', () => {
      const config = createLoggerConfig({ environment: 'staging' });
      expect(config.environment).toBe('staging');
      expect(config.enableColors).toBe(true);
      expect(config.enableEmojis).toBe(true);
      expect(config.enableJSON).toBe(true);
      expect(config.middleware?.enabled).toBe(true);
      expect(config.middleware?.logRequests).toBe(true);
      expect(config.middleware?.logResponses).toBe(true);
      expect(config.middleware?.logErrors).toBe(true);
    });

    test('createLoggerConfig with test environment', () => {
      const config = createLoggerConfig({ environment: 'test' });
      expect(config.environment).toBe('test');
      expect(config.enableColors).toBe(false);
      expect(config.enableEmojis).toBe(false);
      expect(config.enableJSON).toBe(true);
      expect(config.middleware?.enabled).toBe(false);
      expect(config.middleware?.logRequests).toBe(false);
      expect(config.middleware?.logResponses).toBe(false);
      expect(config.middleware?.logErrors).toBe(false);
    });

    test('createLoggerConfig with development environment', () => {
      const config = createLoggerConfig({ environment: 'development' });
      expect(config.environment).toBe('development');
      expect(config.enableColors).toBe(true);
      expect(config.enableEmojis).toBe(true);
      expect(config.enableTimestamps).toBe(true);
      expect(config.enableStackTraces).toBe(true);
      expect(config.enableJSON).toBe(false);
      expect(config.middleware?.enabled).toBe(true);
      expect(config.middleware?.logRequests).toBe(true);
      expect(config.middleware?.logResponses).toBe(true);
      expect(config.middleware?.logErrors).toBe(true);
      expect(config.middleware?.excludePaths).toEqual(['/health', '/metrics']);
      expect(config.logLevels?.debug.enabled).toBe(true);
      expect(config.logLevels?.trace.enabled).toBe(true);
    });

    test('createLoggerConfig merges middleware and logLevels overrides', () => {
      const config = createLoggerConfig({
        environment: 'development',
        middleware: {
          enabled: true,
          logRequests: false,
          logResponses: true,
          logErrors: true,
          excludePaths: ['/custom'],
        },
        logLevels: {
          debug: { ...DEFAULT_LOG_LEVELS.debug, enabled: true },
          info: { ...DEFAULT_LOG_LEVELS.info, enabled: false },
          warn: { ...DEFAULT_LOG_LEVELS.warn, enabled: true },
          error: { ...DEFAULT_LOG_LEVELS.error, enabled: true },
          trace: { ...DEFAULT_LOG_LEVELS.trace, enabled: true },
          log: { ...DEFAULT_LOG_LEVELS.log, enabled: true },
        },
      });
      expect(config.middleware?.enabled).toBe(true); // from override
      expect(config.middleware?.logRequests).toBe(false); // override
      expect(config.middleware?.excludePaths).toEqual(['/custom']); // override
      expect(config.logLevels?.info.enabled).toBe(false); // override
      expect(config.logLevels?.debug.enabled).toBe(true); // override
    });

    test('createLoggerConfig uses default values when baseConfig properties are undefined', () => {
      // Simulate a custom environment with missing properties
      (require('../lib/config').ENVIRONMENT_CONFIGS as any)['custom'] = undefined;
      const config = createLoggerConfig({ environment: 'custom' as any });
      expect(config.enableColors).toBe(true); // default
      expect(config.enableEmojis).toBe(true); // default
      expect(config.enableTimestamps).toBe(true); // default
      expect(config.enableStackTraces).toBe(false); // default
      expect(config.enableJSON).toBe(false); // default
      expect(config.middleware?.enabled).toBe(false); // default
      expect(config.middleware?.logRequests).toBe(false); // default
      expect(config.middleware?.logResponses).toBe(false); // default
      expect(config.middleware?.logErrors).toBe(false); // default
      expect(config.middleware?.excludePaths).toEqual([]); // default
      expect(config.logLevels?.info.enabled).toBe(true); // default
      expect(config.logLevels?.debug.enabled).toBe(true); // default
      expect(config.logLevels?.warn.enabled).toBe(true); // default
      expect(config.logLevels?.error.enabled).toBe(true); // default
      expect(config.logLevels?.trace.enabled).toBe(true); // default
      expect(config.logLevels?.log.enabled).toBe(true); // default
    });
  });

  describe('loadConfigFromEnv', () => {
    test('should load environment from env vars', () => {
      process.env['LOGHORN_ENVIRONMENT'] = 'staging';
      const config = loadConfigFromEnv();
      expect(config.environment).toBe('staging');
    });

    test('should load feature flags from env vars', () => {
      process.env['LOGHORN_ENABLE_COLORS'] = 'false';
      process.env['LOGHORN_ENABLE_EMOJIS'] = 'true';
      process.env['LOGHORN_ENABLE_TIMESTAMPS'] = 'false';
      process.env['LOGHORN_ENABLE_STACK_TRACES'] = 'true';
      process.env['LOGHORN_ENABLE_JSON'] = 'true';

      const config = loadConfigFromEnv();
      expect(config).toMatchObject({
        enableColors: false,
        enableEmojis: true,
        enableTimestamps: false,
        enableStackTraces: true,
        enableJSON: true,
      });
    });

    test('should load log level configurations', () => {
      process.env['LOGHORN_DEBUG_ENABLED'] = 'false';
      process.env['LOGHORN_INFO_ENABLED'] = 'true';
      process.env['LOGHORN_WARN_ENABLED'] = 'false';

      const config = loadConfigFromEnv();
      expect(config.logLevels?.debug.enabled).toBe(false);
      expect(config.logLevels?.info.enabled).toBe(true);
      expect(config.logLevels?.warn.enabled).toBe(false);
    });

    test('should load middleware configuration', () => {
      process.env['LOGHORN_MIDDLEWARE_ENABLED'] = 'true';
      process.env['LOGHORN_MIDDLEWARE_LOG_REQUESTS'] = 'false';
      process.env['LOGHORN_MIDDLEWARE_LOG_RESPONSES'] = 'true';
      process.env['LOGHORN_MIDDLEWARE_LOG_ERRORS'] = 'true';
      process.env['LOGHORN_MIDDLEWARE_EXCLUDE_PATHS'] = '/health,/metrics';

      const config = loadConfigFromEnv();
      expect(config.middleware).toMatchObject({
        enabled: true,
        logRequests: false,
        logResponses: true,
        logErrors: true,
        excludePaths: ['/health', '/metrics'],
      });
    });

    test('should handle missing env vars gracefully', () => {
      // Reset environment to ensure no env vars are set
      const originalEnv = { ...process.env };
      process.env = {};

      const config = loadConfigFromEnv();
      expect(config).toHaveProperty('logLevels');

      // Restore environment
      process.env = originalEnv;
    });

    test('loadConfigFromEnv returns empty config if process is undefined', () => {
      const origProcess = global.process;
      // @ts-ignore
      delete global.process;
      const config = require('../lib/config').loadConfigFromEnv();
      // @ts-ignore
      global.process = origProcess;
      expect(config).toEqual({});
    });

    test('loadConfigFromEnv loads middleware config', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        LOGHORN_MIDDLEWARE_ENABLED: 'true',
        LOGHORN_MIDDLEWARE_LOG_REQUESTS: 'true',
        LOGHORN_MIDDLEWARE_LOG_RESPONSES: 'false',
        LOGHORN_MIDDLEWARE_LOG_ERRORS: 'true',
        LOGHORN_MIDDLEWARE_EXCLUDE_PATHS: '/health,/metrics',
      };
      const config = require('../lib/config').loadConfigFromEnv();
      expect(config.middleware?.enabled).toBe(true);
      expect(config.middleware?.logRequests).toBe(true);
      expect(config.middleware?.logResponses).toBe(false);
      expect(config.middleware?.logErrors).toBe(true);
      expect(config.middleware?.excludePaths).toEqual(['/health', '/metrics']);
      process.env = originalEnv;
    });

    test('loadConfigFromEnv handles empty middleware exclude paths', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        LOGHORN_MIDDLEWARE_ENABLED: 'true',
        LOGHORN_MIDDLEWARE_EXCLUDE_PATHS: '',
      };
      const config = require('../lib/config').loadConfigFromEnv();
      expect(config.middleware?.excludePaths).toEqual(['']);
      process.env = originalEnv;
    });

    test('loadConfigFromEnv loads specific log level configs', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        LOGHORN_DEBUG_ENABLED: 'false',
        LOGHORN_INFO_ENABLED: 'true',
        LOGHORN_WARN_ENABLED: 'false',
        LOGHORN_ERROR_ENABLED: 'true',
        LOGHORN_TRACE_ENABLED: 'false',
        LOGHORN_LOG_ENABLED: 'true',
      };
      const config = require('../lib/config').loadConfigFromEnv();
      expect(config.logLevels?.debug.enabled).toBe(false);
      expect(config.logLevels?.info.enabled).toBe(true);
      expect(config.logLevels?.warn.enabled).toBe(false);
      expect(config.logLevels?.error.enabled).toBe(true);
      expect(config.logLevels?.trace.enabled).toBe(false);
      expect(config.logLevels?.log.enabled).toBe(true);
      process.env = originalEnv;
    });

    test('loadConfigFromEnv handles middleware config with undefined values', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        LOGHORN_MIDDLEWARE_ENABLED: 'true',
        LOGHORN_MIDDLEWARE_LOG_REQUESTS: undefined,
        LOGHORN_MIDDLEWARE_LOG_RESPONSES: undefined,
        LOGHORN_MIDDLEWARE_LOG_ERRORS: undefined,
      };
      const config = require('../lib/config').loadConfigFromEnv();
      expect(config.middleware?.enabled).toBe(true);
      expect(config.middleware?.logRequests).toBe(false);
      expect(config.middleware?.logResponses).toBe(false);
      expect(config.middleware?.logErrors).toBe(false);
      process.env = originalEnv;
    });

    test('loadConfigFromEnv handles undefined environment variables', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        LOGHORN_ENVIRONMENT: undefined,
        LOGHORN_ENABLE_COLORS: undefined,
        LOGHORN_ENABLE_EMOJIS: undefined,
        LOGHORN_ENABLE_TIMESTAMPS: undefined,
        LOGHORN_ENABLE_STACK_TRACES: undefined,
        LOGHORN_ENABLE_JSON: undefined,
      };
      const config = require('../lib/config').loadConfigFromEnv();
      expect(config.environment).toBeUndefined();
      expect(config.enableColors).toBeUndefined();
      expect(config.enableEmojis).toBeUndefined();
      expect(config.enableTimestamps).toBeUndefined();
      expect(config.enableStackTraces).toBeUndefined();
      expect(config.enableJSON).toBeUndefined();
      process.env = originalEnv;
    });
  });

  describe('Environment Configs', () => {
    test('should have correct development config', () => {
      const devConfig = ENVIRONMENT_CONFIGS.development;
      expect(devConfig).toMatchObject({
        enableColors: true,
        enableEmojis: true,
        enableTimestamps: true,
        enableStackTraces: true,
        enableJSON: false,
      });
      expect(devConfig.middleware?.enabled).toBe(true);
    });

    test('should have correct production config', () => {
      const prodConfig = ENVIRONMENT_CONFIGS.production;
      expect(prodConfig).toMatchObject({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: true,
        enableStackTraces: false,
        enableJSON: true,
      });
      expect(prodConfig.middleware?.enabled).toBe(true);
    });

    test('should have correct test config', () => {
      const testConfig = ENVIRONMENT_CONFIGS.test;
      expect(testConfig).toMatchObject({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        enableJSON: true,
      });
      expect(testConfig.middleware?.enabled).toBe(false);
    });

    test('should have correct staging config', () => {
      const stagingConfig = ENVIRONMENT_CONFIGS.staging;
      expect(stagingConfig).toMatchObject({
        enableColors: true,
        enableEmojis: true,
        enableTimestamps: true,
        enableStackTraces: true,
        enableJSON: true,
      });
      expect(stagingConfig.middleware?.enabled).toBe(true);
    });
  });

  describe('Default Log Levels', () => {
    test('should have all required log levels', () => {
      expect(DEFAULT_LOG_LEVELS).toHaveProperty('debug');
      expect(DEFAULT_LOG_LEVELS).toHaveProperty('info');
      expect(DEFAULT_LOG_LEVELS).toHaveProperty('warn');
      expect(DEFAULT_LOG_LEVELS).toHaveProperty('error');
      expect(DEFAULT_LOG_LEVELS).toHaveProperty('trace');
      expect(DEFAULT_LOG_LEVELS).toHaveProperty('log');
    });

    test('should have correct structure for each log level', () => {
      Object.values(DEFAULT_LOG_LEVELS).forEach((level) => {
        expect(level).toHaveProperty('level');
        expect(level).toHaveProperty('color');
        expect(level).toHaveProperty('emoji');
        expect(level).toHaveProperty('enabled');
      });
    });
  });
});
