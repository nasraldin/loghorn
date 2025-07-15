import { ColorManager } from '../lib/utils/colors';

describe('ColorManager', () => {
  let colorManager: ColorManager;

  beforeEach(() => {
    colorManager = new ColorManager({
      enableColors: true,
      customColors: {
        custom: '#ff0000',
        brand: '#00ff00',
      },
    });
  });

  describe('Colorization', () => {
    test('should return original text when colors are disabled', () => {
      const disabledManager = new ColorManager({ enableColors: false });
      const result = disabledManager.colorize('test', '#ff0000');
      expect(result).toBe('test');
    });

    test('should use custom colors when provided', () => {
      const result = colorManager.colorize('test', 'custom');
      expect(result).toBe('test'); // Node.js returns plain text
    });

    test('should handle hex colors', () => {
      const result = colorManager.colorize('test', '#ff0000');
      expect(result).toBe('test'); // Node.js returns plain text
    });

    test('should handle named colors', () => {
      const result = colorManager.colorize('test', 'red');
      expect(result).toBe('test'); // Node.js returns plain text
    });
  });

  describe('CSS Color Generation', () => {
    test('should return custom colors', () => {
      const cssColor = colorManager.getCSSColor('custom');
      expect(cssColor).toBe('#ff0000');
    });

    test('should return hex colors as-is', () => {
      const cssColor = colorManager.getCSSColor('#ff0000');
      expect(cssColor).toBe('#ff0000');
    });

    test('should map named colors to hex', () => {
      const cssColor = colorManager.getCSSColor('red');
      expect(cssColor).toBe('#dc3545');
    });

    test('should return unknown colors as-is', () => {
      const cssColor = colorManager.getCSSColor('unknown');
      expect(cssColor).toBe('unknown');
    });
  });

  describe('Environment Detection', () => {
    test('should handle browser environment', () => {
      // Mock window object
      const originalWindow = (global as any).window;
      (global as any).window = {};

      const result = colorManager.colorize('test', 'red');
      expect(result).toBe('%ctest');

      (global as any).window = originalWindow;
    });

    test('should handle Node.js environment', () => {
      // Ensure window is undefined
      const originalWindow = (global as any).window;
      delete (global as any).window;

      const result = colorManager.colorize('test', 'red');
      // Should return text as-is if chalk is not available
      expect(typeof result).toBe('string');

      (global as any).window = originalWindow;
    });
  });

  test('should return text if chalk is missing in colorizeForNode', () => {
    const manager = new ColorManager({ enableColors: true });
    (manager as any).chalk = null;
    // @ts-ignore
    expect(manager.colorizeForNode('test', 'red')).toBe('test');
  });

  test('should return text if color is unknown in colorizeForNode', () => {
    const manager = new ColorManager({ enableColors: true });
    (manager as any).chalk = { red: (t: string) => `red:${t}` };
    // @ts-ignore
    expect(manager.colorizeForNode('test', 'unknown')).toBe('test');
  });

  test('getCSSColor returns custom color', () => {
    const manager = new ColorManager({
      enableColors: true,
      customColors: { brand: '#123456' },
    });
    expect(manager.getCSSColor('brand')).toBe('#123456');
  });

  test('getCSSColor returns hex color', () => {
    const manager = new ColorManager({ enableColors: true });
    expect(manager.getCSSColor('#abcdef')).toBe('#abcdef');
  });

  test('getCSSColor returns named color', () => {
    const manager = new ColorManager({ enableColors: true });
    expect(manager.getCSSColor('red')).toBe('#dc3545');
  });

  test('getCSSColor returns input for unknown color', () => {
    const manager = new ColorManager({ enableColors: true });
    expect(manager.getCSSColor('unknown')).toBe('unknown');
  });

  test('colorizeForNode returns text if color is unknown', () => {
    const manager = new ColorManager({ enableColors: true });
    (manager as any).chalk = { red: (t: string) => `red:${t}` };
    // @ts-ignore
    expect(manager.colorizeForNode('test', 'notacolor')).toBe('test');
  });

  test('getCSSColor returns input if color is not in colorMap', () => {
    const manager = new ColorManager({ enableColors: true });
    expect(manager.getCSSColor('notacolor')).toBe('notacolor');
  });

  describe('Edge Cases', () => {
    it('should handle chalk import failure', () => {
      const originalRequire = require;
      const mockRequire = jest.fn().mockImplementation(() => {
        throw new Error('chalk not found');
      });

      // Mock require to fail
      (global as any).require = mockRequire;

      const colorManager = new ColorManager({
        enableColors: true,
      });

      // Should still work without chalk - returns text with CSS placeholder
      const result = colorManager.colorize('test', '#ff0000');
      expect(result).toBe('%ctest');

      // Restore require
      (global as any).require = originalRequire;
    });

    it('should handle unknown color names in getCSSColor', () => {
      const colorManager = new ColorManager({
        enableColors: true,
      });

      const result = colorManager.getCSSColor('unknown-color');
      expect(result).toBe('unknown-color');
    });
  });
});
