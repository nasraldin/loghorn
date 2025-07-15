import stringify from 'safe-stable-stringify';

import type { LogContext, LogEntry, LoggerConfig, LogLevel } from '../types';
import { ColorManager } from '../utils/colors';

export class Logger {
  private config: LoggerConfig;
  private colorManager: ColorManager;
  private context: LogContext = {};

  constructor(config: LoggerConfig) {
    this.config = config;
    this.colorManager = new ColorManager({
      enableColors: config.enableColors,
      customColors: config.customColors || {},
    });
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.logLevels[level]?.enabled ?? false;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const logConfig = this.config.logLevels[level];
    if (!logConfig) return message;

    let formattedMessage = '';

    // Add emoji if enabled
    if (this.config.enableEmojis && logConfig.emoji) {
      formattedMessage += `${logConfig.emoji} `;
    }

    // Add timestamp if enabled
    if (this.config.enableTimestamps) {
      const timestamp = new Date().toISOString();
      formattedMessage += `[${timestamp}] `;
    }

    // Add level
    formattedMessage += `[${level.toUpperCase()}] `;

    // Add message
    formattedMessage += message;

    return formattedMessage;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context },
    };

    if (data !== undefined) {
      entry.data = data;
    }

    if (this.config.enableStackTraces && level === 'error') {
      try {
        const stack = new Error().stack;
        if (stack) {
          // Limit stack trace size to prevent memory issues
          const MAX_STACK_SIZE = 2000;
          entry.stack =
            stack.length > MAX_STACK_SIZE
              ? stack.substring(0, MAX_STACK_SIZE) + '...'
              : stack;
        }
      } catch (error) {
        // Silently fail if stack trace generation fails
      }
    }

    return entry;
  }

  private logToConsole(level: LogLevel, message: string, data?: unknown): void {
    const logConfig = this.config.logLevels[level];
    if (!logConfig) return;

    const formattedMessage = this.formatMessage(level, message);
    const coloredMessage = this.colorManager.colorize(
      formattedMessage,
      logConfig.color,
    );

    // Browser environment
    if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
      this.logToBrowserConsole(level, coloredMessage, data, logConfig.color);
      return;
    }

    // Node.js environment
    this.logToNodeConsole(level, coloredMessage, data);
  }

  private logToBrowserConsole(
    level: LogLevel,
    message: string,
    data?: unknown,
    color?: string,
  ): void {
    const consoleMethod =
      level === 'error'
        ? 'error'
        : level === 'warn'
          ? 'warn'
          : level === 'debug'
            ? 'debug'
            : 'log';

    if (data !== undefined) {
      if (color && this.config.enableColors) {
        console[consoleMethod](
          message,
          `color: ${this.colorManager.getCSSColor(color)}`,
          data,
        );
      } else {
        console[consoleMethod](message, data);
      }
    } else {
      if (color && this.config.enableColors) {
        console[consoleMethod](
          message,
          `color: ${this.colorManager.getCSSColor(color)}`,
        );
      } else {
        console[consoleMethod](message);
      }
    }
  }

  private logToNodeConsole(level: LogLevel, message: string, data?: unknown): void {
    const consoleMethod =
      level === 'error'
        ? 'error'
        : level === 'warn'
          ? 'warn'
          : level === 'debug'
            ? 'debug'
            : 'log';

    if (data !== undefined) {
      console[consoleMethod](message, data);
    } else {
      console[consoleMethod](message);
    }
  }

  private logToJSON(level: LogLevel, message: string, data?: unknown): void {
    try {
      const entry = this.createLogEntry(level, message, data);
      let indent = 0;
      if (this.config.prettyJSON === true) indent = 2;
      else if (typeof this.config.prettyJSON === 'number')
        indent = this.config.prettyJSON;
      // Use safe-stable-stringify for JSON output
      const jsonString = stringify(entry, null, indent) || '';
      const MAX_JSON_SIZE = 10000;
      if (jsonString.length > MAX_JSON_SIZE) {
        console.warn(
          `[LOGHORN WARNING] JSON log entry too large (${jsonString.length} chars), truncating`,
        );
        console.log(jsonString.substring(0, MAX_JSON_SIZE) + '...');
      } else {
        console.log(jsonString);
      }
    } catch (error) {
      // Fallback to simple logging if JSON serialization fails
      console.error(`[LOGHORN ERROR] JSON serialization failed:`, error);
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  public log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    if (this.config.enableJSON) {
      this.logToJSON(level, message, data);
    } else {
      this.logToConsole(level, message, data);
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  trace(message: string, data?: unknown): void {
    this.log('trace', message, data);
  }

  logMessage(message: string, data?: unknown): void {
    this.log('log', message, data);
  }

  // Convenience methods for common logging patterns
  success(message: string, data?: unknown): void {
    this.info(`✅ ${message}`, data);
  }

  failure(message: string, data?: unknown): void {
    this.error(`❌ ${message}`, data);
  }

  start(message: string, data?: unknown): void {
    this.info(`🚀 ${message}`, data);
  }

  end(message: string, data?: unknown): void {
    this.info(`🏁 ${message}`, data);
  }

  // Group logging for better organization
  group(
    label: string,
    fn: () => void | Promise<void>,
    options?: { collapsed?: boolean; context?: LogContext },
  ): void {
    const { collapsed = false, context = {} } = options || {};

    if (typeof console !== 'undefined' && console.group) {
      // Browser/Node.js with native group support
      if (collapsed && console.groupCollapsed) {
        console.groupCollapsed(label);
      } else {
        console.group(label);
      }

      // Set group context if provided
      const originalContext = { ...this.context };
      this.setContext({ ...this.context, ...context });

      try {
        const result = fn();
        if (result instanceof Promise) {
          // Handle async function
          result
            .catch((error: unknown) => {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              this.error(`Group execution failed: ${errorMessage}`, error);
            })
            .finally(() => {
              this.setContext(originalContext);
              console.groupEnd();
            });
        } else {
          // Handle sync function
          this.setContext(originalContext);
          console.groupEnd();
        }
      } catch (error: unknown) {
        this.setContext(originalContext);
        console.groupEnd();
        throw error;
      }
    } else {
      // Fallback for environments without native group support
      const indent = this.getGroupIndentation();
      const groupContext = { ...this.context, ...context };

      this.setContext(groupContext);
      this.info(`${indent}📁 ${label}`);

      try {
        const result = fn();
        if (result instanceof Promise) {
          // Handle async function
          result
            .catch((error: unknown) => {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              this.error(
                `${indent}  ❌ Group execution failed: ${errorMessage}`,
                error,
              );
            })
            .finally(() => {
              this.setContext({ ...this.context });
              this.info(`${indent}📁 End: ${label}`);
            });
        } else {
          // Handle sync function
          this.setContext({ ...this.context });
          this.info(`${indent}📁 End: ${label}`);
        }
      } catch (error: unknown) {
        this.setContext({ ...this.context });
        this.info(`${indent}📁 End: ${label}`);
        throw error;
      }
    }
  }

  // Collapsed group logging
  groupCollapsed(
    label: string,
    fn: () => void | Promise<void>,
    options?: { context?: LogContext },
  ): void {
    this.group(label, fn, { collapsed: true, ...options });
  }

  // Async group support with explicit async/await
  async groupAsync(
    label: string,
    fn: () => Promise<void>,
    options?: { collapsed?: boolean; context?: LogContext },
  ): Promise<void> {
    const { collapsed = false, context = {} } = options || {};

    if (typeof console !== 'undefined' && console.group) {
      // Browser/Node.js with native group support
      if (collapsed && console.groupCollapsed) {
        console.groupCollapsed(label);
      } else {
        console.group(label);
      }

      // Set group context if provided
      const originalContext = { ...this.context };
      this.setContext({ ...this.context, ...context });

      try {
        await fn();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.error(`Group execution failed: ${errorMessage}`, error);
        throw error;
      } finally {
        this.setContext(originalContext);
        console.groupEnd();
      }
    } else {
      // Fallback for environments without native group support
      const indent = this.getGroupIndentation();
      const groupContext = { ...this.context, ...context };

      this.setContext(groupContext);
      this.info(`${indent}📁 ${label}`);

      try {
        await fn();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.error(`${indent}  ❌ Group execution failed: ${errorMessage}`, error);
        throw error;
      } finally {
        this.setContext({ ...this.context });
        this.info(`${indent}📁 End: ${label}`);
      }
    }
  }

  // Get indentation for group fallback
  private getGroupIndentation(): string {
    // Count nested groups by looking at context
    const groupDepth = (this.context['groupDepth'] as number) || 0;
    return '  '.repeat(groupDepth);
  }

  // Time logging
  time(label: string): void {
    if (typeof console !== 'undefined' && console.time) {
      console.time(label);
    } else {
      this.info(`⏱️  Start: ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (typeof console !== 'undefined' && console.timeEnd) {
      console.timeEnd(label);
    } else {
      this.info(`⏱️  End: ${label}`);
    }
  }

  // Table logging
  table(
    label: string,
    data: unknown[] | Record<string, unknown>,
    options?: { format?: 'auto' | 'console' | 'custom' },
  ): void {
    try {
      const format = options?.format || 'auto';

      if (
        format === 'console' ||
        (format === 'auto' && this.config.enableTable !== false)
      ) {
        this.logTableWithConsole(label, data);
      } else {
        this.logTableCustom(label, data);
      }
    } catch (error) {
      // Fallback to simple logging if table formatting fails
      console.error(
        `[LOGHORN ERROR] Table formatting failed for "${label}":`,
        error,
      );
      console.log(`📊 ${label}:`, data);
    }
  }

  private logTableWithConsole(
    label: string,
    data: unknown[] | Record<string, unknown>,
  ): void {
    try {
      if (typeof console !== 'undefined' && typeof console.table === 'function') {
        const formattedMessage = this.formatMessage('info', `📊 ${label}`);
        const coloredMessage = this.colorManager.colorize(
          formattedMessage,
          this.config.logLevels.info.color,
        );

        console.log(coloredMessage);
        console.table(data);
      } else {
        // Fallback to custom formatting if console.table is not available
        this.logTableCustom(label, data);
      }
    } catch (error) {
      // Fallback to simple logging if console.table fails
      console.error(`[LOGHORN ERROR] console.table failed for "${label}":`, error);
      console.log(`📊 ${label}:`, data);
    }
  }

  private logTableCustom(
    label: string,
    data: unknown[] | Record<string, unknown>,
  ): void {
    try {
      const formattedMessage = this.formatMessage('info', `📊 ${label}`);
      const coloredMessage = this.colorManager.colorize(
        formattedMessage,
        this.config.logLevels.info.color,
      );

      console.log(coloredMessage);

      if (Array.isArray(data)) {
        this.formatTableFromArray(data);
      } else if (typeof data === 'object' && data !== null) {
        this.formatTableFromObject(data);
      } else {
        console.log(data);
      }
    } catch (error) {
      // Fallback to simple logging if custom formatting fails
      console.error(
        `[LOGHORN ERROR] Custom table formatting failed for "${label}":`,
        error,
      );
      console.log(`📊 ${label}:`, data);
    }
  }

  private formatTableFromArray(data: unknown[]): void {
    try {
      if (data.length === 0) {
        console.log('(empty array)');
        return;
      }

      // Safety check: limit array size to prevent memory issues
      const MAX_ARRAY_SIZE = 1000;
      if (data.length > MAX_ARRAY_SIZE) {
        console.log(
          `(array too large: ${data.length} items, showing first ${MAX_ARRAY_SIZE})`,
        );
        data = data.slice(0, MAX_ARRAY_SIZE);
      }

      // Separate objects and primitives
      const objects: Record<string, unknown>[] = [];
      const primitives: unknown[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const item = data[i];
          if (typeof item === 'object' && item !== null) {
            objects.push(item as Record<string, unknown>);
          } else {
            primitives.push(item);
          }
        } catch (error) {
          // Skip problematic items
          console.warn(`[LOGHORN WARNING] Skipping item at index ${i}:`, error);
        }
      }

      if (objects.length === 0 && primitives.length > 0) {
        // Only primitives: print as a simple table
        this.printPrimitiveTable(primitives);
        return;
      }

      if (objects.length > 0) {
        this.printObjectTable(objects);
      }

      // Print primitives after the table if mixed
      if (objects.length > 0 && primitives.length > 0) {
        this.printPrimitives(primitives);
      }
    } catch (error) {
      console.error('[LOGHORN ERROR] Array table formatting failed:', error);
      console.log('(table formatting failed)');
    }
  }

  private printPrimitiveTable(primitives: unknown[]): void {
    try {
      console.log('┌─ Index ─┬─ Value ─┐');
      for (let i = 0; i < primitives.length; i++) {
        try {
          const item = primitives[i];
          const strValue = this.safeStringify(item);
          console.log(`│ ${i.toString().padEnd(7)} │ ${strValue.padEnd(7)} │`);
        } catch (error) {
          console.log(`│ ${i.toString().padEnd(7)} │ [ERROR] │`);
        }
      }
      console.log('└─────────┴─────────┘');
    } catch (error) {
      console.error('[LOGHORN ERROR] Primitive table failed:', error);
    }
  }

  private printObjectTable(objects: Record<string, unknown>[]): void {
    try {
      // Array of objects - collect all unique keys from all objects
      const allKeys = new Set<string>();

      for (const item of objects) {
        try {
          Object.keys(item).forEach((key) => allKeys.add(key));
        } catch (error) {
          // Skip problematic objects
          console.warn('[LOGHORN WARNING] Skipping problematic object:', error);
        }
      }

      const keys = Array.from(allKeys);
      if (keys.length === 0) {
        console.log('(empty objects)');
        return;
      }

      // Safety check: limit number of columns
      const MAX_COLUMNS = 20;
      if (keys.length > MAX_COLUMNS) {
        console.log(
          `(too many columns: ${keys.length}, showing first ${MAX_COLUMNS})`,
        );
        keys.splice(MAX_COLUMNS);
      }

      // Calculate column widths
      const columnWidths: Record<string, number> = {};
      keys.forEach((key) => {
        columnWidths[key] = key.length;
      });

      // Find max widths with safety limits
      const MAX_COLUMN_WIDTH = 50;
      for (const item of objects) {
        try {
          for (const key of keys) {
            if (key) {
              const value = item[key];
              const strValue = this.safeStringify(value);
              const width = Math.min(strValue.length, MAX_COLUMN_WIDTH);
              columnWidths[key] = Math.max(columnWidths[key] || 0, width);
            }
          }
        } catch (error) {
          // Skip problematic items
        }
      }

      // Print header
      this.printTableHeader(keys, columnWidths);

      // Print rows
      for (let i = 0; i < objects.length; i++) {
        try {
          const item = objects[i];
          if (item) {
            this.printTableRow(item, keys, columnWidths);
          }
        } catch (error) {
          console.log(`│ [ERROR] │`);
        }
      }

      // Print footer
      this.printTableFooter(keys, columnWidths);
    } catch (error) {
      console.error('[LOGHORN ERROR] Object table failed:', error);
    }
  }

  private printTableHeader(
    keys: string[],
    columnWidths: Record<string, number>,
  ): void {
    try {
      let header = '┌─';
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key) {
          const width = columnWidths[key] || 0;
          header += `─ ${key.padEnd(width)} ─`;
          if (i < keys.length - 1) {
            header += '─┬─';
          }
        }
      }
      header += '─┐';
      console.log(header);
    } catch (error) {
      console.error('[LOGHORN ERROR] Header printing failed:', error);
    }
  }

  private printTableRow(
    item: Record<string, unknown>,
    keys: string[],
    columnWidths: Record<string, number>,
  ): void {
    try {
      let row = '│ ';
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key) {
          const value = item[key];
          const strValue = this.safeStringify(value);
          const width = columnWidths[key] || 0;
          row += ` ${strValue.padEnd(width)} │`;
          if (i < keys.length - 1) {
            row += ' │ ';
          }
        }
      }
      console.log(row);
    } catch (error) {
      console.log('│ [ERROR] │');
    }
  }

  private printTableFooter(
    keys: string[],
    columnWidths: Record<string, number>,
  ): void {
    try {
      let footer = '└─';
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key) {
          const width = columnWidths[key] || 0;
          footer += `─${'─'.repeat(width + 2)}─`;
          if (i < keys.length - 1) {
            footer += '─┴─';
          }
        }
      }
      footer += '─┘';
      console.log(footer);
    } catch (error) {
      console.error('[LOGHORN ERROR] Footer printing failed:', error);
    }
  }

  private printPrimitives(primitives: unknown[]): void {
    try {
      for (const item of primitives) {
        console.log(this.safeStringify(item));
      }
    } catch (error) {
      console.error('[LOGHORN ERROR] Primitive printing failed:', error);
    }
  }

  private safeStringify(value: unknown): string {
    try {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'object') {
        // Use safe-stable-stringify for objects/arrays
        const str = stringify(value);
        if (str === undefined) return '[UNSERIALIZABLE]';
        const MAX_STRING_LENGTH = 100;
        return str.length > MAX_STRING_LENGTH
          ? str.substring(0, MAX_STRING_LENGTH) + '...'
          : str;
      }
      const str = String(value);
      const MAX_STRING_LENGTH = 100;
      return str.length > MAX_STRING_LENGTH
        ? str.substring(0, MAX_STRING_LENGTH) + '...'
        : str;
    } catch (error) {
      return '[ERROR]';
    }
  }

  private formatTableFromObject(data: Record<string, unknown>): void {
    try {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        console.log('(empty object)');
        return;
      }

      // Safety check: limit number of properties
      const MAX_PROPERTIES = 50;
      if (keys.length > MAX_PROPERTIES) {
        console.log(
          `(too many properties: ${keys.length}, showing first ${MAX_PROPERTIES})`,
        );
        keys.splice(MAX_PROPERTIES);
      }

      // Calculate max key width
      const maxKeyWidth = Math.max(...keys.map((key) => key.length));

      console.log('┌─' + '─'.repeat(maxKeyWidth + 2) + '─┬─ Value ─┐');
      for (let i = 0; i < keys.length; i++) {
        try {
          const key = keys[i];
          if (key) {
            const value = data[key];
            const strValue = this.safeStringify(value);
            const paddedKey = key.padEnd(maxKeyWidth);
            console.log(`│ ${paddedKey} │ ${strValue.padEnd(7)} │`);
            if (i < keys.length - 1) {
              console.log(
                '├─' + '─'.repeat(maxKeyWidth + 2) + '─┼─' + '─'.repeat(7) + '─┤',
              );
            }
          }
        } catch (error) {
          console.log(`│ [ERROR] │ [ERROR] │`);
        }
      }
      console.log(
        '└─' + '─'.repeat(maxKeyWidth + 2) + '─┴─' + '─'.repeat(7) + '─┘',
      );
    } catch (error) {
      console.error('[LOGHORN ERROR] Object table formatting failed:', error);
      console.log('(table formatting failed)');
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.colorManager = new ColorManager({
      enableColors: this.config.enableColors,
      customColors: this.config.customColors || {},
    });
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}
