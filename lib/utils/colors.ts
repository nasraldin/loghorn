export interface ColorOptions {
  enableColors: boolean;
  customColors?: Record<string, string>;
}

export class ColorManager {
  private enableColors: boolean;
  private customColors: Record<string, string>;
  private chalk: any;

  constructor(options: ColorOptions) {
    this.enableColors = options.enableColors;
    this.customColors = options.customColors || {};

    // Dynamically import chalk only in Node.js environment
    if (
      typeof globalThis !== 'undefined' &&
      'window' in globalThis === false &&
      this.enableColors
    ) {
      try {
        this.chalk = require('chalk');
        // Test if chalk is working properly and colors are supported
        if (!this.chalk || typeof this.chalk.hex !== 'function') {
          this.chalk = null;
        } else {
          // Test if colors are actually supported in this terminal
          const testColor = this.chalk.red('test');
          if (!testColor.includes('\u001b[') && !testColor.includes('\x1b[')) {
            // No ANSI color codes detected, disable colors
            this.chalk = null;
          }
        }
      } catch {
        this.chalk = null;
      }
    } else {
      // Browser environment or colors disabled
      this.chalk = null;
    }
  }

  colorize(text: string, color: string): string {
    if (!this.enableColors || !text) {
      return text;
    }

    try {
      // Use custom color if available
      const customColor = this.customColors[color];
      if (customColor) {
        color = customColor;
      }

      // Browser environment
      if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
        return this.colorizeForBrowser(text);
      }

      // Node.js environment with chalk
      if (this.chalk) {
        return this.colorizeForNode(text, color);
      }

      return text;
    } catch (error) {
      // Fallback to plain text if anything fails
      return text;
    }
  }

  private colorizeForBrowser(text: string): string {
    // For browser, we return the text as-is since colors are handled in console.log
    return text;
  }

  private colorizeForNode(text: string, color: string): string {
    if (!this.chalk) return text;

    try {
      // Convert hex colors to chalk colors
      if (color.startsWith('#')) {
        try {
          return this.chalk.hex(color)(text);
        } catch {
          // If hex fails, try to map to named color
          const hexToNamed: Record<string, string> = {
            '#17a2b8': 'cyan', // info
            '#dc3545': 'red', // error
            '#ffc107': 'yellow', // warn
            '#6c757d': 'gray', // debug
            '#6f42c1': 'magenta', // trace
            '#28a745': 'green', // log
          };
          const namedColor = hexToNamed[color];
          if (namedColor) {
            return this.colorizeForNode(text, namedColor);
          }
        }
      }

      // Named colors
      const colorMap: Record<string, any> = {
        red: this.chalk.red,
        green: this.chalk.green,
        blue: this.chalk.blue,
        yellow: this.chalk.yellow,
        purple: this.chalk.magenta,
        cyan: this.chalk.cyan,
        gray: this.chalk.gray,
        white: this.chalk.white,
        black: this.chalk.black,
        // Add default log level colors
        debug: this.chalk.gray,
        info: this.chalk.cyan,
        warn: this.chalk.yellow,
        error: this.chalk.red,
        trace: this.chalk.magenta,
        log: this.chalk.green,
      };

      const chalkColor = colorMap[color];
      return chalkColor ? chalkColor(text) : text;
    } catch (error) {
      // Fallback to plain text if chalk fails
      return text;
    }
  }

  getCSSColor(color: string): string {
    const customColor = this.customColors[color];
    if (customColor) {
      color = customColor;
    }

    if (color.startsWith('#')) {
      return color;
    }

    const colorMap: Record<string, string> = {
      red: '#dc3545',
      green: '#28a745',
      blue: '#007bff',
      yellow: '#ffc107',
      purple: '#6f42c1',
      cyan: '#17a2b8',
      gray: '#6c757d',
      white: '#ffffff',
      black: '#000000',
      // Add default log level colors
      debug: '#6c757d',
      info: '#17a2b8',
      warn: '#ffc107',
      error: '#dc3545',
      trace: '#6f42c1',
      log: '#28a745',
    };

    return colorMap[color] || color;
  }
}
