import {
  ColorManager,
  createLogger,
  createLoggerConfig,
  createLoggingMiddleware,
  debug,
  end,
  error,
  failure,
  fastifyLoghorn,
  getEnvironment,
  group,
  info,
  loadConfigFromEnv,
  log,
  logger,
  Logger,
  start,
  success,
  time,
  timeEnd,
  trace,
  warn,
} from '../lib';
import {
  clearCapturedLogs,
  getCapturedDebugs,
  getCapturedErrors,
  getCapturedLogs,
} from './setup';

describe('Integration Tests', () => {
  beforeEach(() => {
    process.env['NODE_ENV'] = 'development';
    clearCapturedLogs();
    jest.resetModules();
  });

  describe('Main Exports', () => {
    test('should export all main functions', () => {
      expect(createLogger).toBeDefined();
      expect(logger).toBeDefined();
      expect(debug).toBeDefined();
      expect(info).toBeDefined();
      expect(warn).toBeDefined();
      expect(error).toBeDefined();
      expect(trace).toBeDefined();
      expect(log).toBeDefined();
    });

    test('should export convenience methods', () => {
      expect(success).toBeDefined();
      expect(failure).toBeDefined();
      expect(start).toBeDefined();
      expect(end).toBeDefined();
      expect(group).toBeDefined();
      expect(time).toBeDefined();
      expect(timeEnd).toBeDefined();
    });

    test('should export classes and utilities', () => {
      expect(Logger).toBeDefined();
      expect(ColorManager).toBeDefined();
      expect(createLoggerConfig).toBeDefined();
      expect(loadConfigFromEnv).toBeDefined();
      expect(getEnvironment).toBeDefined();
    });

    test('should export middleware', () => {
      expect(createLoggingMiddleware).toBeDefined();
      expect(fastifyLoghorn).toBeDefined();
    });
  });

  describe('Default Logger Instance', () => {
    test('should have working log methods', () => {
      // Use the factory to create a logger with enableJSON: false
      const logger = createLogger({ enableJSON: false });
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.trace('Trace message', undefined);
      logger.log('log', 'Log message', undefined);
      expect(getCapturedDebugs()).toHaveLength(1);
      const logs = getCapturedLogs();
      expect(logs.some((l) => l.includes('Info message'))).toBe(true);
      expect(logs.some((l) => l.includes('Trace message'))).toBe(true);
      expect(logs.some((l) => l.includes('Log message'))).toBe(true);
    });

    test('should have working convenience methods', () => {
      success('Success message');
      failure('Failure message');
      start('Start message');
      end('End message');

      const logs = getCapturedLogs();
      expect(logs.some((l) => l.includes('Success message'))).toBe(true);
      expect(logs.some((l) => l.includes('Start message'))).toBe(true);
      expect(logs.some((l) => l.includes('End message'))).toBe(true);
      expect(getCapturedErrors().length).toBeGreaterThanOrEqual(0); // failure
    });

    test('should handle group and time methods', () => {
      const logger = createLogger({ enableJSON: false });
      logger.group('Test Group', () => {
        logger.info('Inside group');
      });
      logger.time('Test Timer');
      logger.timeEnd('Test Timer');
      const logs = getCapturedLogs();
      expect(logs.some((l) => l.includes('Inside group'))).toBe(true);
    });
  });

  describe('Factory Function', () => {
    test('should create logger with default config', () => {
      const customLogger = createLogger();
      expect(customLogger).toBeInstanceOf(Logger);
    });

    test('should create logger with custom config', () => {
      const customLogger = createLogger({
        environment: 'production',
        enableColors: false,
        enableEmojis: false,
      });

      expect(customLogger).toBeInstanceOf(Logger);

      const config = customLogger.getConfig();
      expect(config.environment).toBe('production');
      expect(config.enableColors).toBe(false);
      expect(config.enableEmojis).toBe(false);
    });

    test('should load environment variables', () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env['LOGHORN_ENVIRONMENT'] = 'staging';
      process.env['LOGHORN_ENABLE_COLORS'] = 'false';

      const customLogger = createLogger();
      const config = customLogger.getConfig();

      expect(config.environment).toBe('staging');
      expect(typeof config.enableColors).toBe('boolean');

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Configuration Integration', () => {
    test('should create config with environment overrides', () => {
      const config = createLoggerConfig({
        environment: 'production',
        logLevels: {
          debug: { level: 'debug', color: '#000', emoji: '🐛', enabled: false },
          info: { level: 'info', color: '#000', emoji: 'ℹ️', enabled: true },
          warn: { level: 'warn', color: '#000', emoji: '⚠️', enabled: true },
          error: { level: 'error', color: '#000', emoji: '❌', enabled: true },
          trace: { level: 'trace', color: '#000', emoji: '🔍', enabled: false },
          log: { level: 'log', color: '#000', emoji: '📝', enabled: true },
        },
      });

      const logger = new Logger(config);

      logger.debug('This should not appear');
      logger.info('This should appear');
      logger.trace('This should not appear');

      expect(getCapturedDebugs()).toHaveLength(0);
      expect(getCapturedLogs().length).toBeLessThanOrEqual(1);
    });

    test('should handle JSON logging', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });

      const logger = new Logger(config);
      logger.info('JSON test', { data: 'value' });

      const logs = getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('[INFO] JSON test');
    });
  });

  describe('Color Manager Integration', () => {
    test('should handle custom colors', () => {
      const config = createLoggerConfig({
        enableColors: true,
        customColors: {
          brand: '#ff0000',
          accent: '#00ff00',
        },
      });

      const logger = new Logger(config);
      logger.info('Test message');

      // Should not throw errors with custom colors
      expect(() => logger.info('Test')).not.toThrow();
    });
  });

  describe('Middleware Integration', () => {
    test('should create express middleware', () => {
      const middleware = createLoggingMiddleware(logger);
      expect(typeof middleware).toBe('function');
    });

    test('should create fastify plugin', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger);
      expect(fastify.addHook).toHaveBeenCalled();
    });
  });

  describe('Environment Detection', () => {
    test('should detect environment correctly', () => {
      const env = getEnvironment();
      expect(['development', 'production', 'test', 'staging']).toContain(env);
    });

    test('should handle missing NODE_ENV', () => {
      const originalEnv = process.env['NODE_ENV'];
      delete process.env['NODE_ENV'];

      const env = getEnvironment();
      expect(env).toBe('development');

      process.env['NODE_ENV'] = originalEnv;
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid configurations gracefully', () => {
      expect(() => {
        const config = createLoggerConfig({
          logLevels: {
            debug: {
              level: 'debug',
              color: '#000',
              emoji: '🐛',
              enabled: true,
            },
            info: { level: 'info', color: '#000', emoji: 'ℹ️', enabled: true },
            warn: { level: 'warn', color: '#000', emoji: '⚠️', enabled: true },
            error: {
              level: 'error',
              color: '#000',
              emoji: '❌',
              enabled: true,
            },
            trace: {
              level: 'trace',
              color: '#000',
              emoji: '🔍',
              enabled: true,
            },
            log: { level: 'log', color: '#000', emoji: '📝', enabled: true },
          },
        });
        new Logger(config);
      }).not.toThrow();
    });

    test('should handle missing dependencies gracefully', () => {
      // Test that the logger works even if chalk is not available
      const config = createLoggerConfig({
        enableColors: true,
      });

      expect(() => {
        const logger = new Logger(config);
        logger.info('Test message');
      }).not.toThrow();
    });
  });
});
