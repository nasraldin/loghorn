import type { LogContext, LoggerConfig } from '../types';
import { Logger } from './logger';
import {
  PerformanceMonitor,
  type PerformanceConfig,
  type PerformanceMetric,
} from './performance-monitor';

export interface PerformanceLoggerConfig extends LoggerConfig {
  performance?: Partial<PerformanceConfig>;
  enablePerformanceLogging?: boolean;
  enableAutoMetrics?: boolean;
  performanceLogInterval?: number; // milliseconds
}

export class PerformanceLogger extends Logger {
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly enablePerformanceLogging: boolean;
  private readonly enableAutoMetrics: boolean;
  private performanceLogInterval?: NodeJS.Timeout;
  private readonly activeMetrics = new Map<string, string>(); // metricId -> operation name

  constructor(config: PerformanceLoggerConfig) {
    super(config);

    this.enablePerformanceLogging = config.enablePerformanceLogging ?? true;
    this.enableAutoMetrics = config.enableAutoMetrics ?? true;
    this.performanceMonitor = new PerformanceMonitor(config.performance);

    if (this.enablePerformanceLogging && config.performanceLogInterval !== 0) {
      this.startPerformanceLogging(config.performanceLogInterval ?? 30000);
    }
  }

  /**
   * Start tracking a performance operation
   */
  startPerformance(
    operation: string,
    category = 'general',
    metadata?: Record<string, unknown>,
  ): string {
    const metricId = this.performanceMonitor.startMetric(
      operation,
      category,
      metadata,
    );
    this.activeMetrics.set(metricId, operation);

    if (this.enableAutoMetrics) {
      this.debug(`🚀 Performance tracking started: ${operation}`, {
        category,
        metadata,
      });
    }

    return metricId;
  }

  /**
   * Complete a performance operation
   */
  completePerformance(metricId: string, error?: Error): PerformanceMetric | null {
    const operation = this.activeMetrics.get(metricId);
    const metric = this.performanceMonitor.completeMetric(metricId, error);

    if (metric && this.enableAutoMetrics) {
      const level = error ? 'error' : 'info';
      const message = error
        ? `❌ Performance operation failed: ${operation}`
        : `✅ Performance operation completed: ${operation}`;

      this.log(level, message, {
        duration:
          metric.duration !== undefined ? Math.round(metric.duration) : undefined,
        category: metric.category,
        metadata: metric.metadata,
        error: error?.message,
      });
    }

    this.activeMetrics.delete(metricId);
    return metric;
  }

  /**
   * Track a performance operation with automatic start/complete
   */
  async trackPerformance<T>(
    operation: string,
    fn: () => Promise<T>,
    category = 'general',
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    const metricId = this.startPerformance(operation, category, metadata);

    try {
      const result = await fn();
      this.completePerformance(metricId);
      return result;
    } catch (error) {
      this.completePerformance(metricId, error as Error);
      throw error;
    }
  }

  /**
   * Track a synchronous performance operation
   */
  trackPerformanceSync<T>(
    operation: string,
    fn: () => T,
    category = 'general',
    metadata?: Record<string, unknown>,
  ): T {
    const metricId = this.startPerformance(operation, category, metadata);

    try {
      const result = fn();
      this.completePerformance(metricId);
      return result;
    } catch (error) {
      this.completePerformance(metricId, error as Error);
      throw error;
    }
  }

  /**
   * Log performance statistics
   */
  logPerformanceStats(category?: string): void {
    const stats = this.performanceMonitor.getStats(category);
    const health = this.performanceMonitor.checkPerformanceHealth();

    this.info('📊 Performance Statistics', {
      category: category || 'all',
      stats: {
        totalOperations: stats.totalOperations,
        averageDuration: Math.round(stats.averageDuration),
        minDuration: Math.round(stats.minDuration),
        maxDuration: Math.round(stats.maxDuration),
        successRate: Math.round(stats.successRate * 100) / 100,
        errorRate: Math.round(stats.errorRate * 100) / 100,
        throughput: Math.round(stats.throughput * 100) / 100,
      },
      health: {
        healthy: health.healthy,
        warnings: health.warnings.length,
        critical: health.critical.length,
      },
      memory: stats.memoryUsage,
      cpu: stats.cpuUsage,
    });

    if (health.warnings.length > 0) {
      this.warn('⚠️ Performance Warnings', { warnings: health.warnings });
    }

    if (health.critical.length > 0) {
      this.error('🚨 Performance Critical Issues', { critical: health.critical });
    }
  }

