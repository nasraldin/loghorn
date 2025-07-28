import type { LoggerConfig, LogLevel } from '../types';
import { AsyncLogger } from './async-logger';
import { RateLimiter } from './rate-limiter';

export class OptimizedLogger extends AsyncLogger {
  private readonly rateLimiter: RateLimiter;
  private performanceMetrics = {
    totalLogs: 0,
    droppedLogs: 0,
    averageLogTime: 0,
    lastLogTime: 0,
    errors: 0,
  };

  constructor(config: LoggerConfig) {
    super(config);
    this.rateLimiter = new RateLimiter({
      maxLogsPerSecond: 1000,
      maxLogsPerMinute: 10000,
      burstLimit: 100,
    });
  }

  override log(level: LogLevel, message: string, data?: unknown): void {
    const startTime = performance.now();

    try {
      // Early level check
      if (!this.shouldLog(level)) {
        return;
      }

      // Rate limiting check
      if (!this.rateLimiter.checkRateLimit(level)) {
        this.performanceMetrics.droppedLogs += 1;
        return;
      }

      // Performance tracking
      this.performanceMetrics.totalLogs += 1;
      this.performanceMetrics.lastLogTime = startTime;

      // Use parent async logging
      super.log(level, message, data);

      // Update average log time
      const duration = performance.now() - startTime;
      this.updateAverageLogTime(duration);
    } catch (error) {
      // Robust error handling
      this.performanceMetrics.errors += 1;
      this.handleLogError(error, level, message, data);
    }
  }

  private updateAverageLogTime(duration: number): void {
    const { averageLogTime, totalLogs } = this.performanceMetrics;
    this.performanceMetrics.averageLogTime =
      (averageLogTime * (totalLogs - 1) + duration) / totalLogs;
  }

  private handleLogError(
    error: unknown,
    level: LogLevel,
    message: string,
    data?: unknown,
  ): void {
    // Fallback to basic console logging
    console.error('[LOGHORN ERROR] Logging failed:', error);
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  }

  // Override convenience methods to maintain interface consistency
  override debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  override info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  override warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  override error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  override trace(message: string, data?: unknown): void {
    this.log('trace', message, data);
  }

  override logMessage(message: string, data?: unknown): void {
    this.log('log', message, data);
  }

  // Convenience methods for common logging patterns
  override success(message: string, data?: unknown): void {
    this.info(`✅ ${message}`, data);
  }

  override failure(message: string, data?: unknown): void {
    this.error(`❌ ${message}`, data);
  }

  override start(message: string, data?: unknown): void {
    this.info(`🚀 ${message}`, data);
  }

  override end(message: string, data?: unknown): void {
    this.info(`🏁 ${message}`, data);
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      rateLimiterStats: this.rateLimiter.getStats(),
      batchStats: this.getBatchStats(),
    };
  }

  // Method to reset performance metrics (useful for testing)
  resetMetrics(): void {
    this.performanceMetrics = {
      totalLogs: 0,
      droppedLogs: 0,
      averageLogTime: 0,
      lastLogTime: 0,
      errors: 0,
    };
    this.rateLimiter.clear();
  }

  // Method to get rate limiter configuration
  getRateLimiterConfig() {
    return this.rateLimiter.getConfig();
  }

  // Method to update rate limiter configuration
  updateRateLimiterConfig(config: Partial<RateLimiter['getConfig']>): void {
    this.rateLimiter.updateConfig(config);
  }

  // Override destroy to ensure proper cleanup
  override async destroy(): Promise<void> {
    await super.destroy();
  }
}
