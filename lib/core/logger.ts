import stringify from 'safe-stable-stringify';

import type { LogContext, LogEntry, LoggerConfig, LogLevel } from '../types';
import { ColorManager } from '../utils/colors';

type ConsoleMethod = 'log' | 'error' | 'warn' | 'debug';

export class Logger {
  protected config: LoggerConfig;
  protected colorManager: ColorManager;
  protected context: LogContext = {};

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

  protected shouldLog(level: LogLevel): boolean {
    return this.config.logLevels[level]?.enabled ?? false;
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
    try {
      const logConfig = this.config.logLevels[level];
      if (!logConfig) return;

      // Browser environment
      if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
        this.logToBrowserConsole(level, message, data, logConfig);
        return;
      }

      // Node.js environment
      this.logToNodeConsole(level, message, data, logConfig);
    } catch (error) {
      // Fallback to simple logging if anything fails
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  /**
   * Unified message formatting system
   * This is the central method for all log formatting across the library
   */
  protected formatMessage(
    level: LogLevel,
    message: string,
    options?: {
      format?: 'elegant' | 'structured' | 'compact' | 'minimal';
      includeData?: boolean;
      data?: unknown;
    },
  ): { formatted: string; raw: string; structured?: Record<string, unknown> } {
    const logConfig = this.config.logLevels[level];
    if (!logConfig) {
      return { formatted: message, raw: message };
    }

    const format = options?.format || 'elegant';

    // If showHeader is explicitly false, return minimal format
    if (this.config.showHeader === false) {
      return { formatted: message, raw: message };
    }

    switch (format) {
      case 'minimal':
        return { formatted: message, raw: message };

      case 'compact':
        return this.formatCompact(level, message);

      case 'structured':
        return this.formatStructured(level, message, options?.data);

      case 'elegant':
      default:
        return this.formatElegant(level, message);
    }
  }

  /**
   * Elegant formatting with emoji, timestamp, level, and project name
   */
  private formatElegant(
    level: LogLevel,
    message: string,
  ): { formatted: string; raw: string } {
    const logConfig = this.config.logLevels[level];
    if (!logConfig) return { formatted: message, raw: message };

    let output = '';

    // Add emoji if enabled and not explicitly disabled
    if (
      this.config.enableEmojis &&
      this.config.showEmoji !== false &&
      logConfig.emoji
    ) {
      output += `${logConfig.emoji} `;
    }

    // Add project name if enabled and available
    if (this.config.showProjectName !== false) {
      const projectName = this.getProjectName();
      if (projectName) {
        output += `[${projectName}] `;
      }
    }

    // Add timestamp if enabled and not explicitly disabled
    if (this.config.enableTimestamps && this.config.showTimestamp !== false) {
      const timestamp = new Date().toISOString();
      output += `[${timestamp}] `;
    }

    // Add level if not explicitly disabled
    if (this.config.showLevel !== false) {
      output += `[${level.toUpperCase()}] `;
    }

    // Add message
    output += message;

    return { formatted: output, raw: message };
  }

  /**
   * Compact formatting with minimal elements
   */
  private formatCompact(
    level: LogLevel,
    message: string,
  ): { formatted: string; raw: string } {
    let output = '';

    // Add timestamp
    if (this.config.enableTimestamps) {
      const timestamp = new Date().toISOString();
      output += `${timestamp} `;
    }

    // Add level
    output += `${level.toUpperCase()} `;

    // Add project name if available
    const projectName = this.getProjectName();
    if (projectName) {
      output += `[${projectName}] `;
    }

    // Add message
    output += message;

    return { formatted: output, raw: message };
  }

  /**
   * Structured JSON formatting for log aggregation
   */
  private formatStructured(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): { formatted: string; raw: string; structured: Record<string, unknown> } {
    const logConfig = this.config.logLevels[level];
    if (!logConfig) {
      return { formatted: message, raw: message, structured: { message } };
    }

    const structured: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
    };

    // Add project name if available
    const projectName = this.getProjectName();
    if (projectName) {
      structured['project'] = projectName;
    }

    // Add context if available
    if (Object.keys(this.context).length > 0) {
      structured['context'] = this.context;
    }

    // Add data if provided
    if (data !== undefined) {
      structured['data'] = data;
    }

    let indent = 0;
    if (typeof this.config.prettyJSON === 'number') {
      indent = this.config.prettyJSON;
    } else if (this.config.prettyJSON === true) {
      indent = 2;
    }

    const formatted = JSON.stringify(structured, null, indent);
    return { formatted, raw: message, structured };
  }

