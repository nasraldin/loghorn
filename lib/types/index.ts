import type { NextFunction, Request, Response } from 'express';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'trace' | 'log';

export type Environment = 'development' | 'production' | 'test' | 'staging';

export interface LogConfig {
  level: LogLevel;
  color: string;
  emoji: string;
  enabled: boolean;
}

export interface PartialLogConfig {
  level?: LogLevel;
  color?: string;
  emoji?: string;
  enabled?: boolean;
}

export interface LoggerConfig {
  environment: Environment;
  logLevels: Record<LogLevel, LogConfig>;
  enableColors: boolean;
  enableEmojis: boolean;
  enableTimestamps: boolean;
  enableStackTraces: boolean;
  enableJSON: boolean;
  // Optional: pretty-print JSON logs. true = 2 spaces, number = that many spaces, false/undefined = compact
  prettyJSON?: boolean | number;
  // Optional: enable table logging. true = use console.table when available, false = custom formatting
  enableTable?: boolean;
  customColors?: Record<string, string>;
  customEmojis?: Record<string, string>;
  projectName?: string;
  // Header display options
  showEmoji?: boolean;
  showTimestamp?: boolean;
  showLevel?: boolean;
  showProjectName?: boolean;
  showHeader?: boolean; // Master switch to show/hide entire header
  middleware?: {
    enabled: boolean;
    logRequests: boolean;
    logResponses: boolean;
    logErrors: boolean;
    excludePaths?: string[];
  };
}

export interface PartialLoggerConfig extends Partial<LoggerConfig> {}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: LogContext;
  stack?: string;
}

export interface LogContext extends Record<string, unknown> {
  // Additional context properties can be added here
}

export interface ExpressRequest extends Request {
  loghorn?: {
    requestId: string;
    startTime: number;
    context: LogContext;
  };
}

export interface ExpressResponse extends Response {
  loghorn?: {
    requestId: string;
    endTime: number;
    statusCode: number;
  };
}

export interface MiddlewareOptions {
  logRequests?: boolean;
  logResponses?: boolean;
  logErrors?: boolean;
  excludePaths?: string[];
  customFormat?: (req: any, res: any, next?: any) => void;
}

// Framework-specific configurations
export interface NextJSLoggerConfig extends LoggerConfig {
  enableSSRLogging?: boolean;
  enableAPILogging?: boolean;
  enablePageLogging?: boolean;
  enableConsoleMethods?: boolean;
  enableGrouping?: boolean;
  maxGroupDepth?: number;
}

export interface GroupOptions {
  collapsed?: boolean;
  context?: LogContext;
}

export interface AsyncGroupOptions extends GroupOptions {
  // Additional options for async groups can be added here
}

// Re-export Express types for convenience
export type { Request, Response, NextFunction };
