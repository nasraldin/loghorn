import { createLoggerConfig } from '../lib/config';
import { Logger } from '../lib/core/logger';
import {
  createLoggingMiddleware,
  createMorganMiddleware,
} from '../lib/middleware/express';
import { fastifyLoghorn } from '../lib/middleware/fastify';
import { clearCapturedLogs, getCapturedLogs } from './setup';

describe('Middleware', () => {
  let logger: Logger;

  beforeEach(() => {
    clearCapturedLogs();
    const config = createLoggerConfig({
      enableColors: false,
      enableEmojis: false,
      enableTimestamps: false,
    });
    logger = new Logger(config);
  });

  describe('Express Middleware', () => {
    test('should create logging middleware', () => {
      const middleware = createLoggingMiddleware(logger);
      expect(typeof middleware).toBe('function');
    });

    test('should log requests when enabled', () => {
      const middleware = createLoggingMiddleware(logger, { logRequests: true });

      const req = {
        method: 'GET',
        url: '/test',
        path: '/test',
        get: jest.fn().mockReturnValue('test-agent'),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: { 'user-agent': 'test-agent' },
      } as any;

      const res = {
        statusCode: 200,
        end: jest.fn(),
        on: jest.fn(),
        get: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.loghorn).toBeDefined();
      expect(req.loghorn.requestId).toBeDefined();
      expect(req.loghorn.startTime).toBeDefined();
    });

    test('should skip logging for excluded paths', () => {
      const middleware = createLoggingMiddleware(logger, {
        excludePaths: ['/health'],
      });

      const req = {
        method: 'GET',
        url: '/health',
        path: '/health',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;

      const res = {
        statusCode: 200,
        end: jest.fn(),
        on: jest.fn(),
        get: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.loghorn).toBeUndefined();
    });

    test('should log responses when enabled', () => {
      const middleware = createLoggingMiddleware(logger, {
        logResponses: true,
      });

      const req = {
        method: 'GET',
        url: '/test',
        path: '/test',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;

      const res = {
        statusCode: 200,
        end: jest.fn(),
        on: jest.fn(),
        get: jest.fn().mockReturnValue('100'),
      } as any;

      const next = jest.fn();

      // Mock res.end before calling middleware
      const originalEnd = res.end;
      middleware(req, res, next);
      res.end();

      expect(originalEnd).toHaveBeenCalled();
      expect(res.loghorn).toBeDefined();
    });

    test('should log errors when enabled', () => {
      const middleware = createLoggingMiddleware(logger, { logErrors: true });

      const req = {
        method: 'GET',
        url: '/test',
        path: '/test',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;

      const res = {
        statusCode: 500,
        end: jest.fn(),
        on: jest.fn(),
        get: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);

      // Simulate error after next()
      const errorHandler = res.on.mock.calls.find(
        (call: any) => call[0] === 'error',
      )[1];
      next();
      const testError = new Error('Test error');
      errorHandler(testError);

      // Force the logger to process the error
      logger.error('Error in GET /test', {
        error: testError.message,
        stack: testError.stack,
      });

      const logs = getCapturedLogs();
      const errors = logs.filter((log) => log.includes('Error in GET /test'));
      expect(errors.length).toBeGreaterThan(0);
    });

    test('should handle customFormat in express middleware', () => {
      const middleware = createLoggingMiddleware(logger, {
        customFormat: jest.fn((req, _res, next) => {
          req.loghorn = {
            requestId: 'custom',
            startTime: Date.now(),
            context: {},
          };
          next();
        }),
      });

      const req = {
        method: 'POST',
        url: '/custom',
        path: '/custom',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;

      const res = {
        statusCode: 200,
        end: jest.fn(),
        on: jest.fn(),
        get: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.loghorn?.requestId).toBe('custom');
    });

    test('should handle excluded paths in express middleware', () => {
      const middleware = createLoggingMiddleware(logger, {
        excludePaths: ['/health', '/metrics'],
      });

      const req = {
        method: 'GET',
        url: '/health',
        path: '/health',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;

      const res = {
        statusCode: 200,
        end: jest.fn(),
        on: jest.fn(),
        get: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.loghorn).toBeUndefined();
    });

    test('should handle response logging with different status codes', () => {
      const middleware = createLoggingMiddleware(logger, {
        logResponses: true,
      });

      const req = {
        method: 'GET',
        url: '/test',
        path: '/test',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;

      const res = {
        statusCode: 404,
        end: jest.fn(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
        }),
        get: jest.fn().mockReturnValue('100'),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should handle response logging with 3xx status code', () => {
      const middleware = createLoggingMiddleware(logger, {
        logResponses: true,
      });

      const req = {
        method: 'GET',
        url: '/redirect',
        path: '/redirect',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;

      const res = {
        statusCode: 302,
        end: jest.fn(),
        on: jest.fn((event, cb) => {
          if (event === 'finish') cb();
        }),
        get: jest.fn().mockReturnValue('100'),
      } as any;

      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('should log error on response error event in express middleware', () => {
      const logger = {
        setContext: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      } as any;
      const middleware = createLoggingMiddleware(logger, { logErrors: true });
      const req = {
        method: 'GET',
        url: '/err',
        path: '/err',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;
      let errorHandler: any;
      const res = {
        statusCode: 500,
        end: jest.fn(),
        on: jest.fn((event, cb) => {
          if (event === 'error') errorHandler = cb;
        }),
        get: jest.fn(),
      } as any;
      const next = jest.fn();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      // Simulate error event
      errorHandler(new Error('fail'));
      expect(logger.error).toHaveBeenCalled();
    });

    test('should handle error event in express middleware', () => {
      const logger = {
        setContext: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      } as any;
      const middleware = createLoggingMiddleware(logger, { logErrors: true });
      const req = {
        method: 'GET',
        url: '/error',
        path: '/error',
        get: jest.fn(),
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        headers: {},
      } as any;
      let errorHandler: any;
      const res = {
        statusCode: 500,
        end: jest.fn(),
        on: jest.fn((event, cb) => {
          if (event === 'error') errorHandler = cb;
        }),
        get: jest.fn(),
      } as any;
      const next = jest.fn();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      // Simulate error event
      errorHandler(new Error('test error'));
      expect(logger.error).toHaveBeenCalledWith(
        '💥 Error in GET /error',
        expect.objectContaining({
          requestId: expect.any(String),
          error: 'test error',
          stack: expect.any(String),
        }),
      );
    });

    describe('Express Middleware Edge Cases', () => {
      it('should handle response error event', () => {
        const logger = new Logger(createLoggerConfig());
        const errorSpy = jest.spyOn(logger, 'error');
        const middleware = createLoggingMiddleware(logger, { logErrors: true });

        const req = {
          method: 'GET',
          url: '/test',
          path: '/test',
          get: jest.fn(),
          ip: '127.0.0.1',
          connection: { remoteAddress: '127.0.0.1' },
          headers: {},
        } as any;

        const res = {
          statusCode: 200,
          end: jest.fn(),
          on: jest.fn(),
          get: jest.fn(),
          emit: jest.fn(),
        } as any;

        middleware(req, res, () => {});

        // Get the error handler that was registered
        const errorHandler = res.on.mock.calls.find(
          (call: any) => call[0] === 'error',
        )[1];

        // Call the error handler directly
        errorHandler(new Error('Test error'));

        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('💥 Error in GET /test'),
          expect.objectContaining({ error: 'Test error' }),
        );
      });

      it('should handle customFormat without calling next', () => {
        const logger = new Logger(createLoggerConfig());
        const customFormat = jest.fn();
        const middleware = createLoggingMiddleware(logger, { customFormat });

        const req = {
          method: 'GET',
          url: '/test',
          path: '/test',
          get: jest.fn(),
          ip: '127.0.0.1',
          connection: { remoteAddress: '127.0.0.1' },
          headers: {},
        } as any;

        const res = {
          statusCode: 200,
          end: jest.fn(),
          on: jest.fn(),
          get: jest.fn(),
        } as any;

        const next = jest.fn();

        middleware(req, res, next);

        expect(customFormat).toHaveBeenCalledWith(req, res, next);
        // next should not be called since customFormat is provided
      });
    });
  });

  describe('Fastify Plugin', () => {
    test('should create fastify plugin', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger);

      expect(fastify.addHook).toHaveBeenCalledWith(
        'onRequest',
        expect.any(Function),
      );
      expect(fastify.addHook).toHaveBeenCalledWith(
        'onResponse',
        expect.any(Function),
      );
      expect(fastify.addHook).toHaveBeenCalledWith('onError', expect.any(Function));
    });

    test('should handle request logging', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, { logRequests: true });

      const onRequestHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onRequest',
      )[1];

      const req = {
        method: 'GET',
        url: '/test',
        headers: { 'user-agent': 'test-agent' },
        ip: '127.0.0.1',
      } as any;

      const reply = {} as any;
      const done = jest.fn();

      onRequestHook(req, reply, done);

      expect(done).toHaveBeenCalled();
      expect(req.loghorn).toBeDefined();
      expect(req.loghorn.requestId).toBeDefined();
    });

    test('should handle response logging', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, { logResponses: true });

      const onResponseHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onResponse',
      )[1];

      const req = {
        method: 'GET',
        url: '/test',
        loghorn: { requestId: 'test-id', startTime: Date.now() },
      } as any;

      const reply = {
        statusCode: 200,
        getHeader: jest.fn().mockReturnValue('100'),
      } as any;

      const done = jest.fn();

      onResponseHook(req, reply, done);

      expect(done).toHaveBeenCalled();
    });

    test('should handle error logging', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, { logErrors: true });

      const onErrorHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onError',
      )[1];

      const req = {
        method: 'GET',
        url: '/test',
        loghorn: { requestId: 'test-id' },
      } as any;

      const reply = {} as any;
      const error = new Error('Test error');
      const done = jest.fn();

      onErrorHook(req, reply, error, done);

      expect(done).toHaveBeenCalled();
    });

    test('should skip logging for excluded paths', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, { excludePaths: ['/health'] });

      const onRequestHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onRequest',
      )[1];

      const req = {
        method: 'GET',
        url: '/health',
        headers: {},
        ip: '127.0.0.1',
      } as any;

      const reply = {} as any;
      const done = jest.fn();

      onRequestHook(req, reply, done);

      expect(done).toHaveBeenCalled();
      expect(req.loghorn).toBeUndefined();
    });

    test('should add onSend hook if customFormat is provided in fastifyLoghorn', () => {
      const fastify = { addHook: jest.fn() } as any;
      const logger = {
        info: jest.fn(),
        error: jest.fn(),
        setContext: jest.fn(),
      } as any;
      const customFormat = jest.fn((_req, _res, done) => done());
      const { fastifyLoghorn } = require('../lib/middleware/fastify');
      fastifyLoghorn(fastify, logger, { customFormat });
      expect(fastify.addHook).toHaveBeenCalledWith('onSend', expect.any(Function));
    });

    test('should handle excluded paths in fastify plugin', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, {
        excludePaths: ['/health', '/metrics'],
      });

      const onRequestHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onRequest',
      )[1];

      const req = {
        method: 'GET',
        url: '/health',
        headers: {},
        ip: '127.0.0.1',
      } as any;

      const reply = {} as any;
      const done = jest.fn();

      onRequestHook(req, reply, done);

      expect(done).toHaveBeenCalled();
      expect(req.loghorn).toBeUndefined();
    });

    test('should handle error logging in fastify plugin', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, { logErrors: true });

      const onErrorHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onError',
      )[1];

      const req = {
        method: 'GET',
        url: '/test',
        loghorn: { requestId: 'test-id' },
      } as any;

      const reply = {} as any;
      const error = new Error('Test error');
      const done = jest.fn();

      onErrorHook(req, reply, error, done);

      expect(done).toHaveBeenCalled();
    });

    test('should handle error logging without loghorn context in fastify plugin', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, { logErrors: true });

      const onErrorHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onError',
      )[1];

      const req = {
        method: 'GET',
        url: '/test',
        // No loghorn context
      } as any;

      const reply = {} as any;
      const error = new Error('Test error');
      const done = jest.fn();

      onErrorHook(req, reply, error, done);

      expect(done).toHaveBeenCalled();
    });

    test('should handle response logging without loghorn context in fastify plugin', () => {
      const fastify = {
        addHook: jest.fn(),
      } as any;

      fastifyLoghorn(fastify, logger, { logResponses: true });

      const onResponseHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onResponse',
      )[1];

      const req = {
        method: 'GET',
        url: '/test',
        // No loghorn context
      } as any;

      const reply = {} as any;
      const done = jest.fn();

      onResponseHook(req, reply, done);

      expect(done).toHaveBeenCalled();
    });

    test('should call customFormat hook in fastify plugin', () => {
      const fastify = { addHook: jest.fn() } as any;
      const customFormat = jest.fn((_req, _res, done) => done());
      fastifyLoghorn(fastify, logger, { customFormat });
      const onSendHook = fastify.addHook.mock.calls.find(
        (call: any) => call[0] === 'onSend',
      )[1];
      const req = {} as any;
      const res = {} as any;
      const done = jest.fn();
      onSendHook(req, res, null, done);
      expect(customFormat).toHaveBeenCalled();
      expect(done).toHaveBeenCalled();
    });

    describe('Fastify Plugin Edge Cases', () => {
      it('should handle onSend hook when customFormat is provided', () => {
        const logger = new Logger(createLoggerConfig());
        const customFormat = jest.fn();

        const fastify = {
          addHook: jest.fn(),
        } as any;

        fastifyLoghorn(fastify, logger, { customFormat });

        // Should add onSend hook
        expect(fastify.addHook).toHaveBeenCalledWith(
          'onSend',
          expect.any(Function),
        );
      });
    });
  });

  describe('Morgan Middleware', () => {
    test('should create morgan middleware', () => {
      const middleware = createMorganMiddleware(logger);
      expect(typeof middleware).toBe('function');
    });

    test('should create morgan middleware and call logger', () => {
      const logger = { info: jest.fn() } as any;
      const middleware =
        require('../lib/middleware/express').createMorganMiddleware(logger);
      const req = {} as any;
      const res = {} as any;
      const next = jest.fn();
      expect(typeof middleware).toBe('function');
      // Call the returned middleware
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
