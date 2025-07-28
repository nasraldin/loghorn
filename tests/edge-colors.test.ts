import { EdgeColorManager } from '../lib/utils/edge-colors';

describe('EdgeColorManager', () => {
  let colorManager: EdgeColorManager;
  let originalEdgeRuntime: any;

  beforeEach(() => {
    // Store original EdgeRuntime
    originalEdgeRuntime = (globalThis as any).EdgeRuntime;
  });

  afterEach(() => {
    // Restore original EdgeRuntime
    if (originalEdgeRuntime) {
      (globalThis as any).EdgeRuntime = originalEdgeRuntime;
    } else {
      delete (globalThis as any).EdgeRuntime;
    }
  });

  describe('Edge Runtime Detection', () => {
    test('should detect Edge Runtime environment', () => {
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      colorManager = new EdgeColorManager({
        enableColors: true,
      });

      expect(colorManager.isEdgeRuntimeEnvironment()).toBe(true);
    });

    test('should detect non-Edge Runtime environment', () => {
      delete (globalThis as any).EdgeRuntime;
      colorManager = new EdgeColorManager({
        enableColors: true,
      });

      expect(colorManager.isEdgeRuntimeEnvironment()).toBe(false);
    });
  });

  describe('Color Support Detection', () => {
    test('should support colors in Edge Runtime when enabled', () => {
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      colorManager = new EdgeColorManager({
        enableColors: true,
      });

      expect(colorManager.supportsColors()).toBe(true);
    });

    test('should not support colors when disabled', () => {
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      colorManager = new EdgeColorManager({
        enableColors: false,
      });

      expect(colorManager.supportsColors()).toBe(false);
    });

    test('should not support colors when forcePlainText is true', () => {
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      colorManager = new EdgeColorManager({
        enableColors: true,
        forcePlainText: true,
      });

      expect(colorManager.supportsColors()).toBe(false);
    });
  });

  describe('Edge Runtime Color Handling', () => {
    beforeEach(() => {
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      colorManager = new EdgeColorManager({
        enableColors: true,
      });
    });

    test('should colorize text with ANSI codes in Edge Runtime', () => {
      const result = colorManager.colorize('test', 'red');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('\x1b[0m');
      expect(result).toContain('test');
    });

    test('should handle log level colors', () => {
      const debugResult = colorManager.colorize('debug', 'debug');
      const infoResult = colorManager.colorize('info', 'info');
      const warnResult = colorManager.colorize('warn', 'warn');
      const errorResult = colorManager.colorize('error', 'error');

      expect(debugResult).toContain('\x1b[90m');
      expect(infoResult).toContain('\x1b[36m');
      expect(warnResult).toContain('\x1b[33m');
      expect(errorResult).toContain('\x1b[31m');
    });

    test('should handle hex colors by mapping to ANSI', () => {
      const result = colorManager.colorize('test', '#dc3545');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('\x1b[0m');
    });

    test('should return plain text for unknown colors', () => {
      const result = colorManager.colorize('test', 'unknown');
      expect(result).toBe('test');
    });

    test('should handle custom colors', () => {
      colorManager = new EdgeColorManager({
        enableColors: true,
        customColors: {
          custom: '#ff0000',
        },
      });

      const result = colorManager.colorize('test', 'custom');
      expect(result).toContain('\x1b[31m');
    });
  });

  describe('Non-Edge Runtime Color Handling', () => {
    beforeEach(() => {
      delete (globalThis as any).EdgeRuntime;
      colorManager = new EdgeColorManager({
        enableColors: true,
      });
    });

    test('should use basic color handling outside Edge Runtime', () => {
      const result = colorManager.colorize('test', 'red');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('\x1b[0m');
    });

    test('should handle log level colors in basic mode', () => {
      const debugResult = colorManager.colorize('debug', 'debug');
      const infoResult = colorManager.colorize('info', 'info');
      const warnResult = colorManager.colorize('warn', 'warn');
      const errorResult = colorManager.colorize('error', 'error');

      expect(debugResult).toContain('\x1b[90m');
      expect(infoResult).toContain('\x1b[36m');
      expect(warnResult).toContain('\x1b[33m');
      expect(errorResult).toContain('\x1b[31m');
    });
  });

  describe('CSS Color Generation', () => {
    beforeEach(() => {
      colorManager = new EdgeColorManager({
        enableColors: true,
      });
    });

    test('should return hex colors as-is', () => {
      const result = colorManager.getCSSColor('#ff0000');
      expect(result).toBe('#ff0000');
    });

    test('should map named colors to hex', () => {
      const redResult = colorManager.getCSSColor('red');
      const greenResult = colorManager.getCSSColor('green');
      const blueResult = colorManager.getCSSColor('blue');

      expect(redResult).toBe('#dc3545');
      expect(greenResult).toBe('#28a745');
      expect(blueResult).toBe('#007bff');
    });

    test('should handle log level colors', () => {
      const debugResult = colorManager.getCSSColor('debug');
      const infoResult = colorManager.getCSSColor('info');
      const warnResult = colorManager.getCSSColor('warn');
      const errorResult = colorManager.getCSSColor('error');

      expect(debugResult).toBe('#6c757d');
      expect(infoResult).toBe('#17a2b8');
      expect(warnResult).toBe('#ffc107');
      expect(errorResult).toBe('#dc3545');
    });

    test('should handle custom colors', () => {
      colorManager = new EdgeColorManager({
        enableColors: true,
        customColors: {
          custom: '#ff0000',
        },
      });

      const result = colorManager.getCSSColor('custom');
      expect(result).toBe('#ff0000');
    });

    test('should return unknown colors as-is', () => {
      const result = colorManager.getCSSColor('unknown');
      expect(result).toBe('unknown');
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully', () => {
      colorManager = new EdgeColorManager({
        enableColors: true,
      });

      // Should not throw even with invalid inputs
      expect(() => colorManager.colorize('', 'red')).not.toThrow();
      expect(() => colorManager.colorize('test', '')).not.toThrow();
    });

    test('should return plain text when colors are disabled', () => {
      colorManager = new EdgeColorManager({
        enableColors: false,
      });

      const result = colorManager.colorize('test', 'red');
      expect(result).toBe('test');
    });

    test('should return plain text when forcePlainText is true', () => {
      colorManager = new EdgeColorManager({
        enableColors: true,
        forcePlainText: true,
      });

      const result = colorManager.colorize('test', 'red');
      expect(result).toBe('test');
    });
  });

  describe('Color Information', () => {
    test('should provide accurate color information', () => {
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      colorManager = new EdgeColorManager({
        enableColors: true,
        customColors: { test: '#ff0000' },
      });

      const info = colorManager.getColorInfo();

      expect(info.isEdgeRuntime).toBe(true);
      expect(info.supportsColors).toBe(true);
      expect(info.enableColors).toBe(true);
      expect(info.forcePlainText).toBe(false);
    });

    test('should provide accurate color information when disabled', () => {
      delete (globalThis as any).EdgeRuntime;
      colorManager = new EdgeColorManager({
        enableColors: false,
        forcePlainText: true,
      });

      const info = colorManager.getColorInfo();

      expect(info.isEdgeRuntime).toBe(false);
      expect(info.supportsColors).toBe(false);
      expect(info.enableColors).toBe(false);
      expect(info.forcePlainText).toBe(true);
    });
  });

  describe('Hex to ANSI Mapping', () => {
    beforeEach(() => {
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      colorManager = new EdgeColorManager({
        enableColors: true,
      });
    });

    test('should map common hex colors to ANSI', () => {
      const redResult = colorManager.colorize('test', '#dc3545');
      const greenResult = colorManager.colorize('test', '#28a745');
      const blueResult = colorManager.colorize('test', '#007bff');

      expect(redResult).toContain('\x1b[31m');
      expect(greenResult).toContain('\x1b[32m');
      expect(blueResult).toContain('\x1b[34m');
    });

    test('should handle unknown hex colors gracefully', () => {
      const result = colorManager.colorize('test', '#unknown');
      expect(result).toBe('test');
    });

    test('should handle case-insensitive hex colors', () => {
      const result = colorManager.colorize('test', '#DC3545');
      expect(result).toContain('\x1b[31m');
    });
  });
});
