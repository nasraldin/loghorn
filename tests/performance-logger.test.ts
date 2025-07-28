import { PerformanceLogger } from '../lib/core/performance-logger';

describe('PerformanceLogger', () => {
  let logger: PerformanceLogger;
  let consoleSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;
  const createdLoggers: PerformanceLogger[] = [];

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    logger = new PerformanceLogger({
      environment: 'test',
      enableColors: false,
      enableEmojis: false,
      enableTimestamps: false,
      enableStackTraces: false,
      enableJSON: false,
      enablePerformanceLogging: false, // Disable auto logging for tests
      enableAutoMetrics: true,
      performance: {
        enableMemoryTracking: false, // Disable memory tracking for tests
        enableCpuTracking: false, // Disable CPU tracking for tests
        autoCleanupInterval: 0, // Disable auto-cleanup for tests
      },
      logLevels: {
        debug: { level: 'debug', color: 'gray', emoji: '🐛', enabled: true },
        info: { level: 'info', color: 'cyan', emoji: '💡', enabled: true },
        warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
        error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
        trace: { level: 'trace', color: 'purple', emoji: '🔍', enabled: true },
        log: { level: 'log', color: 'green', emoji: '📝', enabled: true },
      },
    });
    createdLoggers.length = 0;
    createdLoggers.push(logger);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleDebugSpy.mockRestore();
    for (const l of createdLoggers) {
      l.destroy();
    }
  });

  describe('Basic Performance Tracking', () => {
    test('should start and complete performance tracking', () => {
      const metricId = logger.startPerformance('test-operation', 'test-category');
      expect(metricId).toBeDefined();

      const metric = logger.completePerformance(metricId);
      expect(metric).toBeDefined();
      expect(metric?.name).toBe('test-operation');
      expect(metric?.category).toBe('test-category');
      expect(metric?.status).toBe('completed');
    });

    test('should handle failed operations', () => {
      const metricId = logger.startPerformance('failed-operation', 'test-category');
      const error = new Error('Test error');
      const metric = logger.completePerformance(metricId, error);

      expect(metric?.status).toBe('failed');
      expect(metric?.error).toBe(error);
    });

    test('should log auto metrics when enabled', () => {
      const metricId = logger.startPerformance('test-operation', 'test-category');

      // Should log start message (debug level)
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚀 Performance tracking started: test-operation'),
      );

      logger.completePerformance(metricId);

      // Should log completion message (info level)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '✅ Performance operation completed: test-operation',
        ),
      );
    });

    test('should not log auto metrics when disabled', () => {
      const disabledLogger = new PerformanceLogger({
        environment: 'test',
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        enableJSON: false,
        enablePerformanceLogging: false,
        enableAutoMetrics: false,
        performance: {
          enableMemoryTracking: false,
          enableCpuTracking: false,
          autoCleanupInterval: 0, // Disable auto-cleanup for tests
        },
        logLevels: {
          debug: { level: 'debug', color: 'gray', emoji: '🐛', enabled: true },
          info: { level: 'info', color: 'cyan', emoji: '💡', enabled: true },
          warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
          error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
          trace: { level: 'trace', color: 'purple', emoji: '🔍', enabled: true },
          log: { level: 'log', color: 'green', emoji: '📝', enabled: true },
        },
      });
      createdLoggers.push(disabledLogger);

      const metricId = disabledLogger.startPerformance(
        'test-operation',
        'test-category',
      );
      disabledLogger.completePerformance(metricId);

      // Should not log auto metrics
      expect(consoleDebugSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Performance tracking started'),
      );
    });
  });

  describe('Performance Tracking Methods', () => {
    test('should track async performance operations', async () => {
      const result = await logger.trackPerformance(
        'async-operation',
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'success';
        },
        'test-category',
        { metadata: 'test' },
      );

      expect(result).toBe('success');

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(100);
    });

    test('should track sync performance operations', () => {
      const result = logger.trackPerformanceSync(
        'sync-operation',
        () => {
          return 'success';
        },
        'test-category',
        { metadata: 'test' },
      );

      expect(result).toBe('success');

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(100);
    });

    test('should handle errors in async operations', async () => {
      await expect(
        logger.trackPerformance(
          'failed-async-operation',
          async () => {
            throw new Error('Async operation failed');
          },
          'test-category',
        ),
      ).rejects.toThrow('Async operation failed');

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.errorRate).toBe(100);
    });

    test('should handle errors in sync operations', () => {
      expect(() =>
        logger.trackPerformanceSync(
          'failed-sync-operation',
          () => {
            throw new Error('Sync operation failed');
          },
          'test-category',
        ),
      ).toThrow('Sync operation failed');

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.errorRate).toBe(100);
    });
  });

  describe('Performance Statistics', () => {
    test('should log performance statistics', () => {
      // Create some metrics
      const metric1 = logger.startPerformance('operation1', 'test');
      const metric2 = logger.startPerformance('operation2', 'test');

      logger.completePerformance(metric1);
      logger.completePerformance(metric2);

      logger.logPerformanceStats();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Performance Statistics'),
      );
    });

    test('should log performance statistics by category', () => {
      const metric1 = logger.startPerformance('operation1', 'category1');
      const metric2 = logger.startPerformance('operation2', 'category2');

      logger.completePerformance(metric1);
      logger.completePerformance(metric2);

      logger.logPerformanceStats('category1');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Performance Statistics'),
      );
    });

    test('should log detailed metrics', () => {
      // Create some metrics
      for (let i = 0; i < 5; i++) {
        const metricId = logger.startPerformance(`operation${i}`, 'test');
        logger.completePerformance(metricId);
      }

      logger.logDetailedMetrics(3);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📈 Detailed Performance Metrics'),
      );
    });

    test('should log performance health', () => {
      const metricId = logger.startPerformance('test-operation', 'test');
      logger.completePerformance(metricId);

      logger.logPerformanceHealth();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance Health Check'),
      );
    });
  });

  describe('Performance Monitor Integration', () => {
    test('should get performance monitor instance', () => {
      const monitor = logger.getPerformanceMonitor();
      expect(monitor).toBeDefined();
      expect(typeof monitor.getStats).toBe('function');
    });

    test('should get performance statistics', () => {
      const metricId = logger.startPerformance('test-operation', 'test');
      logger.completePerformance(metricId);

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(100);
    });

    test('should get slow operations', () => {
      const metricId = logger.startPerformance('slow-operation', 'test');

      // Simulate slow operation
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Wait a bit
      }

      logger.completePerformance(metricId);

      const slowOperations = logger.getSlowOperations(5);
      expect(slowOperations.length).toBeGreaterThan(0);
    });

    test('should get failed operations', () => {
      const metricId = logger.startPerformance('failed-operation', 'test');
      logger.completePerformance(metricId, new Error('Test error'));

      const failedOperations = logger.getFailedOperations();
      expect(failedOperations.length).toBe(1);
    });

    test('should check performance health', () => {
      const metricId = logger.startPerformance('test-operation', 'test');
      logger.completePerformance(metricId);

      const health = logger.checkPerformanceHealth();
      expect(health.healthy).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    test('should clear performance metrics', () => {
      const metricId = logger.startPerformance('test-operation', 'test');
      logger.completePerformance(metricId);

      expect(logger.getPerformanceStats().totalOperations).toBe(1);

      logger.clearPerformanceMetrics();
      expect(logger.getPerformanceStats().totalOperations).toBe(0);
    });

    test('should update performance configuration', () => {
      const originalConfig = logger.getPerformanceConfig();
      expect(originalConfig.maxMetricsHistory).toBe(1000);

      logger.updatePerformanceConfig({ maxMetricsHistory: 500 });

      const updatedConfig = logger.getPerformanceConfig();
      expect(updatedConfig.maxMetricsHistory).toBe(500);
    });

    test('should get performance configuration', () => {
      const config = logger.getPerformanceConfig();
      expect(config).toBeDefined();
      expect(config.enableMemoryTracking).toBe(false); // Disabled in test setup
      expect(config.enableCpuTracking).toBe(false); // Disabled in test setup
    });
  });

  describe('Enhanced Group Methods', () => {
    test('should track performance in group operations', () => {
      logger.group('test-group', () => {
        // Group content
      });

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(100);
    });

    test('should track performance in async group operations', async () => {
      await logger.groupAsync('test-async-group', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(100);
    });

    test('should handle errors in group operations', () => {
      expect(() =>
        logger.group('error-group', () => {
          throw new Error('Group operation failed');
        }),
      ).toThrow('Group operation failed');

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.errorRate).toBe(100);
    });

    test('should handle errors in async group operations', async () => {
      await expect(
        logger.groupAsync('error-async-group', async () => {
          throw new Error('Async group operation failed');
        }),
      ).rejects.toThrow('Async group operation failed');

      const stats = logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.errorRate).toBe(100);
    });
  });

  describe('Performance Logging Control', () => {
    test('should start and stop performance logging', () => {
      const loggerWithLogging = new PerformanceLogger({
        environment: 'test',
        enableColors: false,
        enableEmojis: false,
        enableTimestamps: false,
        enableStackTraces: false,
        enableJSON: false,
        enablePerformanceLogging: true,
        performanceLogInterval: 100, // Short interval for testing
        performance: {
          enableMemoryTracking: false,
          enableCpuTracking: false,
          autoCleanupInterval: 0, // Disable auto-cleanup for tests
        },
        logLevels: {
          debug: { level: 'debug', color: 'gray', emoji: '🐛', enabled: true },
          info: { level: 'info', color: 'cyan', emoji: '💡', enabled: true },
          warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
          error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
          trace: { level: 'trace', color: 'purple', emoji: '🔍', enabled: true },
          log: { level: 'log', color: 'green', emoji: '📝', enabled: true },
        },
      });
      createdLoggers.push(loggerWithLogging);

      // Wait for automatic logging
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          loggerWithLogging.stopPerformanceLogging();
          resolve();
        }, 150);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle completing non-existent metric', () => {
      const result = logger.completePerformance('non-existent-id');
      expect(result).toBeNull();
    });

    test('should handle completing already completed metric', () => {
      const metricId = logger.startPerformance('test-operation', 'test');
      logger.completePerformance(metricId);

      const result = logger.completePerformance(metricId);
      expect(result).toBeNull();
    });

    test('should handle empty performance statistics', () => {
      logger.logPerformanceStats();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Performance Statistics'),
      );
    });
  });
});
