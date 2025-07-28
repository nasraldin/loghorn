import type { LogLevel } from '../types';

export interface RateLimitConfig {
  maxLogsPerSecond: number;
  maxLogsPerMinute: number;
  burstLimit: number;
  windowSize: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private readonly counters = new Map<
    string,
    { count: number; resetTime: number }
  >();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxLogsPerSecond: 1000,
      maxLogsPerMinute: 10000,
      burstLimit: 100,
      windowSize: 1000,
      ...config,
    };
  }

  checkRateLimit(level: LogLevel, key?: string): boolean {
    const now = Date.now();
    const baseKey = key || 'default';

    // Check per-second limit
    const secondKey = `${baseKey}-${level}-${Math.floor(now / 1000)}`;
    if (!this.checkLimit(secondKey, this.config.maxLogsPerSecond, now)) {
      return false;
    }

    // Check per-minute limit
    const minuteKey = `${baseKey}-${level}-${Math.floor(now / 60000)}`;
    if (!this.checkLimit(minuteKey, this.config.maxLogsPerMinute, now)) {
      return false;
    }

    // Check burst limit
    const burstKey = `${baseKey}-${level}-burst`;
    if (
      !this.checkLimit(
        burstKey,
        this.config.burstLimit,
        now,
        this.config.windowSize,
      )
    ) {
      return false;
    }

    return true;
  }

  private checkLimit(
    key: string,
    limit: number,
    now: number,
    windowSize = 1000,
  ): boolean {
    const current = this.counters.get(key) || {
      count: 0,
      resetTime: now + windowSize,
    };

    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + windowSize;
    }

    if (current.count >= limit) {
      return false;
    }

    current.count += 1;
    this.counters.set(key, current);
    return true;
  }

  getStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {};
    for (const [key, value] of this.counters.entries()) {
      stats[key] = {
        count: value.count,
        resetTime: new Date(value.resetTime).toISOString(),
      };
    }
    return stats;
  }

  // Method to clear all counters (useful for testing)
  clear(): void {
    this.counters.clear();
  }

  // Method to get current configuration
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  // Method to update configuration
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