  /**
   * Log detailed performance metrics
   */
  logDetailedMetrics(count = 10): void {
    const recentMetrics = this.performanceMonitor.getRecentMetrics(count);
    const slowOperations = this.performanceMonitor.getSlowOperations();
    const failedOperations = this.performanceMonitor.getFailedOperations();

    this.info('📈 Detailed Performance Metrics', {
      recentMetrics: recentMetrics.map((m) => ({
        name: m.name,
        category: m.category,
        duration: m.duration !== undefined ? Math.round(m.duration) : undefined,
        status: m.status,
        error: m.error?.message,
      })),
      slowOperations: slowOperations.length,
      failedOperations: failedOperations.length,
    });
  }

  /**
   * Log performance health check
   */
  logPerformanceHealth(): void {
    const health = this.performanceMonitor.checkPerformanceHealth();
    const summary = this.performanceMonitor.getPerformanceSummary();

    const level = health.healthy ? 'info' : 'warn';
    const message = health.healthy
      ? '✅ Performance Health Check: Healthy'
      : '⚠️ Performance Health Check: Issues Detected';

    this.log(level, message, {
      healthy: health.healthy,
      warnings: health.warnings,
      critical: health.critical,
      summary: summary['summary'],
      alerts: summary['alerts'],
    });
  }

  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  getPerformanceStats(category?: string) {
    return this.performanceMonitor.getStats(category);
  }

  getSlowOperations(threshold?: number) {
    return this.performanceMonitor.getSlowOperations(threshold);
  }

  getFailedOperations() {
    return this.performanceMonitor.getFailedOperations();
  }

  checkPerformanceHealth() {
    return this.performanceMonitor.checkPerformanceHealth();
  }

  clearPerformanceMetrics(): void {
    this.performanceMonitor.clear();
    this.activeMetrics.clear();
    this.info('🧹 Performance metrics cleared');
  }

  updatePerformanceConfig(newConfig: Partial<PerformanceConfig>): void {
    this.performanceMonitor.updateConfig(newConfig);
    this.info('⚙️ Performance configuration updated', { config: newConfig });
  }

  getPerformanceConfig() {
    return this.performanceMonitor.getConfig();
  }

  private startPerformanceLogging(interval: number): void {
    this.performanceLogInterval = setInterval(() => {
      this.logPerformanceStats();
      this.logPerformanceHealth();
    }, interval);
  }

  stopPerformanceLogging(): void {
    if (this.performanceLogInterval) {
      clearInterval(this.performanceLogInterval);
      this.performanceLogInterval = undefined as any;
      this.info('⏹️ Performance logging stopped');
    }
  }

  destroy(): void {
    this.stopPerformanceLogging();
    this.performanceMonitor.destroy();
  }

  override group(
    label: string,
    fn: () => void | Promise<void>,
    options?: { collapsed?: boolean; context?: LogContext },
  ): void {
    const metricId = this.startPerformance(label, 'group', options?.context);

    try {
      super.group(label, fn, options);
      this.completePerformance(metricId);
    } catch (error) {
      this.completePerformance(metricId, error as Error);
      throw error;
    }
  }

  override async groupAsync<T>(
    label: string,
    fn: () => Promise<T>,
    options?: { collapsed?: boolean; context?: LogContext },
  ): Promise<T> {
    const metricId = this.startPerformance(label, 'group-async', options?.context);

    try {
      const result = await super.groupAsync(label, fn, options);
      this.completePerformance(metricId);
      return result;
    } catch (error) {
      this.completePerformance(metricId, error as Error);
      throw error;
    }
  }
}
