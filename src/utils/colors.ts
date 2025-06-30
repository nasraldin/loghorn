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
      typeof globalThis !== "undefined" &&
      "window" in globalThis === false &&
      this.enableColors
    ) {
      try {
        this.chalk = require("chalk");
      } catch {
        this.chalk = null;
      }
    }
  }

  colorize(text: string, color: string): string {
    if (!this.enableColors) {
      return text;
    }

    // Use custom color if available
    const customColor = this.customColors[color];
    if (customColor) {
      color = customColor;
    }

    // Browser environment
    if (typeof globalThis !== "undefined" && "window" in globalThis) {
      return this.colorizeForBrowser(text, color);
    }

    // Node.js environment with chalk
    if (this.chalk) {
      return this.colorizeForNode(text, color);
    }

    return text;
  }

  private colorizeForBrowser(text: string, color: string): string {
    // Convert hex colors to CSS
    if (color.startsWith("#")) {
      return `%c${text}`;
    }

    // Named colors - just return the text with CSS placeholder
    return `%c${text}`;
  }

  private colorizeForNode(text: string, color: string): string {
    if (!this.chalk) return text;

    // Convert hex colors to chalk colors
    if (color.startsWith("#")) {
      return this.chalk.hex(color)(text);
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
    };

    const chalkColor = colorMap[color];
    return chalkColor ? chalkColor(text) : text;
  }

  getCSSColor(color: string): string {
    const customColor = this.customColors[color];
    if (customColor) {
      color = customColor;
    }

    if (color.startsWith("#")) {
      return color;
    }

    const colorMap: Record<string, string> = {
      red: "#dc3545",
      green: "#28a745",
      blue: "#007bff",
      yellow: "#ffc107",
      purple: "#6f42c1",
      cyan: "#17a2b8",
      gray: "#6c757d",
      white: "#ffffff",
      black: "#000000",
    };

    return colorMap[color] || color;
  }
}
