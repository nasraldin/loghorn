import type { Request, Response, NextFunction } from "express";

export type LogLevel = "debug" | "info" | "warn" | "error" | "trace" | "log";

export type Environment = "development" | "production" | "test" | "staging";

export interface LogConfig {
  level: LogLevel;
  color: string;
  emoji: string;
  enabled: boolean;
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
  middleware?: {
    enabled: boolean;
    logRequests: boolean;
    logResponses: boolean;
    logErrors: boolean;
    excludePaths?: string[];
  };
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  stack?: string;
  context?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  sessionId?: string;
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  groupDepth?: number;
  [key: string]: unknown;
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
  customFormat?: (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => void;
}

export interface BrowserLoggerConfig extends Omit<LoggerConfig, "middleware"> {
  enableConsoleMethods: boolean;
  enableGrouping: boolean;
  maxGroupDepth: number;
}

export interface NestJSLoggerConfig extends LoggerConfig {
  enableDecorators: boolean;
  enableInterceptors: boolean;
  enableGuards: boolean;
}

export interface ReactLoggerConfig extends BrowserLoggerConfig {
  enableComponentLogging: boolean;
  enableHookLogging: boolean;
  enableStateLogging: boolean;
}

export interface VueLoggerConfig extends BrowserLoggerConfig {
  enableComponentLogging: boolean;
  enableLifecycleLogging: boolean;
  enableReactivityLogging: boolean;
}

export interface AngularLoggerConfig extends BrowserLoggerConfig {
  enableComponentLogging: boolean;
  enableServiceLogging: boolean;
  enableGuardLogging: boolean;
}

export interface NextJSLoggerConfig extends BrowserLoggerConfig {
  enableSSRLogging: boolean;
  enableAPILogging: boolean;
  enablePageLogging: boolean;
}

export interface GroupOptions {
  collapsed?: boolean;
  context?: LogContext;
}

export interface AsyncGroupOptions {
  collapsed?: boolean;
  context?: LogContext;
}

// Re-export Express types for convenience
export type { Request, Response, NextFunction };
