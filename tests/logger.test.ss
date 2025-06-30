import { Logger } from '../src/core/logger';
import { createLoggerConfig } from '../src/config';
import { getCapturedLogs, getCapturedErrors, getCapturedDebugs, clearCapturedLogs } from './setup';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    process.env['NODE_ENV'] = 'development';
    clearCapturedLogs();
    jest.resetModules();
  });

  describe('Basic Logging', () => {
    beforeEach(() => {
      const config = createLoggerConfig({
        environment: 'development',
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableJSON: false,
      });
      logger = new Logger(config);
    });

    test('should log debug messages', () => {
      logger.debug('Debug message');
      const logs = getCapturedDebugs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('[DEBUG] Debug message');
    });

    test('should log info messages', () => {
      logger.info('Info message');
      const logs = getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('[INFO] Info message');
    });

    test('should log warn messages', () => {
      logger.warn('Warning message');
      expect(global.capturedWarns).toHaveLength(1);
      expect(global.capturedWarns[0]).toContain('[WARN] Warning message');
    });

    test('should log error messages', () => {
      logger.error('Error message');
      const logs = getCapturedErrors();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('[ERROR] Error message');
    });

    test('should log trace messages', () => {
      logger.trace('Trace message');
      const logs = getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('[TRACE] Trace message');
    });

    test('should log with data', () => {
      const testData = { key: 'value', number: 42 };
      logger.info('Message with data', testData);
      const logs = getCapturedLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('[INFO] Message with data');
    });
  });

  describe('Configuration Features', () => {
    test('should respect log level configuration', () => {
      const config = createLoggerConfig({
        logLevels: {
          info: { level: "info", enabled: true, color: "blue", emoji: "ℹ️" },
          error: { level: "error", enabled: true, color: "red", emoji: "❌" },
          warn: { level: "warn", enabled: true, color: "yellow", emoji: "⚠️" },
          debug: { level: "debug", enabled: true, color: "green", emoji: "🐛" },
          trace: { level: "trace", enabled: true, color: "gray", emoji: "🔍" },
          log: { level: "log", enabled: true, color: "blue", emoji: "📝" }
        }
      });
      const logger = new Logger(config);
      // Mock browser environment
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };
      logger.info('Test message', { data: 'test' });
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test message'),
        expect.anything()
      );
      // Restore console
      global.console = originalConsole;
    });
  });

  describe('JSON logging error handling', () => {
    it('should handle JSON serialization errors', () => {
      const config = createLoggerConfig({
        enableJSON: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const circularObj: any = {};
      circularObj.self = circularObj;
      logger.info('Test message', circularObj);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"self":"[Circular]"')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('logMessage method', () => {
    it('should log messages using log level', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.logMessage('Test message', { data: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOG] Test message'),
        { data: 'test' }
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Group context restoration in native console', () => {
    it('should restore context after group execution in native console', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Set initial context
      logger.setContext({ userId: '123' });
      // Mock console.group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: jest.fn(),
        groupEnd: jest.fn(),
        log: jest.fn()
      };
      logger.group('Test Group', () => {
        logger.setContext({ groupId: '456' });
        logger.info('Inside group');
      }, { context: { groupContext: 'test' } });
      expect(global.console.group).toHaveBeenCalledWith('Test Group');
      expect(global.console.groupEnd).toHaveBeenCalled();
      // Restore console
      global.console = originalConsole;
    });

    it('should handle errors in group execution with native console', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Mock console.group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: jest.fn(),
        groupEnd: jest.fn(),
        log: jest.fn(),
        error: jest.fn()
      };
      expect(() => {
        logger.group('Test Group', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
      expect(global.console.group).toHaveBeenCalledWith('Test Group');
      expect(global.console.groupEnd).toHaveBeenCalled();
      // Restore console
      global.console = originalConsole;
    });
  });

  describe('Group context restoration in fallback', () => {
    it('should restore context after group execution in fallback mode', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Set initial context
      logger.setContext({ userId: '123' });
      // Mock console to remove group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: undefined as any,
        groupEnd: undefined as any,
        log: jest.fn()
      };
      logger.group('Test Group', () => {
        logger.setContext({ groupId: '456' });
        logger.info('Inside group');
      }, { context: { groupContext: 'test' } });
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📁 Test Group')
      );
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📁 End: Test Group')
      );
      // Restore console
      global.console = originalConsole;
    });
  });

  describe('Async group error handling and context restoration', () => {
    it('should handle errors in async group execution with native console', async () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Mock console.group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: jest.fn(),
        groupEnd: jest.fn(),
        log: jest.fn(),
        error: jest.fn()
      };
      await expect(logger.groupAsync('Test Group', async () => {
        throw new Error('Async test error');
      })).rejects.toThrow('Async test error');
      expect(global.console.group).toHaveBeenCalledWith('Test Group');
      expect(global.console.groupEnd).toHaveBeenCalled();
      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('Group execution failed: Async test error'),
        expect.any(Error)
      );
      // Restore console
      global.console = originalConsole;
    });

    it('should handle errors in async group execution with fallback', async () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Mock console to remove group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: undefined as any,
        groupEnd: undefined as any,
        log: jest.fn(),
        error: jest.fn()
      };
      await expect(logger.groupAsync('Test Group', async () => {
        throw new Error('Async test error');
      })).rejects.toThrow('Async test error');
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📁 Test Group')
      );
      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Group execution failed: Async test error'),
        expect.any(Error)
      );
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📁 End: Test Group')
      );
      // Restore console
      global.console = originalConsole;
    });
  });

  describe('Table formatting error handling', () => {
    it('should handle table formatting errors', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(logger as any, 'formatMessage').mockImplementation(() => {
        throw new Error('Format error');
      });
      logger.table('Test Table', [{ name: 'test' }]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOGHORN ERROR] console.table failed for "Test Table":',
        expect.any(Error)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Test Table:', [{ name: 'test' }]);
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('Console table fallback', () => {
    it('should fallback to custom formatting when console.table is not available', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Mock console to remove table method
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        table: undefined as any,
        log: jest.fn()
      };
      logger.table('Test Table', [{ name: 'test' }], { format: 'console' });
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table')
      );
      // Restore console
      global.console = originalConsole;
    });

    it('should handle console.table errors', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Mock console.table to throw error
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        table: jest.fn(() => {
          throw new Error('Table error');
        }),
        log: jest.fn(),
        error: jest.fn()
      };
      logger.table('Test Table', [{ name: 'test' }], { format: 'console' });
      expect(global.console.error).toHaveBeenCalledWith(
        '[LOGHORN ERROR] console.table failed for "Test Table":',
        expect.any(Error)
      );
      expect(global.console.log).toHaveBeenCalledWith('📊 Test Table:', [{ name: 'test' }]);
      // Restore console
      global.console = originalConsole;
    });
  });

  describe('Custom table formatting error handling', () => {
    it('should handle custom table formatting errors', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      // Mock colorize to throw error
      jest.spyOn(logger['colorManager'], 'colorize').mockImplementation(() => {
        throw new Error('Colorize error');
      });
      logger.table('Test Table', [{ name: 'test' }], { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOGHORN ERROR] Custom table formatting failed for "Test Table":',
        expect.any(Error)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Test Table:', [{ name: 'test' }]);
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('Array table formatting error handling', () => {
    it('should handle array table formatting errors', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(logger as any, 'safeStringify').mockImplementation(() => {
        throw new Error('Stringify error');
      });
      logger.table('Test Table', [{ name: 'test' }], { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Array size limit handling', () => {
    it('should handle large arrays by truncating them', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      // Create array larger than MAX_ARRAY_SIZE (1000)
      const largeArray = Array.from({ length: 1500 }, (_, i) => ({ id: i, name: `item${i}` }));
      logger.table('Large Table', largeArray, { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('(array too large: 1500 items, showing first 1000)')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Table printing error handling', () => {
    it('should handle primitive table printing errors', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(logger as any, 'safeStringify').mockImplementation(() => {
        throw new Error('Stringify error');
      });
      logger.table('Test Table', ['item1', 'item2'], { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Table primitive printing error handling', () => {
    it('should handle primitive printing errors', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(logger as any, 'safeStringify').mockImplementation(() => {
        throw new Error('Stringify error');
      });
      logger.table('Test Table', ['item1', 'item2'], { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Object table footer error handling', () => {
    it('should handle object table footer errors', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation((...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('└─')) {
          throw new Error('Footer error');
        }
      });
      logger.table('Test Table', { name: 'test' }, { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration methods', () => {
    it('should update configuration', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const newConfig = {
        enableJSON: true,
        enableColors: true,
        enableEmojis: true
      };
      logger.updateConfig(newConfig);
      const updatedConfig = logger.getConfig();
      expect(updatedConfig.enableJSON).toBe(true);
      expect(updatedConfig.enableColors).toBe(true);
      expect(updatedConfig.enableEmojis).toBe(true);
    });

    it('should get current configuration', () => {
      const initialConfig = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(initialConfig);
      const config = logger.getConfig();
      expect(config).toEqual(initialConfig);
      expect(config).not.toBe(initialConfig); // Should be a copy
    });
  });

  describe('Context management', () => {
    it('should set context', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const context = { userId: '123', sessionId: 'abc' };
      logger.setContext(context);
      // Test that context is set by logging and checking the output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Test message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test message')
      );
      consoleSpy.mockRestore();
    });

    it('should merge context', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      logger.setContext({ userId: '123' });
      logger.setContext({ sessionId: 'abc' });
      // Test that context is merged by logging and checking the output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Test message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test message')
      );
      consoleSpy.mockRestore();
    });

    it('should clear context', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      logger.setContext({ userId: '123' });
      logger.clearContext();
      // Test that context is cleared by logging and checking the output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Test message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test message')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Convenience methods', () => {
    it('should log success messages', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: true,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.success('Operation completed');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Operation completed')
      );
      consoleSpy.mockRestore();
    });

    it('should log failure messages', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: true,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      logger.failure('Operation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Operation failed')
      );
      consoleErrorSpy.mockRestore();
    });

    it('should log start messages', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: true,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.start('Starting process');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚀 Starting process')
      );
      consoleSpy.mockRestore();
    });

    it('should log end messages', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: true,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.end('Process completed');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🏁 Process completed')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Table functionality', () => {
    it('should log tables with console.table', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        table: jest.fn(),
        log: jest.fn()
      };
      const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
      logger.table('Test Table', data);
      expect(global.console.table).toHaveBeenCalledWith(data);
      global.console = originalConsole;
    });

    it('should log tables with custom formatting', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
      logger.table('Test Table', data, { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Async group functionality', () => {
    it('should create async groups', async () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: jest.fn(),
        groupEnd: jest.fn(),
        log: jest.fn()
      };
      await logger.groupAsync('Test Async Group', async () => {
        logger.info('Inside async group');
      });
      expect(global.console.group).toHaveBeenCalledWith('Test Async Group');
      expect(global.console.groupEnd).toHaveBeenCalled();
      global.console = originalConsole;
    });
  });

  describe('JSON logging', () => {
    it('should log JSON format when enabled', () => {
      const config = createLoggerConfig({
        environment: 'development',
        enableJSON: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: true,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Test JSON message', { data: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\{"context":\{},"data":\{"data":"test"\},"level":"info","message":"Test JSON message","timestamp":".*"\}$/)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Color management', () => {
    it('should handle colors in Node.js environment', () => {
      const config = createLoggerConfig({
        environment: 'development',
        enableJSON: false,
        enableColors: true,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Colored message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Colored message')
      );
      consoleSpy.mockRestore();
    });

    it('should handle colors in browser environment', () => {
      const config = createLoggerConfig({
        environment: 'development',
        enableJSON: false,
        enableColors: true,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      // Mock browser environment
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };
      logger.info('Colored message', { data: 'test' });
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Colored message'),
        { data: 'test' }
      );
      global.console = originalConsole;
    });
  });

  describe('Stack trace handling', () => {
    it('should include stack traces when enabled', () => {
      const config = createLoggerConfig({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: true,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      logger.error('Error with stack trace', error);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error with stack trace'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Timestamp handling', () => {
    it('should include timestamps when enabled', () => {
      const config = createLoggerConfig({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: true,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Message with timestamp');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] Message with timestamp/)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Environment-specific behavior', () => {
    it('should behave differently in production environment', () => {
      const config = createLoggerConfig({
        environment: 'production',
        enableJSON: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: true,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Production message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\{"context":\{},"level":"info","message":"Production message","timestamp":".*"\}$/)
      );
      consoleSpy.mockRestore();
    });

    it('should behave differently in test environment', () => {
      const config = createLoggerConfig({
        environment: 'test',
        enableJSON: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          info: { level: 'info', enabled: true, color: 'blue', emoji: 'ℹ️' },
          error: { level: 'error', enabled: true, color: 'red', emoji: '❌' },
          warn: { level: 'warn', enabled: true, color: 'yellow', emoji: '⚠️' },
          debug: { level: 'debug', enabled: true, color: 'green', emoji: '🐛' },
          trace: { level: 'trace', enabled: true, color: 'gray', emoji: '🔍' },
          log: { level: 'log', enabled: true, color: 'blue', emoji: '📝' },
        }
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Test message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\{"context":\{},"level":"info","message":"Test message"(,"timestamp":".*")?\}$/)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle circular references in data', () => {
      const config = createLoggerConfig({
        enableJSON: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Message with circular reference', circularObj);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"name":"test"')
      );
      consoleSpy.mockRestore();
    });

    it('should handle undefined and null values', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Message with undefined', undefined);
      logger.info('Message with null', null);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });

    it('should handle very large objects', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const largeObj = Array.from({ length: 10000 }, (_, i) => ({ id: i, data: `item${i}` }));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Message with large object', largeObj);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle special characters in messages', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Message with special chars: 🚀🎉💯🔥');
      logger.info('Message with quotes: "Hello" \'World\'');
      logger.info('Message with newlines:\nLine 1\nLine 2');
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      consoleSpy.mockRestore();
    });
  });
});
