export interface EdgeColorOptions {
  enableColors: boolean;
  customColors?: Record<string, string>;
  forcePlainText?: boolean;
}

export class EdgeColorManager {
  private readonly enableColors: boolean;
  private readonly customColors: Record<string, string>;
  private readonly forcePlainText: boolean;
  private readonly isEdgeRuntime: boolean;

  constructor(options: EdgeColorOptions) {
    this.enableColors = options.enableColors;
    this.customColors = options.customColors || {};
    this.forcePlainText = options.forcePlainText || false;
    this.isEdgeRuntime = this.detectEdgeRuntime();
  }

  private detectEdgeRuntime(): boolean {
    return (
      typeof globalThis !== 'undefined' &&
      'EdgeRuntime' in globalThis &&
      typeof (globalThis as any).EdgeRuntime === 'string'
    );
  }

  colorize(text: string, color: string): string {
    if (!this.enableColors || !text || this.forcePlainText) {
      return text;
    }

    try {
      // Use custom color if available
      const customColor = this.customColors[color];
      if (customColor) {
        color = customColor;
      }

      // Edge Runtime specific handling
      if (this.isEdgeRuntime) {
        return this.colorizeForEdgeRuntime(text, color);
      }

      // Fallback to basic color handling
      return this.colorizeBasic(text, color);
    } catch (error) {
      // Fallback to plain text if anything fails
      return text;
    }
  }

  private colorizeForEdgeRuntime(text: string, color: string): string {
    // Edge Runtime optimized color handling
    // Use simple ANSI codes that are more likely to work in Edge Runtime

    const ansiColors: Record<string, string> = {
      // Standard colors
      red: '\x1b[31m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      yellow: '\x1b[33m',
      purple: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      white: '\x1b[37m',
      black: '\x1b[30m',

      // Log level colors
      debug: '\x1b[90m',
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      trace: '\x1b[35m',
      log: '\x1b[32m',
    };

    const resetCode = '\x1b[0m';
    const ansiCode = ansiColors[color];

    if (ansiCode) {
      return `${ansiCode}${text}${resetCode}`;
    }

    // Handle hex colors by mapping to closest ANSI color
    if (color.startsWith('#')) {
      const mappedColor = this.mapHexToAnsi(color);
      if (mappedColor) {
        return `${mappedColor}${text}${resetCode}`;
      }
    }

    return text;
  }

  private mapHexToAnsi(hexColor: string): string | null {
    // Simple hex to ANSI mapping for Edge Runtime
    const hexToAnsi: Record<string, string> = {
      '#dc3545': '\x1b[31m', // red
      '#28a745': '\x1b[32m', // green
      '#007bff': '\x1b[34m', // blue
      '#ffc107': '\x1b[33m', // yellow
      '#6f42c1': '\x1b[35m', // purple
      '#17a2b8': '\x1b[36m', // cyan
      '#6c757d': '\x1b[90m', // gray
      '#ffffff': '\x1b[37m', // white
      '#000000': '\x1b[30m', // black
      '#ff0000': '\x1b[31m', // red (custom)
      '#00ff00': '\x1b[32m', // green (custom)
      '#0000ff': '\x1b[34m', // blue (custom)
      '#ffff00': '\x1b[33m', // yellow (custom)
      '#ff00ff': '\x1b[35m', // magenta (custom)
      '#00ffff': '\x1b[36m', // cyan (custom)
    };

    return hexToAnsi[hexColor.toLowerCase()] || null;
  }

  private colorizeBasic(text: string, color: string): string {
    // Basic color handling for non-Edge Runtime environments
    // This is a simplified version that doesn't rely on chalk

    const basicColors: Record<string, string> = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      yellow: '\x1b[33m',
      purple: '\x1b[35m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      white: '\x1b[37m',
      black: '\x1b[30m',
      debug: '\x1b[90m',
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      trace: '\x1b[35m',
      log: '\x1b[32m',
    };

    const resetCode = '\x1b[0m';
    const colorCode = basicColors[color];

    if (colorCode) {
      return `${colorCode}${text}${resetCode}`;
    }

    return text;
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
      debug: '#6c757d',
      info: '#17a2b8',
      warn: '#ffc107',
      error: '#dc3545',
      trace: '#6f42c1',
      log: '#28a745',
    };

    return colorMap[color] || color;
  }

  // Edge Runtime specific methods
  isEdgeRuntimeEnvironment(): boolean {
    return this.isEdgeRuntime;
  }

  // Optimized color detection for Edge Runtime
  supportsColors(): boolean {
    // Always check Edge Runtime first to avoid any Node.js API calls
    if (this.isEdgeRuntime) {
      // In Edge Runtime, we assume basic ANSI support
      return this.enableColors && !this.forcePlainText;
    }

    // For non-Edge Runtime environments, assume color support if enabled
    // This avoids any Node.js API calls that might cause Edge Runtime issues
    return this.enableColors && !this.forcePlainText;
  }

  // Get color information for debugging
  getColorInfo(): {
    isEdgeRuntime: boolean;
    supportsColors: boolean;
    enableColors: boolean;
    forcePlainText: boolean;
  } {
    return {
      isEdgeRuntime: this.isEdgeRuntime,
      supportsColors: this.supportsColors(),
      enableColors: this.enableColors,
      forcePlainText: this.forcePlainText,
    };
  }
}
