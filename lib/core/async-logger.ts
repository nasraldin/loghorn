import type { LogEntry, LoggerConfig, LogLevel } from '../types';
import { Logger } from './logger';
import { LogEntryPool } from './object-pool';

export interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  flushInterval: number;
}

export class AsyncLogger extends Logger {
  private readonly logQueue: LogEntry[] = [];
  private readonly batchConfig: BatchConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;
  private readonly entryPool: LogEntryPool;

  constructor(config: LoggerConfig, batchConfig?: Partial<BatchConfig>) {
    super(config);
    this.batchConfig = {
      maxBatchSize: 100,
      maxWaitTime: 1000,
      flushInterval: 500,
      ...batchConfig,
    };
    this.entryPool = new LogEntryPool();
    this.startFlushTimer();
  }

  override log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.entryPool.acquire();
    this.populateEntry(entry, level, message, data);

    this.logQueue.push(entry);

    if (this.logQueue.length >= this.batchConfig.maxBatchSize) {
      // Fire-and-forget flush to maintain void return type
      this.flush().catch(console.error);
    }
  }

  private populateEntry(
    entry: LogEntry,
    level: LogLevel,
    message: string,
    data?: unknown,
  ): void {
    entry.timestamp = new Date().toISOString();
    entry.level = level;
    entry.message = message;
    if (data !== undefined) {
      entry.data = data;
    }
    if (this.config.enableStackTraces && level === 'error') {
      entry.stack = this.createStackTrace();
    }
    // Copy context efficiently
    if (this.context && entry.context) {
      Object.assign(entry.context, this.context);
    }
  }

  private createStackTrace(): string {
    try {
      const stack = new Error().stack;
      if (stack) {
        const MAX_STACK_SIZE = 2000;
        return stack.length > MAX_STACK_SIZE
          ? stack.substring(0, MAX_STACK_SIZE) + '...'
          : stack;
      }
    } catch (error) {
      // Silently fail if stack trace generation fails
    }
    return '';
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flush().catch(console.error);
      }
    }, this.batchConfig.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.isFlushing || this.logQueue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const batch = this.logQueue.splice(0, this.batchConfig.maxBatchSize);

    try {
      await this.processBatch(batch);
    } finally {
      // Return entries to pool
      batch.forEach((entry) => this.entryPool.release(entry));
      this.isFlushing = false;
    }
  }

  private async processBatch(batch: LogEntry[]): Promise<void> {
    // Process batch efficiently
    const promises = batch.map((entry) => this.processEntry(entry));
    await Promise.allSettled(promises);
  }

  private async processEntry(entry: LogEntry): Promise<void> {
    try {
      if (this.config.enableJSON) {
        await this.logToJSONAsync(entry);
      } else {
        await this.logToConsoleAsync(entry);
      }
    } catch (error) {
      // Fallback to synchronous logging
      this.logToConsoleSync(entry);
    }
  }

  private async logToJSONAsync(entry: LogEntry): Promise<void> {
    // Async JSON processing
    const jsonString = await this.stringifyAsync(entry);
    console.log(jsonString);
  }

  private async logToConsoleAsync(entry: LogEntry): Promise<void> {
    // Async console logging
    const formatted = await this.formatMessageAsync(entry);
    console.log(formatted);
  }

  private logToConsoleSync(entry: LogEntry): void {
    // Synchronous fallback
    console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.data);
  }

  private async stringifyAsync(obj: unknown): Promise<string> {
    return new Promise((resolve) => {
      // Use setTimeout with 0 delay for Edge Runtime compatibility
      setTimeout(() => {
        try {
          resolve(JSON.stringify(obj, null, this.config.prettyJSON ? 2 : 0));
        } catch {
          resolve('{"error": "Serialization failed"}');
        }
      }, 0);
    });
  }

  private async formatMessageAsync(entry: LogEntry): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.formatMessage(entry.level, entry.message).formatted);
      }, 0);
    });
  }

  // Override convenience methods to maintain void return type
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

  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  // Method to get batch statistics
  getBatchStats() {
    return {
      queueSize: this.logQueue.length,
      isFlushing: this.isFlushing,
      batchConfig: this.batchConfig,
      poolStats: this.entryPool.getStats(),
    };
  }

  // Method to force flush (useful for testing or shutdown)
  async forceFlush(): Promise<void> {
    await this.flush();
  }
}
