import {
  PerformanceMonitor,
  type PerformanceConfig,
} from '../lib/core/performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  const createdMonitors: PerformanceMonitor[] = [];

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      enableMemoryTracking: false, // Disable memory tracking for tests
      enableCpuTracking: false, // Disable CPU tracking for tests
      autoCleanupInterval: 0, // Disable auto-cleanup for tests
    });
    createdMonitors.length = 0;
    createdMonitors.push(monitor);
  });

  afterEach(() => {
    for (const m of createdMonitors) {
      m.destroy();
    }
  });

  describe('Basic Operations', () => {
    test('should start and complete a metric', () => {
      const metricId = monitor.startMetric('test-operation', 'test-category');
      expect(metricId).toBeDefined();
      expect(metricId).toContain('test-category_test-operation');

      const metric = monitor.completeMetric(metricId);
      expect(metric).toBeDefined();
      expect(metric?.name).toBe('test-operation');
      expect(metric?.category).toBe('test-category');
      expect(metric?.status).toBe('completed');
      expect(metric?.duration).toBeGreaterThan(0);
    });

    test('should handle failed operations', () => {
      const metricId = monitor.startMetric('failed-operation', 'test-category');
      const error = new Error('Test error');
      const metric = monitor.completeMetric(metricId, error);

      expect(metric?.status).toBe('failed');
      expect(metric?.error).toBe(error);
    });

    test('should generate unique metric IDs', () => {
      const id1 = monitor.startMetric('operation1', 'category1');
      const id2 = monitor.startMetric('operation2', 'category2');

      expect(id1).not.toBe(id2);
      expect(id1).toContain('category1_operation1');
      expect(id2).toContain('category2_operation2');
    });
  });

  describe('Statistics', () => {
    test('should return empty stats when no metrics exist', () => {
      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.errorRate).toBe(0);
    });

    test('should calculate correct statistics', async () => {
      // Complete some metrics
      const metric1 = monitor.startMetric('operation1', 'test');
      const metric2 = monitor.startMetric('operation2', 'test');
      const metric3 = monitor.startMetric('operation3', 'test');

      // Complete with success
      monitor.completeMetric(metric1);
      monitor.completeMetric(metric2);

      // Complete with error
      monitor.completeMetric(metric3, new Error('Test error'));

      const stats = monitor.getStats();
      expect(stats.totalOperations).toBe(3);
      expect(stats.successRate).toBeCloseTo(66.67, 1);
      expect(stats.errorRate).toBeCloseTo(33.33, 1);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });

    test('should filter stats by category', () => {
      const metric1 = monitor.startMetric('operation1', 'category1');
      const metric2 = monitor.startMetric('operation2', 'category2');

      monitor.completeMetric(metric1);
      monitor.completeMetric(metric2);

      const stats1 = monitor.getStats('category1');
      const stats2 = monitor.getStats('category2');

      expect(stats1.totalOperations).toBe(1);
      expect(stats2.totalOperations).toBe(1);
    });
  });

  describe('Performance Health', () => {
    test('should detect healthy performance', () => {
      const metricId = monitor.startMetric('fast-operation', 'test');
      monitor.completeMetric(metricId);

      const health = monitor.checkPerformanceHealth();
      expect(health.healthy).toBe(true);
      expect(health.warnings).toHaveLength(0);
      expect(health.critical).toHaveLength(0);
    });

    test('should detect slow operations', () => {
      const slowMonitor = new PerformanceMonitor({
        enableMemoryTracking: false,
        enableCpuTracking: false,
        autoCleanupInterval: 0, // Disable auto-cleanup for tests
        performanceThresholds: {
          slowOperationThreshold: 25, // Lower threshold for test
          errorRateThreshold: 5,
          memoryThreshold: 100,
        },
      });
      createdMonitors.push(slowMonitor);

      const metricId = slowMonitor.startMetric('slow-operation', 'test');

      // Simulate slow operation
      const startTime = Date.now();
      while (Date.now() - startTime < 50) {
        // Wait longer to ensure it's detected as slow
      }

      slowMonitor.completeMetric(metricId);

      const health = slowMonitor.checkPerformanceHealth();
      expect(health.warnings.length).toBeGreaterThan(0);
      expect(health.warnings[0]).toContain('slow operations detected');
    });

    test('should detect high error rate', () => {
      // Create multiple failed operations
      for (let i = 0; i < 10; i++) {
        const metricId = monitor.startMetric(`operation${i}`, 'test');
        monitor.completeMetric(metricId, new Error('Test error'));
      }

      const health = monitor.checkPerformanceHealth();
      expect(health.critical.length).toBeGreaterThan(0);
      expect(health.critical[0]).toContain('Error rate');
    });
  });

  describe('Metric Retrieval', () => {
    test('should get slow operations', () => {
      const metricId = monitor.startMetric('slow-operation', 'test');

      // Simulate slow operation
      const startTime = Date.now();
      while (Date.now() - startTime < 50) {
        // Wait longer to ensure it's detected as slow
      }

      monitor.completeMetric(metricId);

      const slowOperations = monitor.getSlowOperations(25); // 25ms threshold
      expect(slowOperations.length).toBeGreaterThan(0);
      expect(slowOperations[0]?.name).toBe('slow-operation');
    });

    test('should get failed operations', () => {
      const metricId = monitor.startMetric('failed-operation', 'test');
      monitor.completeMetric(metricId, new Error('Test error'));

      const failedOperations = monitor.getFailedOperations();
      expect(failedOperations.length).toBe(1);
      expect(failedOperations[0]?.name).toBe('failed-operation');
    });

    test('should get metrics by category', () => {
      const metric1 = monitor.startMetric('operation1', 'category1');
      const metric2 = monitor.startMetric('operation2', 'category2');

      monitor.completeMetric(metric1);
      monitor.completeMetric(metric2);

      const category1Metrics = monitor.getMetricsByCategory('category1');
      const category2Metrics = monitor.getMetricsByCategory('category2');

      expect(category1Metrics.length).toBe(1);
      expect(category2Metrics.length).toBe(1);
      expect(category1Metrics[0]?.category).toBe('category1');
      expect(category2Metrics[0]?.category).toBe('category2');
    });

    test('should get recent metrics', () => {
      // Create multiple metrics
      for (let i = 0; i < 15; i++) {
        const metricId = monitor.startMetric(`operation${i}`, 'test');
        monitor.completeMetric(metricId);
      }

      const recentMetrics = monitor.getRecentMetrics(10);
      expect(recentMetrics.length).toBe(10);
    });
  });

  describe('Configuration', () => {
    test('should use custom configuration', () => {
      const customConfig: Partial<PerformanceConfig> = {
        enableMemoryTracking: false,
        enableCpuTracking: false,
        maxMetricsHistory: 5,
        autoCleanupInterval: 0, // Disable auto-cleanup for tests
        performanceThresholds: {
          slowOperationThreshold: 500,
          errorRateThreshold: 10,
          memoryThreshold: 50,
        },
      };

      const customMonitor = new PerformanceMonitor(customConfig);
      createdMonitors.push(customMonitor);
      const config = customMonitor.getConfig();

      expect(config.enableMemoryTracking).toBe(false);
      expect(config.enableCpuTracking).toBe(false);
      expect(config.maxMetricsHistory).toBe(5);
      expect(config.performanceThresholds.slowOperationThreshold).toBe(500);
    });

    test('should update configuration', () => {
      const originalConfig = monitor.getConfig();
      expect(originalConfig.maxMetricsHistory).toBe(1000);

      monitor.updateConfig({ maxMetricsHistory: 500 });
      const updatedConfig = monitor.getConfig();
      expect(updatedConfig.maxMetricsHistory).toBe(500);
    });
  });

  describe('Memory Management', () => {
    test('should limit metrics history', () => {
      const limitedMonitor = new PerformanceMonitor({
        maxMetricsHistory: 3,
        autoCleanupInterval: 0, // Disable auto-cleanup for tests
      });
      createdMonitors.push(limitedMonitor);

      // Create more metrics than the limit
      for (let i = 0; i < 5; i++) {
        const metricId = limitedMonitor.startMetric(`operation${i}`, 'test');
        limitedMonitor.completeMetric(metricId);
      }

      const stats = limitedMonitor.getStats();
      expect(stats.totalOperations).toBe(3); // Should be limited to 3
    });

    test('should clear all metrics', () => {
      const metricId = monitor.startMetric('test-operation', 'test');
      monitor.completeMetric(metricId);

      expect(monitor.getStats().totalOperations).toBe(1);

      monitor.clear();
      expect(monitor.getStats().totalOperations).toBe(0);
    });
  });

  describe('Running Metrics', () => {
    test('should track running metrics', () => {
      const metricId = monitor.startMetric('running-operation', 'test');

      const runningMetrics = monitor.getRunningMetrics();
      expect(runningMetrics.length).toBe(1);
      expect(runningMetrics[0]?.name).toBe('running-operation');
      expect(runningMetrics[0]?.status).toBe('running');

      monitor.completeMetric(metricId);

      const updatedRunningMetrics = monitor.getRunningMetrics();
      expect(updatedRunningMetrics.length).toBe(0);
    });

    test('should get all metrics', () => {
      const metricId = monitor.startMetric('test-operation', 'test');

      let allMetrics = monitor.getAllMetrics();
      expect(allMetrics.length).toBe(1);
      expect(allMetrics[0]?.status).toBe('running');

      monitor.completeMetric(metricId);

      allMetrics = monitor.getAllMetrics();
      expect(allMetrics.length).toBe(1);
      expect(allMetrics[0]?.status).toBe('completed');
    });
  });

  describe('Performance Summary', () => {
    test('should generate performance summary', () => {
      const metricId = monitor.startMetric('test-operation', 'test');
      monitor.completeMetric(metricId);

      const summary = monitor.getPerformanceSummary();
      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('health');
      expect(summary).toHaveProperty('alerts');
    });
  });

  describe('Edge Cases', () => {
    test('should handle completing non-existent metric', () => {
      const result = monitor.completeMetric('non-existent-id');
      expect(result).toBeNull();
    });

    test('should handle completing already completed metric', () => {
      const metricId = monitor.startMetric('test-operation', 'test');
      monitor.completeMetric(metricId);

      const result = monitor.completeMetric(metricId);
      expect(result).toBeNull();
    });

    test('should handle empty category filtering', () => {
      const metricId = monitor.startMetric('test-operation', 'test');
      monitor.completeMetric(metricId);

      const stats = monitor.getStats('non-existent-category');
      expect(stats.totalOperations).toBe(0);
    });
  });
});