  private getProjectName(): string | null {
    // First check if project name is set in context
    if (this.context['projectName']) {
      return this.context['projectName'] as string;
    }

    // Then check config
    if (this.config.projectName) {
      return this.config.projectName;
    }

    // Then check environment variables (Node.js only)
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env['LOGHORN_PROJECT_NAME'] ||
        process.env['PROJECT_NAME'] ||
        process.env['APP_NAME'] ||
        process.env['NEXT_PUBLIC_APP_NAME'] ||
        process.env['VITE_APP_NAME'] ||
        process.env['REACT_APP_NAME'] ||
        process.env['npm_package_name'] ||
        null
      );
    }

    return null;
  }

  private getConsoleMethod(level: LogLevel): ConsoleMethod {
    if (level === 'error') return 'error';
    if (level === 'warn') return 'warn';
    if (level === 'debug') return 'debug';
    return 'log';
  }

  private logToBrowserConsole(
    level: LogLevel,
    message: string,
    data?: unknown,
    logConfig?: any,
  ): void {
    try {
      const consoleMethod = this.getConsoleMethod(level);
      const { formatted } = this.formatMessage(level, message, {
        format: 'elegant',
      });

      if (data !== undefined) {
        this.logWithData(consoleMethod, formatted, data, logConfig);
      } else {
        this.logWithoutData(consoleMethod, formatted, logConfig);
      }
    } catch (error) {
      // Fallback to simple logging if browser console fails
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  private logWithData(
    consoleMethod: ConsoleMethod,
    formatted: string,
    data: unknown,
    logConfig?: any,
  ): void {
    if (typeof console.group === 'function') {
      this.logWithGroup(consoleMethod, formatted, data, logConfig);
    } else {
      this.logWithoutGroup(consoleMethod, formatted, data, logConfig);
    }
  }

  private logWithGroup(
    consoleMethod: ConsoleMethod,
    formatted: string,
    data: unknown,
    logConfig?: any,
  ): void {
    let groupStyle = '';
    if (logConfig?.color && this.config.enableColors) {
      groupStyle = `color: ${this.colorManager.getCSSColor(logConfig.color)}; font-weight: bold;`;
    }
    console.group(`%c${formatted}`, groupStyle);
    console[consoleMethod](data);
    console.groupEnd();
  }

  private logWithoutGroup(
    consoleMethod: ConsoleMethod,
    formatted: string,
    data: unknown,
    logConfig?: any,
  ): void {
    if (logConfig?.color && this.config.enableColors) {
      console[consoleMethod](
        `%c${formatted}`,
        `color: ${this.colorManager.getCSSColor(logConfig.color)}; font-weight: bold;`,
      );
    } else {
      console[consoleMethod](formatted);
    }
    console[consoleMethod](data);
  }

  private logWithoutData(
    consoleMethod: ConsoleMethod,
    formatted: string,
    logConfig?: any,
  ): void {
    if (logConfig?.color && this.config.enableColors) {
      console[consoleMethod](
        `%c${formatted}`,
        `color: ${this.colorManager.getCSSColor(logConfig.color)}; font-weight: bold;`,
      );
    } else {
      console[consoleMethod](formatted);
    }
  }

  private logToNodeConsole(
    level: LogLevel,
    message: string,
    data?: unknown,
    logConfig?: any,
  ): void {
    try {
      const consoleMethod = this.getConsoleMethod(level);

      // Use unified formatting system
      const { formatted } = this.formatMessage(level, message, {
        format: 'elegant',
      });

      if (data !== undefined) {
        // Apply colors to the entire message if enabled
        if (logConfig?.color && this.config.enableColors) {
          const coloredMessage = this.colorManager.colorize(
            formatted,
            logConfig.color,
          );
          console[consoleMethod](coloredMessage);
        } else {
          console[consoleMethod](formatted);
        }
        // Log data separately for better formatting
        console[consoleMethod](data);
      } else if (logConfig?.color && this.config.enableColors) {
        // Apply colors to the entire message if enabled
        const coloredMessage = this.colorManager.colorize(
          formatted,
          logConfig.color,
        );
        console[consoleMethod](coloredMessage);
      } else {
        console[consoleMethod](formatted);
      }
    } catch (error) {
      // Fallback to simple logging if console fails
      console.log(`[${level.toUpperCase()}] ${message}`, data);
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
      } else if (this.config.enableColors) {
        // Apply colors to JSON output if enabled
        const logConfig = this.config.logLevels[level];
        const coloredJson = this.colorManager.colorize(
          jsonString,
          logConfig?.color || 'log',
        );
        console.log(coloredJson);
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

    // Choose output format based on configuration and environment
    if (this.config.enableJSON) {
      this.logToJSON(level, message, data);
    } else if (this.config.environment === 'production') {
      // Production: Use structured format for log aggregation
      this.logToStructured(level, message, data);
    } else {
      // Development: Use elegant console output
      this.logToConsole(level, message, data);
    }
  }

  private logToStructured(level: LogLevel, message: string, data?: unknown): void {
    try {
      const { formatted } = this.formatMessage(level, message, {
        format: 'structured',
        data,
      });
      console.log(formatted);
    } catch (error) {
      // Fallback to simple logging if structured formatting fails
      console.log(`[${level.toUpperCase()}] ${message}`, data);
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

  private executeGroupWithNativeSupport(
    label: string,
    fn: () => void | Promise<void>,
    collapsed: boolean,
    context: LogContext,
  ): void {
    if (collapsed && typeof console.groupCollapsed === 'function') {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }

    const originalContext = { ...this.context };
    this.setContext({ ...this.context, ...context });

    try {
      const result = fn();
      if (result instanceof Promise) {
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
        this.setContext(originalContext);
        console.groupEnd();
      }
    } catch (error: unknown) {
      this.setContext(originalContext);
      console.groupEnd();
      throw error;
    }
  }

  private executeGroupWithFallback(
    label: string,
    fn: () => void | Promise<void>,
    context: LogContext,
  ): void {
    const indent = this.getGroupIndentation();
    const groupContext = { ...this.context, ...context };

    this.setContext(groupContext);
    this.info(`${indent}📦 ${label}`);

    try {
      const result = fn();
      if (result instanceof Promise) {
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
            this.info(`${indent}📦 End: ${label}`);
          });
      } else {
        this.setContext({ ...this.context });
        this.info(`${indent}📦 End: ${label}`);
      }
    } catch (error: unknown) {
      this.setContext({ ...this.context });
      this.info(`${indent}📦 End: ${label}`);
      throw error;
    }
  }

  // Group logging for better organization
  group(
    label: string,
    fn: () => void | Promise<void>,
    options?: { collapsed?: boolean; context?: LogContext },
  ): void {
    const { collapsed = false, context = {} } = options || {};

    if (typeof console !== 'undefined' && typeof console.group === 'function') {
      this.executeGroupWithNativeSupport(label, fn, collapsed, context);
    } else {
      this.executeGroupWithFallback(label, fn, context);
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
  async groupAsync<T>(
    label: string,
    fn: () => Promise<T>,
    options?: { collapsed?: boolean; context?: LogContext },
  ): Promise<T> {
    const { collapsed = false, context = {} } = options || {};

    if (typeof console !== 'undefined' && typeof console.group === 'function') {
      return this.executeAsyncGroupWithNativeSupport(label, fn, collapsed, context);
    } else {
      return this.executeAsyncGroupWithFallback(label, fn, context);
    }
  }

  private async executeAsyncGroupWithNativeSupport<T>(
    label: string,
    fn: () => Promise<T>,
    collapsed: boolean,
    context: LogContext,
  ): Promise<T> {
    if (collapsed && typeof console.groupCollapsed === 'function') {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }

    const originalContext = { ...this.context };
    this.setContext({ ...this.context, ...context });

    try {
      const result = await fn();
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error(`Group execution failed: ${errorMessage}`, error);
      throw error;
    } finally {
      this.setContext(originalContext);
      console.groupEnd();
    }
  }

  private async executeAsyncGroupWithFallback<T>(
    label: string,
    fn: () => Promise<T>,
    context: LogContext,
  ): Promise<T> {
    const indent = this.getGroupIndentation();
    const groupContext = { ...this.context, ...context };

    this.setContext(groupContext);
    this.info(`${indent}📦 ${label}`);

    try {
      const result = await fn();
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error(`${indent}  ❌ Group execution failed: ${errorMessage}`, error);
      throw error;
    } finally {
      this.setContext({ ...this.context });
      this.info(`${indent}📦 End: ${label}`);
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
        const { formatted } = this.formatMessage('info', `📊 ${label}`, {
          format: 'elegant',
        });
        const coloredMessage = this.colorManager.colorize(
          formatted,
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
      const { formatted } = this.formatMessage('info', `📊 ${label}`, {
        format: 'elegant',
      });
      const coloredMessage = this.colorManager.colorize(
        formatted,
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

  private collectTableKeys(objects: Record<string, unknown>[]): string[] {
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
      return [];
    }

    // Safety check: limit number of columns
    const MAX_COLUMNS = 20;
    if (keys.length > MAX_COLUMNS) {
      console.log(
        `(too many columns: ${keys.length}, showing first ${MAX_COLUMNS})`,
      );
      keys.splice(MAX_COLUMNS);
    }

    return keys;
  }

  private calculateColumnWidths(
    keys: string[],
    objects: Record<string, unknown>[],
  ): Record<string, number> {
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

    return columnWidths;
  }

  private printObjectTable(objects: Record<string, unknown>[]): void {
    try {
      const keys = this.collectTableKeys(objects);
      if (keys.length === 0) {
        console.log('(empty objects)');
        return;
      }

      const columnWidths = this.calculateColumnWidths(keys, objects);

      // Print header
      this.printTableHeader(keys, columnWidths);

      // Print rows
      for (const item of objects) {
        try {
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
      // For non-objects, use proper string conversion
      const str = this.convertToString(value);
      const MAX_STRING_LENGTH = 100;
      return str.length > MAX_STRING_LENGTH
        ? str.substring(0, MAX_STRING_LENGTH) + '...'
        : str;
    } catch (error) {
      return '[ERROR]';
    }
  }

  private convertToString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'function') return '[Function]';
    // For any other type, use JSON.stringify with a replacer function
    return JSON.stringify(value, (_, val) => {
      if (typeof val === 'function') return '[Function]';
      if (typeof val === 'symbol') return '[Symbol]';
      return val;
    });
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
