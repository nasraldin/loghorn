/**
 * Log Level.
 *
 * Using powers of 2 for bitwise operations.
 *
 * { Verbose, Debug, Info, Warning, Error, Fatal }
 */
export enum LogLevel {
  Error = 1,
  Warn = 2,
  Info = 4,
  Log = 8,
  Debug = 16,
  Trace = 32,
}

/**
 * Log Publisher
 *
 * { Console, Browser, File }
 */
export enum LogPublisherType {
  Console = 'console',
  Browser = 'browser',
  File = 'file',
}

export const DefaultLabelColors: Record<LogLevel, string> = {
  [LogLevel.Trace]: '#e42c64',
  [LogLevel.Debug]: '#00BFFE',
  [LogLevel.Info]: '#1ee3cf',
  [LogLevel.Warn]: '#FF6419',
  [LogLevel.Error]: '#F1062D',
  [LogLevel.Log]: '#000000',
};

export const DefaultConsoleColors: Record<LogLevel, string> & {
  Default: string;
} = {
  [LogLevel.Trace]: '\x1b[31m',
  [LogLevel.Debug]: '\x1b[34m',
  [LogLevel.Info]: '\x1b[32m',
  [LogLevel.Log]: '\x1b[0m',
  [LogLevel.Warn]: '\x1b[35m',
  [LogLevel.Error]: '\x1b[31m',
  Default: '\x1b[0m',
};

export const DefaultEmojis: Record<LogLevel, string> = {
  [LogLevel.Trace]: '🤿', // 🔍
  [LogLevel.Debug]: '🐞',
  [LogLevel.Info]: '✔', // 🔔
  [LogLevel.Log]: '📝',
  [LogLevel.Warn]: '🙄', // ⚠️
  [LogLevel.Error]: '😱', // 🚨
};

export function getColor(level: LogLevel): string {
  return DefaultLabelColors[level] || '#000000';
}

let cachedLogLevel: LogLevel | null = null;

export function getLogLevel(): LogLevel {
  if (cachedLogLevel === null) {
    const envLogLevel =
      process.env?.LOG_LEVEL?.toLowerCase() ||
      process.env?.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase();
    switch (envLogLevel) {
      case 'debug':
        cachedLogLevel = LogLevel.Debug;
        break;
      case 'error':
        cachedLogLevel = LogLevel.Error;
        break;
      case 'info':
        cachedLogLevel = LogLevel.Info;
        break;
      case 'log':
        cachedLogLevel = LogLevel.Log;
        break;
      case 'trace':
        cachedLogLevel = LogLevel.Trace;
        break;
      case 'warn':
        cachedLogLevel = LogLevel.Warn;
        break;
      default:
        cachedLogLevel = LogLevel.Info;
    }
  }
  return cachedLogLevel;
}

export function isLogLevelEnabled(
  messageLevel: LogLevel,
  configuredLevel: LogLevel,
): boolean {
  return messageLevel <= configuredLevel;
}

let browserStyles: string[] | null = null;

export function getBrowserStyles(): string[] {
  if (browserStyles === null) {
    browserStyles = ['font-size: 1.1em', 'font-weight: 600', 'padding: 3px 6px'];
  }
  return browserStyles;
}
