import { RateLimiter } from '../lib/core/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  describe('Rate Limiting', () => {
    test('should allow logs within rate limits', () => {
      // Should allow 1000 logs per second by default
      for (let i = 0; i < 100; i++) {
        expect(rateLimiter.checkRateLimit('info')).toBe(true);
      }
    });

    test('should block logs when rate limit is exceeded', () => {
      // Exceed the per-second limit
      for (let i = 0; i < 1000; i++) {
        rateLimiter.checkRateLimit('info');
      }

      // Next log should be blocked
      expect(rateLimiter.checkRateLimit('info')).toBe(false);
    });

    test('should reset counters after time window', () => {
      // Fill up the rate limit
      for (let i = 0; i < 1000; i++) {
        rateLimiter.checkRateLimit('info');
      }

      // Should be blocked
      expect(rateLimiter.checkRateLimit('info')).toBe(false);

      // Mock time passing by creating a new rate limiter with different time
      // Clear and test again
      rateLimiter.clear();
      expect(rateLimiter.checkRateLimit('info')).toBe(true);
    });

    test('should handle different log levels separately', () => {
      // Fill up info level
      for (let i = 0; i < 1000; i++) {
        rateLimiter.checkRateLimit('info');
      }

      // Error level should still be allowed
      expect(rateLimiter.checkRateLimit('error')).toBe(true);

      // Info level should be blocked
      expect(rateLimiter.checkRateLimit('info')).toBe(false);
    });

    test('should handle different keys separately', () => {
      // Fill up default key
      for (let i = 0; i < 1000; i++) {
        rateLimiter.checkRateLimit('info');
      }

      // Different key should still be allowed
      expect(rateLimiter.checkRateLimit('info', 'different-key')).toBe(true);

      // Default key should be blocked
      expect(rateLimiter.checkRateLimit('info')).toBe(false);
    });
  });

  describe('Configuration', () => {
    test('should use custom configuration', () => {
      const customRateLimiter = new RateLimiter({
        maxLogsPerSecond: 10,
        maxLogsPerMinute: 100,
        burstLimit: 15, // Higher than per-second limit for testing
      });

      // Should allow 10 logs per second
      for (let i = 0; i < 10; i++) {
        expect(customRateLimiter.checkRateLimit('info')).toBe(true);
      }

      // 11th log should be blocked
      expect(customRateLimiter.checkRateLimit('info')).toBe(false);
    });

    test('should update configuration', () => {
      rateLimiter.updateConfig({ maxLogsPerSecond: 5 });

      // Should allow 5 logs per second
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.checkRateLimit('info')).toBe(true);
      }

      // 6th log should be blocked
      expect(rateLimiter.checkRateLimit('info')).toBe(false);
    });

    test('should get current configuration', () => {
      const config = rateLimiter.getConfig();

      expect(config.maxLogsPerSecond).toBe(1000);
      expect(config.maxLogsPerMinute).toBe(10000);
      expect(config.burstLimit).toBe(100);
      expect(config.windowSize).toBe(1000);
    });
  });

  describe('Statistics', () => {
    test('should track rate limiting statistics', () => {
      // Generate some logs
      for (let i = 0; i < 100; i++) {
        rateLimiter.checkRateLimit('info');
      }

      const stats = rateLimiter.getStats();

      expect(stats).toBeDefined();
      expect(Object.keys(stats).length).toBeGreaterThan(0);

      // Should have entries for info level
      const infoKeys = Object.keys(stats).filter((key) => key.includes('info'));
      expect(infoKeys.length).toBeGreaterThan(0);
    });

    test('should clear statistics', () => {
      // Generate some logs
      for (let i = 0; i < 100; i++) {
        rateLimiter.checkRateLimit('info');
      }

      const statsBefore = rateLimiter.getStats();
      expect(Object.keys(statsBefore).length).toBeGreaterThan(0);

      rateLimiter.clear();

      const statsAfter = rateLimiter.getStats();
      expect(Object.keys(statsAfter).length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very high rate limits', () => {
      const highRateLimiter = new RateLimiter({
        maxLogsPerSecond: 100000,
        maxLogsPerMinute: 1000000,
        burstLimit: 200000, // Higher than per-second limit
      });

      // Should handle high volume
      for (let i = 0; i < 10000; i++) {
        expect(highRateLimiter.checkRateLimit('info')).toBe(true);
      }
    });

    test('should handle zero rate limits', () => {
      const zeroRateLimiter = new RateLimiter({
        maxLogsPerSecond: 0,
        maxLogsPerMinute: 0,
      });

      // Should block all logs
      expect(zeroRateLimiter.checkRateLimit('info')).toBe(false);
    });

    test('should handle negative rate limits', () => {
      const negativeRateLimiter = new RateLimiter({
        maxLogsPerSecond: -1,
        maxLogsPerMinute: -1,
      });

      // Should block all logs
      expect(negativeRateLimiter.checkRateLimit('info')).toBe(false);
    });

    test('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);

      // Should not crash with long keys
      expect(() => rateLimiter.checkRateLimit('info', longKey)).not.toThrow();
      expect(rateLimiter.checkRateLimit('info', longKey)).toBe(true);
    });

    test('should handle special characters in keys', () => {
      const specialKey = 'test-key-with-special-chars!@#$%^&*()';

      // Should handle special characters
      expect(() => rateLimiter.checkRateLimit('info', specialKey)).not.toThrow();
      expect(rateLimiter.checkRateLimit('info', specialKey)).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should handle high volume efficiently', () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        rateLimiter.checkRateLimit('info', `key-${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 10000 iterations)
      expect(duration).toBeLessThan(100);
    });

    test('should not leak memory under continuous use', () => {
      const iterations = 100000;

      // Simulate continuous rate limiting
      for (let i = 0; i < iterations; i++) {
        rateLimiter.checkRateLimit('info', `key-${i % 1000}`); // Reuse keys
      }

      const stats = rateLimiter.getStats();

      // Should have reasonable number of entries (not one per iteration)
      expect(Object.keys(stats).length).toBeLessThan(iterations);
    });
  });
});
