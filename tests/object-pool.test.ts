import { LogEntryPool } from '../lib/core/object-pool';

describe('LogEntryPool', () => {
  let pool: LogEntryPool;

  beforeEach(() => {
    pool = new LogEntryPool();
  });

  describe('Object Pooling', () => {
    test('should create new entry when pool is empty', () => {
      const entry = pool.acquire();

      expect(entry).toBeDefined();
      expect(entry.timestamp).toBe('');
      expect(entry.level).toBe('info');
      expect(entry.message).toBe('');
      expect(entry.context).toEqual({});
    });

    test('should reuse entry from pool when available', () => {
      const entry1 = pool.acquire();
      entry1.timestamp = '2023-01-01T00:00:00.000Z';
      entry1.message = 'test message';
      entry1.data = { test: 'data' };
      entry1.context = { user: 'test' };

      pool.release(entry1);

      const entry2 = pool.acquire();

      expect(entry2).toBeDefined();
      expect(entry2.timestamp).toBe('');
      expect(entry2.message).toBe('');
      expect(entry2.data).toBeUndefined();
      expect(entry2.context).toEqual({});
    });

    test('should reset entry properties when reusing', () => {
      const entry1 = pool.acquire();
      entry1.timestamp = '2023-01-01T00:00:00.000Z';
      entry1.level = 'error';
      entry1.message = 'test message';
      entry1.data = { test: 'data' };
      entry1.stack = 'stack trace';
      entry1.context = { user: 'test', session: '123' };

      pool.release(entry1);

      const entry2 = pool.acquire();

      expect(entry2.timestamp).toBe('');
      expect(entry2.level).toBe('info');
      expect(entry2.message).toBe('');
      expect(entry2.data).toBeUndefined();
      expect(entry2.stack).toBeUndefined();
      expect(entry2.context).toEqual({});
    });

    test('should track creation and reuse statistics', () => {
      const entry1 = pool.acquire();
      const entry2 = pool.acquire();
      pool.acquire(); // entry3 - not used directly

      pool.release(entry1);
      pool.release(entry2);

      pool.acquire(); // entry4 - not used directly
      pool.acquire(); // entry5 - not used directly

      const stats = pool.getStats();

      expect(stats.createdCount).toBe(3);
      expect(stats.reusedCount).toBe(2);
      expect(stats.poolSize).toBe(0); // All entries are currently in use
      expect(stats.reuseRate).toBe(2 / 5); // 2 reused out of 5 total
    });

    test('should respect max pool size', () => {
      const maxPoolSize = 1000; // Default max pool size
      const entries: any[] = [];

      // Create more entries than max pool size
      for (let i = 0; i < maxPoolSize + 3; i++) {
        entries.push(pool.acquire());
      }

      // Release all entries
      entries.forEach((entry) => pool.release(entry));

      const stats = pool.getStats();
      expect(stats.poolSize).toBeLessThanOrEqual(maxPoolSize);
    });

    test('should clear pool correctly', () => {
      const entry = pool.acquire();
      pool.release(entry);

      expect(pool.getPoolSize()).toBeGreaterThan(0);

      pool.clear();

      expect(pool.getPoolSize()).toBe(0);
      expect(pool.getCreatedCount()).toBe(1);
      expect(pool.getReusedCount()).toBe(0); // No reuse happened yet
    });
  });

  describe('Performance', () => {
    test('should handle high volume of entries efficiently', () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const entry = pool.acquire();
        entry.timestamp = new Date().toISOString();
        entry.message = `Message ${i}`;
        pool.release(entry);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 1000 iterations)
      expect(duration).toBeLessThan(100);

      const stats = pool.getStats();
      expect(stats.createdCount).toBeLessThan(iterations); // Should reuse entries
      expect(stats.reuseRate).toBeGreaterThan(0.5); // Should reuse at least 50% of entries
    });

    test('should not leak memory under continuous use', () => {
      const iterations = 10000;
      const entries: any[] = [];

      // Simulate continuous logging
      for (let i = 0; i < iterations; i++) {
        const entry = pool.acquire();
        entry.timestamp = new Date().toISOString();
        entry.message = `Message ${i}`;
        entry.data = { iteration: i };
        entries.push(entry);

        // Release every 10th entry to simulate real usage
        if (i % 10 === 0) {
          pool.release(entries.shift()!);
        }
      }

      const stats = pool.getStats();
      expect(stats.createdCount).toBeLessThan(iterations);
      expect(stats.poolSize).toBeLessThanOrEqual(1000); // Max pool size
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined context properties', () => {
      const entry = pool.acquire();
      entry.context = {
        user: 'test',
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
      };

      pool.release(entry);

      const reusedEntry = pool.acquire();
      expect(reusedEntry.context).toEqual({});
    });

    test('should handle circular references in context', () => {
      const entry = pool.acquire();
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      entry.context = { circular: circularObj };

      pool.release(entry);

      const reusedEntry = pool.acquire();
      expect(reusedEntry.context).toEqual({});
    });

    test('should handle very large context objects', () => {
      const entry = pool.acquire();
      const largeContext: any = {};

      // Create a large context object
      for (let i = 0; i < 1000; i++) {
        largeContext[`key${i}`] = `value${i}`;
      }

      entry.context = largeContext;

      pool.release(entry);

      const reusedEntry = pool.acquire();
      expect(reusedEntry.context).toEqual({});
    });
  });
});
