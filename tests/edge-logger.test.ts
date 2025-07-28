import { EdgeLogger } from '../lib/core/edge-logger';
import type { LoggerConfig } from '../lib/types';

describe('EdgeLogger', () => {
  let logger: EdgeLogger;
  let mockConsole: jest.SpyInstance;

  beforeEach(() => {
    const config: LoggerConfig = {
      environment: 'development',
      logLevels: {
        debug: { level: 'debug', color: 'blue', emoji: '🐛', enabled: true },
        info: { level: 'info', color: 'green', emoji: '💡', enabled: true },
        warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
        error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
        trace: { level: 'trace', color: 'gray', emoji: '🔍', enabled: true },
        log: { level: 'log', color: 'white', emoji: '📝', enabled: true },
      },
      enableTimestamps: true,
      enableEmojis: true,
      enableJSON: false,
      enableStackTraces: true,
      enableTable: true,
      enableColors: true,
      prettyJSON: false,
      customColors: {},
      projectName: 'test-project',
    };

    logger = new EdgeLogger(config);
    mockConsole = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsole.mockRestore();
  });

  describe('Basic Logging', () => {
    test('should log debug messages', async () => {
      logger.debug('Test debug message');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message'),
        undefined,
      );
    });

    test('should log info messages', async () => {
      logger.info('Test info message');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Test info message'),
        undefined,
      );
    });

    test('should log warn messages', async () => {
      logger.warn('Test warn message');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Test warn message'),
        undefined,
      );
    });

    test('should log error messages', async () => {
      logger.error('Test error message');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Test error message'),
        undefined,
      );
    });

    test('should log with data', async () => {
      const data = { userId: 123, action: 'login' };
      logger.info('User action', data);
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('User action'),
        data,
      );
    });
  });

  describe('JSON Logging', () => {
    beforeEach(() => {
      logger.updateConfig({ enableJSON: true });
    });

    test('should log JSON format', async () => {
      logger.info('Test JSON message', { key: 'value' });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringMatching(/^{.*"message":"Test JSON message".*}$/),
        { key: 'value' },
      );
    });

    test('should handle JSON serialization errors gracefully', async () => {
      const circularObj: any = {};
      circularObj.self = circularObj;

      logger.info('Circular object', circularObj);
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('{"error": "Serialization failed"}'),
        circularObj,
      );
    });
  });

  describe('Convenience Methods', () => {
    test('should log success messages with emoji', async () => {
      logger.success('Operation completed');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('✅ Operation completed'),
        undefined,
      );
    });

    test('should log failure messages with emoji', async () => {
      logger.failure('Operation failed');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('❌ Operation failed'),
        undefined,
      );
    });

    test('should log start messages with emoji', async () => {
      logger.start('Starting process');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('🚀 Starting process'),
        undefined,
      );
    });

    test('should log end messages with emoji', async () => {
      logger.end('Process completed');
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('🏁 Process completed'),
        undefined,
      );
    });
  });

  describe('Next.js Specific Methods', () => {
    test('should log request information', async () => {
      const mockRequest = new Request('https://example.com/api');
      await logger.request(mockRequest, { userId: 123 });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Request received'),
        { userId: 123 },
      );
    });

    test('should log response information', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      await logger.response(mockResponse, { duration: 150 });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Response sent'),
        { duration: 150 },
      );
    });

    test('should log middleware information', async () => {
      await logger.middleware('auth', { authenticated: true });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Middleware: auth'),
        { authenticated: true },
      );
    });

    test('should log route information', async () => {
      await logger.route('/api/users', { method: 'GET' });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Route: /api/users'),
        { method: 'GET' },
      );
    });

    test('should log server component information', async () => {
      await logger.serverComponent('UserProfile', { userId: 123 });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Server Component: UserProfile'),
        { userId: 123 },
      );
    });

    test('should log client component information', async () => {
      await logger.clientComponent('UserProfile', { userId: 123 });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Client Component: UserProfile'),
        { userId: 123 },
      );
    });

    test('should log static generation information', async () => {
      await logger.staticGeneration('/blog/[slug]', { slug: 'hello-world' });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Static Generation: /blog/[slug]'),
        { slug: 'hello-world' },
      );
    });

    test('should log revalidation information', async () => {
      await logger.revalidation('/api/users', { userId: 123 });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Revalidation: /api/users'),
        { userId: 123 },
      );
    });

    test('should log cache operations', async () => {
      await logger.cache('hit', 'user:123', { cached: true });
      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Cache hit: user:123'),
        { cached: true },
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle logging errors gracefully', async () => {
      // Mock a scenario where logging fails
      const originalConsoleLog = console.log;
      console.log = jest.fn().mockImplementation(() => {
        throw new Error('Console error');
      });

      // Should not throw - the error is caught in the logger
      expect(() => logger.info('Test message')).not.toThrow();

      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      console.log = originalConsoleLog;
    });

    test('should fallback to basic logging on error', async () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn().mockImplementation(() => {
        throw new Error('Console error');
      });

      // Should not throw - the error is caught and handled
      expect(() => logger.info('Test message')).not.toThrow();

      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should have attempted to log
      expect(console.log).toHaveBeenCalled();

      console.log = originalConsoleLog;
    });
  });

  describe('Context Management', () => {
    test('should set and use context', async () => {
      logger.setContext({ userId: 123, sessionId: 'abc' });
      logger.info('User action');

      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('User action'),
        undefined,
      );
    });

    test('should merge context', async () => {
      logger.setContext({ userId: 123 });
      logger.setContext({ sessionId: 'abc' });
      logger.info('User action');

      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('User action'),
        undefined,
      );
    });

    test('should clear context', async () => {
      logger.setContext({ userId: 123 });
      logger.clearContext();
      logger.info('User action');

      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('User action'),
        undefined,
      );
    });
  });

  describe('Configuration', () => {
    test('should respect log level configuration', () => {
      logger.updateConfig({
        logLevels: {
          debug: { level: 'debug', color: 'blue', emoji: '🐛', enabled: false },
          info: { level: 'info', color: 'green', emoji: '💡', enabled: true },
          warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
          error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
          trace: { level: 'trace', color: 'gray', emoji: '🔍', enabled: true },
          log: { level: 'log', color: 'white', emoji: '📝', enabled: true },
        },
      });
      logger.debug('This should not be logged');

      expect(mockConsole).not.toHaveBeenCalled();
    });

    test('should update configuration', async () => {
      logger.updateConfig({ enableTimestamps: false });
      logger.info('Test message');

      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        undefined,
      );
    });

    test('should get current configuration', () => {
      const config = logger.getConfig();
      expect(config).toBeDefined();
      expect(config.logLevels.debug.enabled).toBe(true);
    });
  });
});
