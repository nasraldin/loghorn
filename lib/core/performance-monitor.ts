// Performance monitoring types and interfaces

export interface PerformanceMetric {
  id: string;
  name: string;
  category: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
  status: 'running' | 'completed' | 'failed';
  error?: Error | undefined;
}

export interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
}

export interface PerformanceConfig {
  enableMemoryTracking: boolean;
  enableCpuTracking: boolean;
  enableThroughputTracking: boolean;
  enableErrorTracking: boolean;
  maxMetricsHistory: number;
  autoCleanupInterval: number;
  performanceThresholds: {
    slowOperationThreshold: number;
    errorRateThreshold: number;
    memoryThreshold: number;
  };
}

export class PerformanceMonitor {
  private readonly metrics = new Map<string, PerformanceMetric>();
  private completedMetrics: PerformanceMetric[] = [];
  private config: PerformanceConfig;
  private cleanupInterval?: NodeJS.Timeout;
  private startTime = Date.now();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMemoryTracking: config.enableMemoryTracking ?? true,
      enableCpuTracking: config.enableCpuTracking ?? true,
      enableThroughputTracking: config.enableThroughputTracking ?? true,
      enableErrorTracking: config.enableErrorTracking ?? true,
      maxMetricsHistory: config.maxMetricsHistory ?? 1000,
      autoCleanupInterval: config.autoCleanupInterval ?? 60000,
      performanceThresholds: {
        slowOperationThreshold:
          config.performanceThresholds?.slowOperationThreshold ?? 1000,
        errorRateThreshold: config.performanceThresholds?.errorRateThreshold ?? 5,
        memoryThreshold: config.performanceThresholds?.memoryThreshold ?? 100,
        ...config.performanceThresholds,
      },
    };
    this.startAutoCleanup();
  }

  startMetric(
    name: string,
    category = 'general',
    metadata?: Record<string, unknown>,
  ): string {
    const id = this.generateMetricId(name, category);
    const metric: PerformanceMetric = {
      id,
      name,
      category,
      startTime: performance.now(),
      metadata: metadata || {},
      status: 'running',
    };
    this.metrics.set(id, metric);
    return id;
  }

  completeMetric(id: string, error?: Error): PerformanceMetric | null {
    const metric = this.metrics.get(id);
    if (!metric) {
      return null;
    }
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.status = error ? 'failed' : 'completed';
    metric.error = error;
    this.metrics.delete(id);
    this.completedMetrics.push(metric);
    if (this.completedMetrics.length > this.config.maxMetricsHistory) {
      this.completedMetrics = this.completedMetrics.slice(
        -this.config.maxMetricsHistory,
      );
    }
    return metric;
  }

  getStats(category?: string): PerformanceStats {
    const metrics = category
      ? this.completedMetrics.filter((m) => m.category === category)
      : this.completedMetrics;
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        errorRate: 0,
        throughput: 0,
      };
    }
    const durations = metrics
      .map((m) => m.duration)
      .filter((d): d is number => d !== undefined);
    const successful = metrics.filter((m) => m.status === 'completed');
    const failed = metrics.filter((m) => m.status === 'failed');
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const successRate = (successful.length / metrics.length) * 100;
    const errorRate = (failed.length / metrics.length) * 100;
    const now = Date.now();
    const timeSpan = (now - this.startTime) / 1000;
    const throughput = timeSpan > 0 ? metrics.length / timeSpan : 0;
    const stats: PerformanceStats = {
      totalOperations: metrics.length,
      averageDuration,
      minDuration,
      maxDuration,
      successRate,
      errorRate,
      throughput,
    };

    // Memory and CPU tracking are disabled in Edge Runtime for compatibility
    // These features are only available in Node.js environments
    if (this.config.enableMemoryTracking && typeof process !== 'undefined') {
      // Memory tracking is not available in Edge Runtime
      // stats.memoryUsage will be undefined
    }
    if (this.config.enableCpuTracking && typeof process !== 'undefined') {
      // CPU tracking is not available in Edge Runtime
      // stats.cpuUsage will be undefined
    }

    return stats;
  }

  getSlowOperations(threshold?: number): PerformanceMetric[] {
    const t = threshold ?? this.config.performanceThresholds.slowOperationThreshold;
    return this.completedMetrics.filter(
      (m) => m.duration !== undefined && m.duration > t,
    );
  }

  getFailedOperations(): PerformanceMetric[] {
    return this.completedMetrics.filter((m) => m.status === 'failed');
  }

  getMetricsByCategory(category: string): PerformanceMetric[] {
    return this.completedMetrics.filter((m) => m.category === category);
  }

  getRecentMetrics(count = 10): PerformanceMetric[] {
    return this.completedMetrics.slice(-count);
  }

  checkPerformanceHealth(): {
    healthy: boolean;
    warnings: string[];
    critical: string[];
  } {
    const stats = this.getStats();
    const warnings: string[] = [];
    const critical: string[] = [];
    if (stats.errorRate > this.config.performanceThresholds.errorRateThreshold) {
      critical.push(
        `Error rate ${stats.errorRate.toFixed(2)}% exceeds threshold ${this.config.performanceThresholds.errorRateThreshold}%`,
      );
    }
    // Memory usage tracking is not available in Edge Runtime
    // Memory threshold checks are disabled for Edge compatibility
    const slowOperations = this.getSlowOperations();
    if (slowOperations.length > 0) {
      warnings.push(`${slowOperations.length} slow operations detected`);
    }
    const healthy = critical.length === 0;
    return { healthy, warnings, critical };
  }

  getPerformanceSummary(): Record<string, unknown> {
    const stats = this.getStats();
    const health = this.checkPerformanceHealth();
    const slowOperations = this.getSlowOperations();
    const failedOperations = this.getFailedOperations();
    return {
      summary: {
        totalOperations: stats.totalOperations,
        averageDuration: Math.round(stats.averageDuration),
        successRate: Math.round(stats.successRate * 100) / 100,
        throughput: Math.round(stats.throughput * 100) / 100,
      },
      health: {
        healthy: health.healthy,
        warnings: health.warnings.length,
        critical: health.critical.length,
      },
      alerts: {
        slowOperations: slowOperations.length,
        failedOperations: failedOperations.length,
      },
      memory: stats.memoryUsage,
      cpu: stats.cpuUsage,
    };
  }

  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
    this.startTime = Date.now();
  }

  getRunningMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  getAllMetrics(): PerformanceMetric[] {
    return [...this.getRunningMetrics(), ...this.completedMetrics];
  }

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined as any;
    }
    this.clear();
  }

  private generateMetricId(name: string, category: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${category}_${name}_${timestamp}_${random}`;
  }

  private startAutoCleanup(): void {
    if (this.config.autoCleanupInterval > 0) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, this.config.autoCleanupInterval);
    }
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.config.autoCleanupInterval * 2;
    this.completedMetrics = this.completedMetrics.filter(
      (metric) => metric.startTime > cutoff,
    );
  }
}
