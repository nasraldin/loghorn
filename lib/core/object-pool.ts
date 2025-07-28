import type { LogEntry } from '../types';

export class LogEntryPool {
  private readonly pool: LogEntry[] = [];
  private readonly maxPoolSize = 1000;
  private createdCount = 0;
  private reusedCount = 0;

  acquire(): LogEntry {
    if (this.pool.length > 0) {
      this.reusedCount += 1;
      const entry = this.pool.pop();
      if (!entry) {
        throw new Error('No entry found in pool');
      }
      this.resetEntry(entry);
      return entry;
    }

    this.createdCount += 1;
    return this.createNewEntry();
  }

  release(entry: LogEntry): void {
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(entry);
    }
  }

  private createNewEntry(): LogEntry {
    return {
      timestamp: '',
      level: 'info',
      message: '',
      context: {},
    };
  }

  private resetEntry(entry: LogEntry): void {
    entry.timestamp = '';
    entry.level = 'info';
    entry.message = '';
    entry.data = undefined;
    if (entry.stack !== undefined) {
      (entry as any).stack = undefined;
    }
    if (entry.context) {
      entry.context = {};
    }
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      createdCount: this.createdCount,
      reusedCount: this.reusedCount,
      reuseRate: this.reusedCount / (this.createdCount + this.reusedCount),
    };
  }

  // Method to clear the pool (useful for testing or memory cleanup)
  clear(): void {
    this.pool.length = 0;
  }

  // Method to get current pool size
  getPoolSize(): number {
    return this.pool.length;
  }

  // Method to get total objects created
  getCreatedCount(): number {
    return this.createdCount;
  }

  // Method to get total objects reused
  getReusedCount(): number {
    return this.reusedCount;
  }
}
