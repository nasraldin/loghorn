import { NextJSLogger } from '../lib/frameworks/nextjs';
import type { NextJSLoggerConfig } from '../lib/types';

describe('NextJSLogger Enhanced', () => {
  let logger: NextJSLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    logger = new NextJSLogger({
      environment: 'test',
      enableColors: false,
      enableEmojis: false,
      enableTimestamps: false,
      enableStackTraces: false,
      enableJSON: false,
      logLevels: {
        debug: { level: 'debug', color: 'gray', emoji: '🐛', enabled: true },
        info: { level: 'info', color: 'cyan', emoji: '💡', enabled: true },
        warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
        error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
        trace: { level: 'trace', color: 'purple', emoji: '🔍', enabled: true },
        log: { level: 'log', color: 'green', emoji: '📝', enabled: true },
      },
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('App Router Specific Methods', () => {
    test('should log server component messages', () => {
      logger.serverComponent('UserProfile', 'Component rendered', {
        userId: '123',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SERVER_COMPONENT] UserProfile: Component rendered',
        ),
      );
    });

    test('should log client component messages', () => {
      logger.clientComponent('UserForm', 'Component mounted', { formId: 'form-1' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CLIENT_COMPONENT] UserForm: Component mounted'),
      );
    });

    test('should log streaming messages', () => {
      logger.streaming('Stream started', { chunkSize: 1024 });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[STREAMING] Stream started'),
      );
    });

    test('should log suspense boundary messages', () => {
      logger.suspense('UserDataBoundary', 'Loading user data', { userId: '123' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SUSPENSE] UserDataBoundary: Loading user data'),
      );
    });

    test('should log parallel route messages', () => {
      logger.parallelRoute('@modal', 'Modal route loaded', { modalType: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PARALLEL_ROUTE] @modal: Modal route loaded'),
      );
    });

    test('should log intercepting route messages', () => {
      logger.interceptingRoute('/users/[id]', 'Route intercepted', {
        userId: '123',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[INTERCEPTING_ROUTE] /users/[id]: Route intercepted',
        ),
      );
    });
  });

  describe('App Router Lifecycle Methods', () => {
    test('should log layout messages', () => {
      logger.layout('RootLayout', 'Layout rendered', { pathname: '/dashboard' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LAYOUT] RootLayout: Layout rendered'),
      );
    });

    test('should log template messages', () => {
      logger.template('UserTemplate', 'Template rendered', { templateId: 'user' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TEMPLATE] UserTemplate: Template rendered'),
      );
    });

    test('should log loading messages', () => {
      logger.loading('UserLoading', 'Loading component rendered', {
        loadingType: 'skeleton',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[LOADING] UserLoading: Loading component rendered',
        ),
      );
    });

    test('should log error boundary messages', () => {
      logger.errorBoundary('UserErrorBoundary', 'Error caught', {
        errorType: 'fetch',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR_BOUNDARY] UserErrorBoundary: Error caught'),
      );
    });

    test('should log not found messages', () => {
      logger.notFound('UserNotFound', 'User not found', { userId: '999' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[NOT_FOUND] UserNotFound: User not found'),
      );
    });
  });

  describe('App Router Data Fetching', () => {
    test('should log data fetch messages', () => {
      logger.dataFetch('getUser', 'User data fetched', { userId: '123' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DATA_FETCH] getUser: User data fetched'),
      );
    });

    test('should log metadata messages', () => {
      logger.metadata('generateMetadata', 'Metadata generated', { page: '/users' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[METADATA] generateMetadata: Metadata generated'),
      );
    });
  });

  describe('App Router Request/Response', () => {
    test('should log cookies operations', () => {
      logger.cookies('set', 'Cookie set', { name: 'session', value: 'abc123' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[COOKIES] set: Cookie set'),
      );
    });

    test('should log headers operations', () => {
      logger.headers('set', 'Header set', { name: 'x-custom', value: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[HEADERS] set: Header set'),
      );
    });

    test('should log redirects', () => {
      logger.redirect('/old-path', '/new-path', { reason: 'migration' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[REDIRECT] /old-path → /new-path'),
      );
    });

    test('should log search params', () => {
      const params = { page: '1', limit: '10' };
      logger.searchParams(params, 'Search params processed', { query: 'users' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SEARCH_PARAMS] Search params processed'),
      );
    });

    test('should log segments', () => {
      logger.segment('users', 'Segment processed', { segmentType: 'dynamic' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SEGMENT] users: Segment processed'),
      );
    });
  });

  describe('Configuration Management', () => {
    test('should update App Router specific configuration', () => {
      const newConfig: Partial<NextJSLoggerConfig> = {
        enableServerComponents: false,
        enableClientComponents: false,
        enableStreaming: false,
        enableSuspense: false,
        enableParallelRoutes: false,
        enableInterceptingRoutes: false,
      };

      logger.updateNextJSConfig(newConfig);
      const config = logger.getNextJSConfig();

      expect(config.enableServerComponents).toBe(false);
      expect(config.enableClientComponents).toBe(false);
      expect(config.enableStreaming).toBe(false);
      expect(config.enableSuspense).toBe(false);
      expect(config.enableParallelRoutes).toBe(false);
      expect(config.enableInterceptingRoutes).toBe(false);
    });

    test('should respect disabled App Router logging', () => {
      logger.updateNextJSConfig({ enableServerComponents: false });

      logger.serverComponent('TestComponent', 'This should not log');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should respect disabled client component logging', () => {
      logger.updateNextJSConfig({ enableClientComponents: false });

      logger.clientComponent('TestComponent', 'This should not log');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Context Management', () => {
    test('should set appropriate context for server components', () => {
      logger.serverComponent('UserProfile', 'Component rendered');

      // Context is set internally, we just verify the method doesn't throw
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[SERVER_COMPONENT] UserProfile: Component rendered',
        ),
      );
    });

    test('should set appropriate context for client components', () => {
      logger.clientComponent('UserForm', 'Component mounted');

      // Context is set internally, we just verify the method doesn't throw
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CLIENT_COMPONENT] UserForm: Component mounted'),
      );
    });

    test('should set appropriate context for suspense boundaries', () => {
      logger.suspense('UserDataBoundary', 'Loading user data');

      // Context is set internally, we just verify the method doesn't throw
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SUSPENSE] UserDataBoundary: Loading user data'),
      );
    });

    test('should set appropriate context for parallel routes', () => {
      logger.parallelRoute('@modal', 'Modal route loaded');

      // Context is set internally, we just verify the method doesn't throw
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PARALLEL_ROUTE] @modal: Modal route loaded'),
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle Next.js errors properly', () => {
      const error = new Error('Database connection failed');
      logger.nextError(error, { userId: '123' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[NEXT_ERROR] Database connection failed'),
      );
    });

    test('should handle error boundaries properly', () => {
      logger.errorBoundary('UserErrorBoundary', 'Error caught', {
        errorType: 'fetch',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR_BOUNDARY] UserErrorBoundary: Error caught'),
      );
    });
  });

  describe('Performance Monitoring', () => {
    test('should log performance metrics', () => {
      logger.performance('Database Query', 150, { query: 'SELECT * FROM users' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PERFORMANCE] Database Query took 150ms'),
      );
    });
  });

  describe('Legacy Methods Compatibility', () => {
    test('should support legacy SSR logging', () => {
      logger.ssr('Server-side rendering started', { page: '/dashboard' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SSR] Server-side rendering started'),
      );
    });

    test('should support legacy API logging', () => {
      logger.api('API request received', { method: 'GET', path: '/api/users' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[API] API request received'),
      );
    });

    test('should support legacy page logging', () => {
      logger.page('Page component mounted', { pageName: 'Dashboard' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PAGE] Page component mounted'),
      );
    });
  });
});
