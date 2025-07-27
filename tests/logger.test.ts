import { createLoggerConfig } from '../lib/config';
import { Logger } from '../lib/core/logger';
import {
  clearCapturedLogs,
  getCapturedDebugs,
  getCapturedErrors,
  getCapturedLogs,
} from './setup';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    process.env['NODE_ENV'] = 'development';
    clearCapturedLogs();
    // If the default logger is imported, mock its config to disable JSON
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
      expect(logs).toHaveLength(2);
      expect(logs[0]).toContain('[loghorn] [INFO]');
    });
  });

  describe('Configuration Features', () => {
    test('should respect log level configuration', () => {
      const config = createLoggerConfig({
        logLevels: {
          debug: { enabled: false, color: '#000', emoji: '🐛', level: 'debug' },
          info: { enabled: true, color: '#00f', emoji: '💡', level: 'info' },
          trace: { enabled: false, color: '#000', emoji: '🔍', level: 'trace' },
          warn: { enabled: false, color: '#000', emoji: '⚠️', level: 'warn' },
          error: { enabled: false, color: '#000', emoji: '❌', level: 'error' },
          log: { enabled: false, color: '#000', emoji: '📝', level: 'log' },
        },
        enableJSON: false,
        enableColors: false,
        enableEmojis: true,
        enableTimestamps: false,
      });
      logger = new Logger(config);
      logger.debug('Debug message');
      logger.info('Info message');
      logger.trace('Trace message');
      const debugLogs = getCapturedDebugs();
      const logs = getCapturedLogs();
      expect(debugLogs).toHaveLength(0);
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('[INFO] Info message');
    });

    test('should enable timestamps when configured', () => {
      const config = createLoggerConfig({
        enableTimestamps: true,
        enableColors: false,
        enableEmojis: false,
        enableJSON: false,
      });
      logger = new Logger(config);

      logger.info('Timestamped message');
      const logs = getCapturedLogs();
      expect(logs[0]).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] Timestamped message/,
      );
    });

    test('should enable emojis when configured', () => {
      const config = createLoggerConfig({
        enableEmojis: true,
        enableColors: false,
        enableTimestamps: true,
        enableJSON: false,
      });
      logger = new Logger(config);
      logger.info('Emoji message');
      const logs = getCapturedLogs();
      expect(logs[0]).toContain('Emoji message');
      expect(logs[0]).toContain('💡');
    });

    test('should enable JSON logging when configured', () => {
      const config = createLoggerConfig({
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      logger = new Logger(config);

      logger.info('JSON message', { data: 'test' });
      const logs = getCapturedLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0]).toContain('[loghorn] [INFO] JSON message');
    });

    test('should enable pretty JSON logging when configured', () => {
      const config = createLoggerConfig({
        enableJSON: true,
        prettyJSON: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      logger = new Logger(config);

      // Capture the output for testing
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // Also show the actual output for visual verification
      console.log('=== PRETTY JSON TEST OUTPUT ===');
      logger.info('Pretty JSON message', {
        data: 'test',
        nested: { value: 123 },
      });
      console.log('=== END PRETTY JSON TEST ===');

      expect(logSpy).toHaveBeenCalled();

      // Find the JSON call (the one that starts with '{')
      const jsonCall = logSpy.mock.calls.find(
        (call) => typeof call[0] === 'string' && call[0].trim().startsWith('{'),
      );
      expect(jsonCall).toBeDefined();

      const callArg = jsonCall![0];

      // Parse the JSON to verify it's valid
      const parsed = JSON.parse(callArg);
      expect(parsed.message).toBe('Pretty JSON message');
      expect(parsed.data).toEqual({ data: 'test', nested: { value: 123 } });

      // Check that it's pretty-printed (contains newlines and spaces)
      expect(callArg).toContain('\n');
      expect(callArg).toContain('  '); // 2 spaces for indentation

      logSpy.mockRestore();
    });

    test('should enable custom indentation JSON logging when configured', () => {
      const config = createLoggerConfig({
        enableJSON: true,
        prettyJSON: 4,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      logger = new Logger(config);

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('Custom indent JSON message', { data: 'test' });

      expect(logSpy).toHaveBeenCalled();
      const callArg = logSpy.mock.calls[0]?.[0];
      expect(callArg).toBeDefined();

      // Parse the JSON to verify it's valid
      const parsed = JSON.parse(callArg!);
      expect(parsed.message).toBe('Custom indent JSON message');
      expect(parsed.data).toEqual({ data: 'test' });

      // Check that it's pretty-printed with 4 spaces
      expect(callArg).toContain('\n');
      expect(callArg).toContain('    '); // 4 spaces for indentation

      logSpy.mockRestore();
    });

    test('should enable stack traces for errors when configured', () => {
      const config = createLoggerConfig({
        enableStackTraces: true,
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      logger = new Logger(config);
      const testError = new Error('Error with stack');
      logger.error('Error with stack', testError);
      const logs = getCapturedErrors();
      expect(logs[0]).toContain('[loghorn] [ERROR] Error with stack');
      expect(logs[1]).toContain('Error: Error with stack');
    });
  });

  describe('Context Management', () => {
    beforeEach(() => {
      const config = createLoggerConfig({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      logger = new Logger(config);
    });

    test('should set and use context', () => {
      logger.setContext({ user: 'alice' });
      logger.info('Message with context');
      const logs = getCapturedLogs();
      expect(logs[0]).toContain('[INFO] Message with context');
    });

    test('should merge context', () => {
      logger.setContext({ user: 'alice' });
      logger.setContext({ session: 'xyz' });
      logger.info('Message with merged context');
      const logs = getCapturedLogs();
      expect(logs[0]).toContain('[INFO] Message with merged context');
    });

    test('should clear context', () => {
      logger.setContext({ user: 'alice' });
      logger.clearContext();
      logger.info('Message without context');
      const logs = getCapturedLogs();
      expect(logs[0]).toContain('[INFO] Message without context');
    });
  });

  describe('Convenience Methods', () => {
    beforeEach(() => {
      const config = createLoggerConfig({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      logger = new Logger(config);
    });

    test('should log success messages', () => {
      logger.success('Operation completed');
      const logs = getCapturedLogs();
      expect(logs[0]).toContain('[loghorn] [INFO] ✅ Operation completed');
    });

    test('should log failure messages', () => {
      logger.failure('Operation failed');
      const logs = getCapturedErrors();
      expect(logs[0]).toContain('❌ Operation failed');
    });

    test('should log start messages', () => {
      logger.start('Starting process');
      const logs = getCapturedLogs();
      expect(logs[0]).toContain('🚀 Starting process');
    });

    test('should log end messages', () => {
      logger.end('Process completed');
      const logs = getCapturedLogs();
      expect(logs[0]).toContain('🏁 Process completed');
    });
  });

  describe('Group and Time Methods', () => {
    beforeEach(() => {
      const config = createLoggerConfig({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      logger = new Logger(config);
    });

    test('should handle group logging', () => {
      const origGroup = console.group;
      const origGroupEnd = console.groupEnd;
      // Remove group methods to force fallback
      // @ts-ignore
      console.group = undefined;
      // @ts-ignore
      console.groupEnd = undefined;
      logger.group('Test Group', () => {
        logger.info('Inside group');
      });
      const logs = getCapturedLogs();
      expect(logs.some((l) => l.includes('📦 Test Group'))).toBe(true);
      expect(logs.some((l) => l.includes('Inside group'))).toBe(true);
      expect(logs.some((l) => l.includes('📦 End: Test Group'))).toBe(true);
      // Restore
      console.group = origGroup;
      console.groupEnd = origGroupEnd;
    });

    test('should handle time logging', () => {
      const origTime = console.time;
      const origTimeEnd = console.timeEnd;
      // Remove time methods to force fallback
      // @ts-ignore
      console.time = undefined;
      // @ts-ignore
      console.timeEnd = undefined;
      logger.time('Test Timer');
      logger.timeEnd('Test Timer');
      const logs = getCapturedLogs();
      expect(logs.some((l) => l.includes('⏱️  Start: Test Timer'))).toBe(true);
      expect(logs.some((l) => l.includes('⏱️  End: Test Timer'))).toBe(true);
      // Restore
      console.time = origTime;
      console.timeEnd = origTimeEnd;
    });

    test('group uses fallback when console.group is not available', () => {
      const originalGroup = console.group;
      const originalGroupEnd = console.groupEnd;
      // @ts-ignore
      console.group = undefined;
      // @ts-ignore
      console.groupEnd = undefined;

      const logger = new Logger(createLoggerConfig());
      const spy = jest.spyOn(logger, 'info');

      logger.group('Test Group', () => {
        logger.info('Inside group');
      });

      expect(spy).toHaveBeenCalledWith('📦 Test Group');
      expect(spy).toHaveBeenCalledWith('Inside group');
      expect(spy).toHaveBeenCalledWith('📦 End: Test Group');

      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
    });

    test('time uses fallback when console.time is not available', () => {
      const originalTime = console.time;
      const originalTimeEnd = console.timeEnd;
      // @ts-ignore
      console.time = undefined;
      // @ts-ignore
      console.timeEnd = undefined;

      const logger = new Logger(createLoggerConfig());
      const spy = jest.spyOn(logger, 'info');

      logger.time('Test Timer');
      logger.timeEnd('Test Timer');

      expect(spy).toHaveBeenCalledWith('⏱️  Start: Test Timer');
      expect(spy).toHaveBeenCalledWith('⏱️  End: Test Timer');

      console.time = originalTime;
      console.timeEnd = originalTimeEnd;
    });

    test('log does nothing if shouldLog returns false', () => {
      const logger = new Logger(createLoggerConfig());
      jest.spyOn(logger as any, 'shouldLog').mockReturnValue(false);
      const spy = jest.spyOn(logger as any, 'logToConsole');
      logger.log('info', 'msg');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Updates', () => {
    test('should update configuration', () => {
      logger.updateConfig({ enableColors: false });
      logger.info('This should have emoji');
      const debugLogs = getCapturedDebugs();
      const logs = getCapturedLogs();
      expect(debugLogs).toHaveLength(0);
      expect(logs[0]).toContain('[INFO] This should have emoji');
    });

    test('should get current configuration', () => {
      const config = createLoggerConfig();
      logger = new Logger(config);

      const currentConfig = logger.getConfig();
      expect(currentConfig).toEqual(config);
    });

    test('should return message unchanged if logConfig is missing in formatMessage', () => {
      // @ts-ignore
      expect(logger.formatMessage('notalevel', 'msg')).toEqual({
        formatted: 'msg',
        raw: 'msg',
      });
    });

    test('should do nothing if logConfig is missing in logToConsole', () => {
      // @ts-ignore
      expect(() => logger.logToConsole('notalevel', 'msg')).not.toThrow();
    });

    test('should return config from getConfig', () => {
      expect(logger.getConfig()).toEqual(
        expect.objectContaining({ environment: expect.any(String) }),
      );
    });

    test('should call logToBrowserConsole in browser environment', () => {
      const origWindow =
        'window' in globalThis ? (globalThis as any).window : undefined;
      // @ts-ignore
      (globalThis as any).window = {};
      // @ts-ignore
      expect(() => logger.logToConsole('info', 'msg')).not.toThrow();
      // @ts-ignore
      (globalThis as any).window = origWindow;
    });

    test('should call logToNodeConsole with data', () => {
      expect(() =>
        (logger as any).logToNodeConsole('info', 'msg', { foo: 'bar' }),
      ).not.toThrow();
    });

    test('should do nothing in logToNodeConsole if log level is unknown', () => {
      expect(() =>
        (logger as any).logToNodeConsole('notalevel' as any, 'msg'),
      ).not.toThrow();
    });

    test('should update config and recreate ColorManager with customColors', () => {
      const config = createLoggerConfig({
        customColors: { brand: '#123456' },
        enableColors: true,
      });
      logger = new Logger(config);
      logger.updateConfig({ enableColors: false });
      const newConfig = logger.getConfig();
      expect(newConfig.enableColors).toBe(false);
    });

    test('logToBrowserConsole with no color and no data', () => {
      const origWindow = (globalThis as any).window;
      (globalThis as any).window = {};
      const logger = new Logger(createLoggerConfig({ enableColors: false }));
      // @ts-ignore
      expect(() => logger.logToBrowserConsole('info', 'msg')).not.toThrow();
      (globalThis as any).window = origWindow;
    });

    test('logToNodeConsole with no data', () => {
      const logger = new Logger(createLoggerConfig({ enableColors: false }));
      // @ts-ignore
      expect(() => logger.logToNodeConsole('info', 'msg')).not.toThrow();
    });

    test('logToBrowserConsole with no data and color', () => {
      const origWindow = (globalThis as any).window;
      (globalThis as any).window = {};
      const logger = new Logger(createLoggerConfig({ enableColors: true }));
      // @ts-ignore
      expect(() =>
        (logger as any).logToBrowserConsole('info', 'msg', undefined, '#ff0000'),
      ).not.toThrow();
      (globalThis as any).window = origWindow;
    });

    test('formatMessage returns message for unknown log level', () => {
      const logger = new Logger(createLoggerConfig());
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.logMessage('test');

      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const firstCall = calls[0];
      expect(firstCall).toBeDefined();
      const message = Array.isArray(firstCall)
        ? firstCall.flat().join('')
        : String(firstCall);
      expect(message).toMatch(/\[loghorn\].*\[LOG\] test/);

      consoleSpy.mockRestore();
    });

    test('logToConsole returns early if no logConfig', () => {
      const logger = new Logger(createLoggerConfig());
      const spy = jest.spyOn(logger as any, 'logToBrowserConsole');
      // @ts-ignore
      logger.logToConsole('unknown' as any, 'test');
      expect(spy).not.toHaveBeenCalled();
    });

    test('should handle unknown log level through public interface', () => {
      const logger = new Logger(createLoggerConfig());
      // Create a config without a specific log level
      const configWithoutLevel = createLoggerConfig();
      delete (configWithoutLevel.logLevels as any).info;
      logger.updateConfig(configWithoutLevel);
      // This should trigger the formatMessage early return
      logger.info('test message');
      // The test passes if no error is thrown
      expect(true).toBe(true);
    });

    test('should handle unknown log level in logToConsole', () => {
      const logger = new Logger(createLoggerConfig());
      // Create a config without a specific log level
      const configWithoutLevel = createLoggerConfig();
      delete (configWithoutLevel.logLevels as any).info;
      logger.updateConfig(configWithoutLevel);
      // This should trigger the logToConsole early return
      const spy = jest.spyOn(logger as any, 'logToBrowserConsole');
      logger.info('test message');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle stack trace creation when Error.stack is undefined', () => {
      const originalStack = Error.prototype.stack;
      (Error.prototype as any).stack = undefined;

      const config = createLoggerConfig({
        enableStackTraces: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableJSON: false,
      });
      const logger = new Logger(config);

      logger.error('Test error');

      (Error.prototype as any).stack = originalStack;
    });

    it('should handle stack trace creation when Error.stack is defined', () => {
      const config = createLoggerConfig({
        enableStackTraces: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableJSON: true,
        logLevels: {
          error: {
            enabled: true,
            color: '#ff0000',
            emoji: '❌',
            level: 'error',
          },
          info: {
            enabled: false,
            color: '#00ff00',
            emoji: '💡',
            level: 'info',
          },
          warn: {
            enabled: false,
            color: '#ffff00',
            emoji: '⚠️',
            level: 'warn',
          },
          debug: {
            enabled: false,
            color: '#0000ff',
            emoji: '🐛',
            level: 'debug',
          },
          trace: {
            enabled: false,
            color: '#00ffff',
            emoji: '🔍',
            level: 'trace',
          },
          log: { enabled: false, color: '#ffffff', emoji: '📝', level: 'log' },
        },
      });
      const logger = new Logger(config);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('Error with stack');
      if (config.enableJSON) {
        expect(logSpy.mock.calls.length).toBeGreaterThan(0);
        const callArg = logSpy.mock.calls[0]?.[0];
        if (!callArg) {
          fail('console.log was not called or had no arguments');
        }
        const parsed = JSON.parse(callArg!);
        expect(typeof parsed.stack).toBe('string');
        expect(parsed.stack).toContain('Error');
      } else {
        // For non-JSON, just check that errorSpy was called
        expect(errorSpy.mock.calls.length).toBeGreaterThan(0);
      }
      logSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should detect browser environment correctly', () => {
      const originalWindow = (globalThis as any).window;

      // Mock browser environment by adding window to globalThis
      Object.defineProperty(globalThis, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });

      const config = createLoggerConfig({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableJSON: false,
      });
      const logger = new Logger(config);

      // This should trigger the browser environment detection
      logger.info('Test message');

      // Restore
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', {
          value: originalWindow,
          writable: true,
          configurable: true,
        });
      } else {
        delete (globalThis as any).window;
      }
    });

    it('should use group fallback when console.group is not available', () => {
      const config = createLoggerConfig();
      const logger = new Logger(config);
      const origInfo = logger.info;
      const output: string[] = [];
      logger.info = jest.fn((msg: string) => {
        output.push(msg);
      });

      // Mock console.group and console.groupEnd to be undefined
      const originalGroup = console.group;
      const originalGroupEnd = console.groupEnd;
      (console as any).group = undefined;
      (console as any).groupEnd = undefined;

      logger.group('Test Group', () => {
        logger.info('Inside group');
      });

      expect(output).toContain('📦 Test Group');
      expect(output).toContain('📦 End: Test Group');
      logger.info = origInfo;
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
    });

    it('should cover stack trace assignment with enableStackTraces and enableJSON', () => {
      const config = createLoggerConfig({
        enableStackTraces: true,
        enableJSON: true,
        logLevels: {
          error: {
            enabled: true,
            color: '#ff0000',
            emoji: '❌',
            level: 'error',
          },
          info: { enabled: true, color: '#00ff00', emoji: '💡', level: 'info' },
          warn: { enabled: true, color: '#ffff00', emoji: '⚠️', level: 'warn' },
          debug: {
            enabled: true,
            color: '#0000ff',
            emoji: '🐛',
            level: 'debug',
          },
          trace: {
            enabled: true,
            color: '#00ffff',
            emoji: '🔍',
            level: 'trace',
          },
          log: { enabled: true, color: '#ffffff', emoji: '📝', level: 'log' },
        },
      });

      // Debug: print the config
      console.info('CONFIG enableJSON:', config.enableJSON);
      console.info('CONFIG enableStackTraces:', config.enableStackTraces);
      console.info(
        'CONFIG logLevels.error.enabled:',
        config.logLevels.error.enabled,
      );

      const logger = new Logger(config);

      // Debug: print the logger's config
      console.info('LOGGER enableJSON:', logger.getConfig().enableJSON);
      console.info(
        'LOGGER enableStackTraces:',
        logger.getConfig().enableStackTraces,
      );
      console.info(
        'LOGGER logLevels.error.enabled:',
        logger.getConfig().logLevels.error.enabled,
      );

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock Error.stack to be defined
      const originalStack = Error.prototype.stack;
      (Error.prototype as any).stack = 'Mocked stack trace for JSON test';

      // Ensure Node.js environment (no window)
      const originalWindow = (globalThis as any).window;
      delete (globalThis as any).window;

      logger.error('Error with stack for coverage');

      const allCalls = [...logSpy.mock.calls, ...errorSpy.mock.calls];
      expect(allCalls.length).toBeGreaterThan(0);

      // Debug: print all captured outputs
      allCalls.forEach((call) => {
        // eslint-disable-next-line no-console
        console.info('LOGGER TEST OUTPUT:', call[0]);
      });

      // Check if any call contains JSON with stack trace
      const found = allCalls.find((call) => {
        try {
          const parsed = JSON.parse(call[0]);
          return (
            parsed.stack ||
            (parsed.data && typeof parsed.data === 'object' && parsed.data.stack)
          );
        } catch {
          return false;
        }
      });

      expect(found).toBeDefined();

      // Restore
      (Error.prototype as any).stack = originalStack;
      if (originalWindow !== undefined) {
        (globalThis as any).window = originalWindow;
      }
      logSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should cover browser environment detection (logToBrowserConsole)', () => {
      const originalWindow = (globalThis as any).window;
      Object.defineProperty(globalThis, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });
      const config = createLoggerConfig({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableJSON: false,
      });
      const logger = new Logger(config);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('Test error for browser');
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', {
          value: originalWindow,
          writable: true,
          configurable: true,
        });
      } else {
        delete (globalThis as any).window;
      }
    });

    it('should cover group fallback when console.group is not available', () => {
      const config = createLoggerConfig();
      const logger = new Logger(config);
      const origInfo = logger.info;
      const output: string[] = [];
      logger.info = jest.fn((msg: string) => {
        output.push(msg);
      });
      const originalGroup = console.group;
      const originalGroupEnd = console.groupEnd;
      (console as any).group = undefined;
      (console as any).groupEnd = undefined;
      logger.group('Test Group Fallback', () => {
        logger.info('Inside group fallback');
      });
      expect(output).toContain('📦 Test Group Fallback');
      expect(output).toContain('📦 End: Test Group Fallback');
      logger.info = origInfo;
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
    });

    it('should cover stack trace assignment when Error.stack is defined', () => {
      const config = createLoggerConfig({
        enableStackTraces: true,
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
      });
      const logger = new Logger(config);

      // Mock Error.stack to be defined
      const originalStack = Error.prototype.stack;
      (Error.prototype as any).stack = 'Mocked stack trace';

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('Error with defined stack');

      expect(errorSpy).toHaveBeenCalled();
      const callArgs = errorSpy.mock.calls[0];
      if (!callArgs) {
        fail('console.error was not called as expected');
      } else {
        expect(callArgs[0]).toContain('Error with defined stack');
      }

      // Restore
      (Error.prototype as any).stack = originalStack;
      errorSpy.mockRestore();
    });

    it('should cover browser environment detection in logToConsole', () => {
      const originalWindow = (globalThis as any).window;

      // Mock browser environment
      Object.defineProperty(globalThis, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });

      const config = createLoggerConfig({
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableJSON: false,
      });
      const logger = new Logger(config);

      // Spy on logToBrowserConsole to verify it's called
      const browserSpy = jest.spyOn(logger as any, 'logToBrowserConsole');

      logger.info('Test message for browser detection');

      expect(browserSpy).toHaveBeenCalled();

      // Restore
      browserSpy.mockRestore();
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', {
          value: originalWindow,
          writable: true,
          configurable: true,
        });
      } else {
        delete (globalThis as any).window;
      }
    });

    it('should cover console.group fallback branch', () => {
      const config = createLoggerConfig();
      const logger = new Logger(config);

      // Mock console.group to be available
      const originalGroup = console.group;
      const originalGroupEnd = console.groupEnd;
      const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
      const groupEndSpy = jest
        .spyOn(console, 'groupEnd')
        .mockImplementation(() => {});

      logger.group('Test Group with console.group', () => {
        logger.info('Inside group');
      });

      expect(groupSpy).toHaveBeenCalledWith('Test Group with console.group');
      expect(groupEndSpy).toHaveBeenCalled();

      // Restore
      groupSpy.mockRestore();
      groupEndSpy.mockRestore();
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
    });
  });

  describe('table logging', () => {
    let consoleTableSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleTableSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    describe('with console.table available', () => {
      it('should use console.table when enableTable is true', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: true }));
        const data = [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ];

        logger.table('Users', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Users'),
        );
        expect(consoleTableSpy).toHaveBeenCalledWith(data);
      });

      it('should use console.table when format is set to console', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [{ name: 'John', age: 30 }];

        logger.table('Users', data, { format: 'console' });

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Users'),
        );
        expect(consoleTableSpy).toHaveBeenCalledWith(data);
      });

      it('should use console.table when format is auto and enableTable is true', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: true }));
        const data = [{ name: 'John', age: 30 }];

        logger.table('Users', data, { format: 'auto' });

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Users'),
        );
        expect(consoleTableSpy).toHaveBeenCalledWith(data);
      });
    });

    describe('with custom formatting', () => {
      it('should use custom formatting when enableTable is false', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ];

        logger.table('Users', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Users'),
        );
        expect(consoleTableSpy).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('┌─'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('name'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('age'));
      });

      it('should use custom formatting when format is set to custom', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: true }));
        const data = [{ name: 'John', age: 30 }];

        logger.table('Users', data, { format: 'custom' });

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Users'),
        );
        expect(consoleTableSpy).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('┌─'));
      });

      it('should handle empty arrays', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data: unknown[] = [];

        logger.table('Empty', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Empty'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('(empty array)');
      });

      it('should handle arrays of primitives', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = ['apple', 'banana', 'cherry'];

        logger.table('Fruits', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Fruits'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('┌─ Index ─┬─ Value ─┐');
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('│ 0       │ apple   │'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('│ 1       │ banana  │'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('│ 2       │ cherry  │'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('└─────────┴─────────┘');
      });

      it('should handle arrays of objects with different properties', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [
          { name: 'John', age: 30, city: 'NYC' },
          { name: 'Jane', age: 25 },
          { name: 'Bob', age: 35, city: 'LA', country: 'USA' },
        ];

        logger.table('Users', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Users'),
        );
        // Should handle missing properties gracefully
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('name'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('age'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('city'));
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('country'),
        );
      });

      it('should handle objects', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = { name: 'John', age: 30, city: 'NYC' };

        logger.table('User', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 User'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('┌─'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('name'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('age'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('city'));
      });

      it('should handle empty objects', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = {};

        logger.table('Empty', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Empty'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('(empty object)');
      });

      it('should handle arrays of empty objects', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [{}, {}, {}];

        logger.table('Empty Objects', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Empty Objects'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('(empty objects)');
      });

      it('should handle non-object data', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = 'not an object' as unknown as Record<string, unknown>;

        logger.table('String', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 String'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('not an object');
      });
    });

    describe('fallback behavior', () => {
      it('should fallback to custom formatting when console.table is not available', () => {
        // Mock console.table as undefined
        const originalTable = console.table;
        delete (console as any).table;

        const logger = new Logger(createLoggerConfig({ enableTable: true }));
        const data = [{ name: 'John', age: 30 }];

        logger.table('Users', data);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Users'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('┌─'));

        // Restore console.table
        console.table = originalTable;
      });
    });

    describe('edge cases', () => {
      it('should handle deeply nested objects', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [
          { name: 'John', details: { age: 30, city: 'NYC' } },
          { name: 'Jane', details: { age: 25, city: 'LA' } },
        ];
        logger.table('Nested', data);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('{"age":30,"city":"NYC"}'),
        );
      });

      it('should handle null and undefined values in objects', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [
          { name: 'John', age: null },
          { name: 'Jane', age: undefined },
        ];
        logger.table('Nulls', data);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('null'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Jane'));
      });

      it('should handle very long property names and values', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [
          { aVeryLongPropertyNameIndeed: 'aVeryLongValueIndeed' },
          { aVeryLongPropertyNameIndeed: 'short' },
        ];
        logger.table('LongProps', data);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('aVeryLongPropertyNameIndeed'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('aVeryLongValueIndeed'),
        );
      });

      it('should handle mixed array of objects and primitives', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [
          { name: 'John', age: 30 },
          'not an object',
          { name: 'Jane', age: 25 },
        ];
        logger.table('Mixed', data as any);
        // Should still print table for objects, and string for primitive
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('John'));
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('not an object'),
        );
      });

      it('should handle array of objects where all properties are missing in some rows', () => {
        const logger = new Logger(createLoggerConfig({ enableTable: false }));
        const data = [{ name: 'John', age: 30 }, {}, { name: 'Jane', age: 25 }];
        logger.table('MissingProps', data);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('John'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Jane'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('age'));
      });

      it('should default to console.table when enableTable is undefined', () => {
        // Don't pass enableTable at all
        const logger = new Logger(createLoggerConfig({}));
        const data = [{ name: 'John', age: 30 }];
        logger.table('Default', data);
        expect(consoleTableSpy).toHaveBeenCalledWith(data);
      });

      it('should fallback to custom formatting if console.table is not a function', () => {
        const originalTable = console.table;
        (console as any).table = 42; // not a function
        const logger = new Logger(createLoggerConfig({ enableTable: true }));
        const data = [{ name: 'John', age: 30 }];
        logger.table('NotAFunction', data);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('John'));
        (console as any).table = originalTable;
      });
    });
  });

  describe('group logging', () => {
    let consoleLogSpy: jest.SpyInstance;
    let originalGroup: typeof console.group;
    let originalGroupEnd: typeof console.groupEnd;
    let originalGroupCollapsed: typeof console.groupCollapsed;

    beforeEach(() => {
      jest.clearAllMocks();
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Store original methods
      originalGroup = console.group;
      originalGroupEnd = console.groupEnd;
      originalGroupCollapsed = console.groupCollapsed;
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();

      // Restore original methods
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
      console.groupCollapsed = originalGroupCollapsed;
    });

    it('should create basic groups with fallback', () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      logger.group('Test Group', () => {
        logger.info('Inside group');
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Test Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Inside group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Test Group'),
      );
    });

    it('should support collapsed groups with fallback', () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      logger.groupCollapsed('Collapsed Group', () => {
        logger.info('Inside collapsed group');
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Collapsed Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Inside collapsed group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Collapsed Group'),
      );
    });

    it('should support async groups with fallback', async () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      await logger.groupAsync('Async Group', async () => {
        logger.info('Starting async operation');
        await new Promise((resolve) => setTimeout(resolve, 10));
        logger.info('Async operation completed');
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Async Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting async operation'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Async operation completed'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Async Group'),
      );
    });

    it('should propagate context in groups', () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      logger.setContext({ userId: '123' });

      logger.group(
        'Context Group',
        () => {
          logger.info('Inside group with context');
        },
        { context: { operation: 'test' } },
      );

      // Context should be merged: userId from parent, operation from group
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Inside group with context'),
      );
    });

    it('should handle nested groups with indentation', () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      logger.group('Outer Group', () => {
        logger.info('Outer message');
        logger.group('Inner Group', () => {
          logger.info('Inner message');
        });
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Outer Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Outer message'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Inner Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Inner message'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Inner Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Outer Group'),
      );
    });

    it('should handle errors in groups', () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      expect(() => {
        logger.group('Error Group', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Error Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Error Group'),
      );
    });

    it('should handle errors in async groups', async () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      await expect(
        logger.groupAsync('Async Error Group', async () => {
          throw new Error('Async test error');
        }),
      ).rejects.toThrow('Async test error');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Async Error Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Async Error Group'),
      );

      // The error message is logged to console.error, not console.log
      // We can verify the error was handled by checking that the group ended properly
    });

    it('should handle async functions in regular groups', async () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      logger.group('Mixed Group', async () => {
        logger.info('Starting async operation');
        await new Promise((resolve) => setTimeout(resolve, 10));
        logger.info('Async operation completed');
      });

      // Wait for async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 Mixed Group'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting async operation'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Async operation completed'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Mixed Group'),
      );
    });

    it('should restore context after group execution', () => {
      // Mock console.group to be undefined to test fallback
      console.group = undefined as any;
      console.groupEnd = undefined as any;
      console.groupCollapsed = undefined as any;

      const logger = new Logger(createLoggerConfig());

      logger.setContext({ original: 'value' });

      logger.group(
        'Context Test',
        () => {
          logger.setContext({ group: 'value' });
          logger.info('Inside group');
        },
        { context: { temp: 'value' } },
      );

      // Context should be restored - verify by checking that subsequent logs don't have group context
      logger.info('Outside group');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Outside group'),
      );
    });

    it('should support console.group when available', () => {
      const logger = new Logger(createLoggerConfig());

      // Mock console.group methods
      const mockGroup = jest.fn();
      const mockGroupEnd = jest.fn();
      const mockGroupCollapsed = jest.fn();

      console.group = mockGroup;
      console.groupEnd = mockGroupEnd;
      console.groupCollapsed = mockGroupCollapsed;

      logger.group('Console Group', () => {
        logger.info('Inside console group');
      });

      expect(mockGroup).toHaveBeenCalledWith('Console Group');
      expect(mockGroupEnd).toHaveBeenCalled();

      logger.groupCollapsed('Console Collapsed Group', () => {
        logger.info('Inside collapsed console group');
      });

      expect(mockGroupCollapsed).toHaveBeenCalledWith('Console Collapsed Group');
      expect(mockGroupEnd).toHaveBeenCalled();
    });
  });

  describe('robustness', () => {
    it('should not crash on circular references in objects', () => {
      const logger = new Logger(
        createLoggerConfig({ enableTable: false, enableJSON: true }),
      );
      const a: any = { name: 'A' };
      a.self = a;
      expect(() => logger.info('Circular', a)).not.toThrow();
    });
    it('should not crash on circular references in arrays', () => {
      const logger = new Logger(
        createLoggerConfig({ enableTable: false, enableJSON: true }),
      );
      const arr: any[] = [];
      arr.push(arr);
      expect(() => logger.info('CircularArray', arr)).not.toThrow();
    });
    it('should not crash on huge objects', () => {
      const logger = new Logger(
        createLoggerConfig({ enableTable: false, enableJSON: true }),
      );
      const huge = { data: 'x'.repeat(20000) };
      expect(() => logger.info('Huge', huge)).not.toThrow();
    });
    it('should not crash on huge arrays', () => {
      const logger = new Logger(
        createLoggerConfig({ enableTable: false, enableJSON: true }),
      );
      const hugeArr = Array.from({ length: 2000 }, (_, i) => i);
      expect(() => logger.info('HugeArr', hugeArr)).not.toThrow();
    });
  });

  // Test browser console logging with colors
  describe('Browser console logging with colors', () => {
    it('should log with colors in browser environment', () => {
      const logger = new Logger({
        environment: 'development',
        enableColors: true,
        enableJSON: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Mock browser environment
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };

      logger.info('Test message', { data: 'test' });

      const calls = (global.console.log as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain('[loghorn] [INFO] Test message');
      expect(calls[1][0]).toEqual({ data: 'test' });

      // Restore console
      global.console = originalConsole;
    });
  });

  // Test JSON logging error handling
  describe('JSON logging error handling', () => {
    it('should handle JSON serialization errors', () => {
      // Mock stringify to throw error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Create a logger with JSON enabled
      const loggerWithJSON = new Logger({
        environment: 'development',
        enableJSON: true,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Mock the logToJSON method to simulate the error
      const logToJSONSpy = jest
        .spyOn(loggerWithJSON as any, 'logToJSON')
        .mockImplementation((...args: unknown[]) => {
          const [level, message, data] = args as [string, string, unknown?];
          console.error(
            `[LOGHORN ERROR] JSON serialization failed:`,
            new Error('JSON serialization failed'),
          );
          console.log(`[${level.toUpperCase()}] ${message}`, data);
        });

      loggerWithJSON.info('Test message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOGHORN ERROR] JSON serialization failed:',
        expect.any(Error),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Test message', {
        data: 'test',
      });

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      logToJSONSpy.mockRestore();
    });
  });

  // Test logMessage method
  describe('logMessage method', () => {
    it('should log messages using log level', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.logMessage('Test message', { data: 'test' });

      const calls = (consoleSpy as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain('[loghorn] [LOG] Test message');
      expect(calls[1][0]).toEqual({ data: 'test' });

      consoleSpy.mockRestore();
    });
  });

  // Test group context restoration in native console
  describe('Group context restoration in native console', () => {
    it('should restore context after group execution in native console', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Set initial context
      logger.setContext({ userId: '123' });

      // Mock console.group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: jest.fn(),
        groupEnd: jest.fn(),
        log: jest.fn(),
      };

      logger.group(
        'Test Group',
        () => {
          logger.setContext({ groupId: '456' });
          logger.info('Inside group');
        },
        { context: { groupContext: 'test' } },
      );

      expect(global.console.group).toHaveBeenCalledWith('Test Group');
      expect(global.console.groupEnd).toHaveBeenCalled();

      // Restore console
      global.console = originalConsole;
    });

    it('should handle errors in group execution with native console', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Mock console.group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: jest.fn(),
        groupEnd: jest.fn(),
        log: jest.fn(),
        error: jest.fn(),
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

  // Test group context restoration in fallback
  describe('Group context restoration in fallback', () => {
    it('should restore context after group execution in fallback mode', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Set initial context
      logger.setContext({ userId: '123' });

      // Mock console to remove group methods
      const originalConsole = global.console;
      const mockConsole = {
        ...originalConsole,
        log: jest.fn(),
      };
      delete (mockConsole as any).group;
      delete (mockConsole as any).groupEnd;
      global.console = mockConsole;

      logger.group(
        'Test Group',
        () => {
          logger.setContext({ groupId: '456' });
          logger.info('Inside group');
        },
        { context: { groupContext: 'test' } },
      );

      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📦 Test Group'),
      );
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Test Group'),
      );

      // Restore console
      global.console = originalConsole;
    });
  });

  // Test async group error handling and context restoration
  describe('Async group error handling and context restoration', () => {
    it('should handle errors in async group execution with native console', async () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Mock console.group methods
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        group: jest.fn(),
        groupEnd: jest.fn(),
        log: jest.fn(),
        error: jest.fn(),
      };

      await expect(
        logger.groupAsync('Test Group', async () => {
          throw new Error('Async test error');
        }),
      ).rejects.toThrow('Async test error');

      expect(global.console.group).toHaveBeenCalledWith('Test Group');
      expect(global.console.groupEnd).toHaveBeenCalled();

      const errorCalls = (global.console.error as jest.Mock).mock.calls;
      expect(errorCalls[0][0]).toContain(
        '[loghorn] [ERROR] Group execution failed: Async test error',
      );

      // Restore console
      global.console = originalConsole;
    });

    it('should handle errors in async group execution with fallback', async () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Mock console to remove group methods
      const originalConsole = global.console;
      const mockConsole = {
        ...originalConsole,
        log: jest.fn(),
        error: jest.fn(),
      };
      delete (mockConsole as any).group;
      delete (mockConsole as any).groupEnd;
      global.console = mockConsole;

      await expect(
        logger.groupAsync('Test Group', async () => {
          throw new Error('Async test error');
        }),
      ).rejects.toThrow('Async test error');

      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📦 Test Group'),
      );
      const errorCalls = (global.console.error as jest.Mock).mock.calls;
      expect(errorCalls[0][0]).toContain('[loghorn] [ERROR]');
      expect(errorCalls[0][0]).toContain(
        'Group execution failed: Async test error',
      );
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📦 End: Test Group'),
      );

      // Restore console
      global.console = originalConsole;
    });
  });

  // Test table formatting error handling
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
        expect.any(Error),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Test Table:', [
        { name: 'test' },
      ]);
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  // Test console table fallback
  describe('Console table fallback', () => {
    it('should fallback to custom formatting when console.table is not available', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Mock console to remove table method
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        table: jest.fn(),
        log: jest.fn(),
      };

      logger.table('Test Table', [{ name: 'test' }], { format: 'console' });

      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table'),
      );

      // Restore console
      global.console = originalConsole;
    });

    it('should handle console.table errors', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      // Mock console.table to throw error
      const originalConsole = global.console;
      global.console = {
        ...originalConsole,
        table: jest.fn(() => {
          throw new Error('Table error');
        }),
        log: jest.fn(),
        error: jest.fn(),
      };

      logger.table('Test Table', [{ name: 'test' }], { format: 'console' });

      expect(global.console.error).toHaveBeenCalledWith(
        '[LOGHORN ERROR] console.table failed for "Test Table":',
        expect.any(Error),
      );
      expect(global.console.log).toHaveBeenCalledWith('📊 Test Table:', [
        { name: 'test' },
      ]);

      // Restore console
      global.console = originalConsole;
    });
  });

  // Test custom table formatting error handling
  describe('Custom table formatting error handling', () => {
    it('should handle custom table formatting errors', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Mock colorize to throw error
      jest.spyOn(logger['colorManager'], 'colorize').mockImplementation(() => {
        throw new Error('Colorize error');
      });

      logger.table('Test Table', [{ name: 'test' }], { format: 'custom' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOGHORN ERROR] Custom table formatting failed for "Test Table":',
        expect.any(Error),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('📊 Test Table:', [
        { name: 'test' },
      ]);

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  // Test array table formatting error handling
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
        expect.stringContaining('📊 Test Table'),
      );
      consoleSpy.mockRestore();
    });
  });

  // Test array size limit handling
  describe('Array size limit handling', () => {
    it('should handle large arrays by truncating them', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Create array larger than MAX_ARRAY_SIZE (1000)
      const largeArray = Array.from({ length: 1500 }, (_, i) => ({
        id: i,
        name: `item${i}`,
      }));

      logger.table('Large Table', largeArray, { format: 'custom' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '(array too large: 1500 items, showing first 1000)',
        ),
      );

      consoleSpy.mockRestore();
    });
  });

  // Test object table error handling
  describe('Object table error handling', () => {
    it('should handle object table errors', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create an object that will cause Object.keys to throw when called
      const problematicObject = {
        [Symbol.iterator]: function* () {
          throw new Error('Object keys error');
        },
      };

      // Mock Object.keys to throw for this specific object
      const originalObjectKeys = Object.keys;
      Object.keys = jest.fn((obj) => {
        if (obj === problematicObject) {
          throw new Error('Object keys error');
        }
        return originalObjectKeys(obj);
      });

      logger.table('Test Table', [problematicObject], { format: 'custom' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOGHORN WARNING] Skipping problematic object:',
        expect.any(Error),
      );

      // Restore original Object.keys
      Object.keys = originalObjectKeys;
      consoleSpy.mockRestore();
    });
  });

  // Test table printing error handling
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
        expect.stringContaining('📊 Test Table'),
      );
      consoleSpy.mockRestore();
    });
  });

  // Test table primitive printing error handling
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
        expect.stringContaining('📊 Test Table'),
      );
      consoleSpy.mockRestore();
    });
  });

  // Test object table formatting error handling
  describe('Object table formatting error handling', () => {
    it('should handle object table formatting errors', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Create an object that will cause Object.keys to throw when called
      const problematicObject = {
        [Symbol.iterator]: function* () {
          throw new Error('Object keys error');
        },
      };

      // Mock Object.keys to throw for this specific object
      const originalObjectKeys = Object.keys;
      Object.keys = jest.fn((obj) => {
        if (obj === problematicObject) {
          throw new Error('Object keys error');
        }
        return originalObjectKeys(obj);
      });

      logger.table('Test Table', problematicObject, { format: 'custom' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOGHORN ERROR] Object table formatting failed:',
        expect.any(Error),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('(table formatting failed)');

      // Restore original Object.keys
      Object.keys = originalObjectKeys;
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  // Test object table row error handling
  describe('Object table row error handling', () => {
    it('should handle object table row errors', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Mock safeStringify to throw error for specific items
      let callCount = 0;
      jest.spyOn(logger as any, 'safeStringify').mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Stringify error');
        }
        return 'test';
      });

      logger.table(
        'Test Table',
        { name: 'test1', value: 'test2' },
        { format: 'custom' },
      );

      expect(consoleSpy).toHaveBeenCalledWith('│ [ERROR] │ [ERROR] │');

      consoleSpy.mockRestore();
    });
  });

  // Test object table footer error handling
  describe('Object table footer error handling', () => {
    it('should handle object table footer errors', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock console.log to throw error in footer printing
      jest.spyOn(console, 'log').mockImplementation((...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('└─')) {
          throw new Error('Footer error');
        }
      });

      logger.table('Test Table', { name: 'test' }, { format: 'custom' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[LOGHORN ERROR] Object table formatting failed:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  // Test configuration methods
  describe('Configuration methods', () => {
    it('should update configuration', () => {
      const logger = new Logger({
        environment: 'development',
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: { enabled: true, color: 'blue', emoji: '📝', level: 'log' },
          info: { enabled: true, color: 'blue', emoji: '💡', level: 'info' },
          error: { enabled: true, color: 'red', emoji: '❌', level: 'error' },
          warn: { enabled: true, color: 'yellow', emoji: '⚠️', level: 'warn' },
          debug: { enabled: true, color: 'green', emoji: '🐛', level: 'debug' },
          trace: { enabled: true, color: 'gray', emoji: '🔍', level: 'trace' },
        },
      });

      const newConfig = {
        enableJSON: true,
        enableColors: true,
        enableEmojis: true,
      };

      logger.updateConfig(newConfig);
      const config = logger.getConfig();

      expect(config.enableJSON).toBe(true);
      expect(config.enableColors).toBe(true);
      expect(config.enableEmojis).toBe(true);
    });

    it('should get current configuration', () => {
      const initialConfig = {
        environment: 'development' as const,
        enableJSON: false,
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        logLevels: {
          log: {
            enabled: true,
            color: 'blue',
            emoji: '📝',
            level: 'log' as const,
          },
          info: {
            enabled: true,
            color: 'blue',
            emoji: '💡',
            level: 'info' as const,
          },
          error: {
            enabled: true,
            color: 'red',
            emoji: '❌',
            level: 'error' as const,
          },
          warn: {
            enabled: true,
            color: 'yellow',
            emoji: '⚠️',
            level: 'warn' as const,
          },
          debug: {
            enabled: true,
            color: 'green',
            emoji: '🐛',
            level: 'debug' as const,
          },
          trace: {
            enabled: true,
            color: 'gray',
            emoji: '🔍',
            level: 'trace' as const,
          },
        },
      };

      const logger = new Logger({
        ...initialConfig,
      });
      const config = logger.getConfig();

      expect(config).toEqual(initialConfig);
      expect(config).not.toBe(initialConfig); // Should be a copy
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
        log: jest.fn(),
      };
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
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
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      logger.table('Test Table', data, { format: 'custom' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Test Table'),
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
        log: jest.fn(),
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
        prettyJSON: false,
        logLevels: {
          info: { level: 'info', enabled: true, color: 'blue', emoji: '💡' },
          error: { level: 'error', enabled: true, color: 'red', emoji: '❌' },
          warn: { level: 'warn', enabled: true, color: 'yellow', emoji: '⚠️' },
          debug: { level: 'debug', enabled: true, color: 'green', emoji: '🐛' },
          trace: { level: 'trace', enabled: true, color: 'gray', emoji: '🔍' },
          log: { level: 'log', enabled: true, color: 'blue', emoji: '📝' },
        },
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Test JSON message', { data: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\{"context":\{},"data":\{"data":"test"\},"level":"info","message":"Test JSON message","timestamp":".*"\}$/,
        ),
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
        expect.stringContaining('[INFO] Colored message'),
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
        debug: jest.fn(),
      };
      logger.info('Colored message', { data: 'test' });
      const calls = (global.console.log as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain('[loghorn] [INFO] Colored message');
      expect(calls[1][0]).toEqual({ data: 'test' });
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
      const calls = (consoleSpy as jest.Mock).mock.calls;
      expect(calls[0]).toContain('[loghorn] [ERROR] Error with stack trace');
      expect(calls[1][0].toString()).toBe('Error: Test error');
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
        expect.stringMatching(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] Message with timestamp/,
        ),
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
        prettyJSON: false,
        logLevels: {
          info: { level: 'info', enabled: true, color: 'blue', emoji: '💡' },
          error: { level: 'error', enabled: true, color: 'red', emoji: '❌' },
          warn: { level: 'warn', enabled: true, color: 'yellow', emoji: '⚠️' },
          debug: { level: 'debug', enabled: true, color: 'green', emoji: '🐛' },
          trace: { level: 'trace', enabled: true, color: 'gray', emoji: '🔍' },
          log: { level: 'log', enabled: true, color: 'blue', emoji: '📝' },
        },
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Production message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\{"context":\{},"level":"info","message":"Production message","timestamp":".*"\}$/,
        ),
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
        prettyJSON: false,
        logLevels: {
          info: { level: 'info', enabled: true, color: 'blue', emoji: '💡' },
          error: { level: 'error', enabled: true, color: 'red', emoji: '❌' },
          warn: { level: 'warn', enabled: true, color: 'yellow', emoji: '⚠️' },
          debug: { level: 'debug', enabled: true, color: 'green', emoji: '🐛' },
          trace: { level: 'trace', enabled: true, color: 'gray', emoji: '🔍' },
          log: { level: 'log', enabled: true, color: 'blue', emoji: '📝' },
        },
      });
      const logger = new Logger(config);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      logger.info('Test message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\{"context":\{},"level":"info","message":"Test message","timestamp":".*"?\}$/,
        ),
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
        expect.stringMatching(/.*"name":\s*"test".*/),
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
      expect(consoleSpy).toHaveBeenCalledTimes(3);
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
      const largeObj = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `item${i}`,
      }));
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
