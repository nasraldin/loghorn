/**
 * @fileoverview loghorn
 * A robust and type-safe logger for Node.js applications
 * with support for environment-specific configs.
 * Compatible with both Backend and Frontend environments.
 *
 * Features:
 * - Environment-specific configuration management
 * - Performance optimization
 * - TypeScript support
 * - Comprehensive error handling
 *
 * @module loghorn
 * @author Nasr Aldin <ns@nasraldin.com>
 * @copyright 2024 Nasr Aldin
 * @license MIT
 * @version 1.0.0
 *
 * @see {@link https://github.com/nasraldin/loghorn|GitHub Repository}
 * @see {@link https://www.npmjs.com/package/loghorn|NPM Package}
 */

import {
  DefaultConsoleColors,
  DefaultEmojis,
  getBrowserStyles,
  getColor,
  getLogLevel,
  isLogLevelEnabled,
  LogLevel,
  LogPublisherType,
} from './config';
import {
  appName,
  isLoggerEnabled,
  isMiddlewareEnabled,
  logUuidCookieKey,
  writeLogsTo,
  writeLogsToSeq,
} from './constants';
import { LogEntry, SeqLog } from './publisher';
import { isBrowser, safeArrayConversion } from './utils';

interface LogMessage {
  label?: string | unknown;
  data: unknown[];
  styles?: string;
  timestamp?: string;
  logUuid?: string | null;
}

const writeLogToSeq = (level: LogLevel, msg: LogMessage) => {
  if (!writeLogsToSeq) return;

  delete msg.styles;
  delete msg.timestamp;

  const entry: LogEntry = new LogEntry(msg, msg.label, level, msg.logUuid);
  new SeqLog().log(entry);
};

export const logWrite = ({
  level,
  label,
  isMiddleware = false,
  ...args
}: {
  level: LogLevel;
  label?: string | unknown;
  isMiddleware?: boolean;
  data: unknown[];
}) => {
  try {
    if (
      !isLoggerEnabled ||
      (isMiddleware && !isMiddlewareEnabled) ||
      !isLogLevelEnabled(level, getLogLevel())
    )
      return;

    const logUuid = isBrowser
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith(logUuidCookieKey))
          ?.split('=')[1]
      : '';
    const timestamp = new Date().toISOString();

    const metaInfo = {
      app: appName,
      env: process.env.NODE_ENV,
      logUuid,
      timestamp,
    };

    const emoji = DefaultEmojis[level];
    const message = `${LogLevel[level]} ${metaInfo.app ? `[${metaInfo.app}]` : ''} [${metaInfo.env}] at ${timestamp}`;
    const browserStyle = `color: ${getColor(level)}; ${getBrowserStyles().join(';')}`;
    const terminalColor = DefaultConsoleColors[level];

    const log: LogMessage = {
      label: label ? String(label) : undefined,
      data: args.data,
      logUuid,
      timestamp,
    };

    const consoleMethod =
      level === LogLevel.Error
        ? console.error
        : level === LogLevel.Warn
          ? console.warn
          : level === LogLevel.Debug
            ? console.debug
            : level === LogLevel.Trace
              ? console.trace
              : console.log;

    if (!isBrowser && writeLogsTo.includes(LogPublisherType.Console)) {
      consoleMethod(
        `${terminalColor}${emoji} ${message}${DefaultConsoleColors.Default}`,
        log.label ? `\n${log.label}` : '',
        ...(Array.isArray(log?.data) ? log.data : [log?.data]),
      );
    }

    if (isBrowser && writeLogsTo.includes(LogPublisherType.Browser)) {
      consoleMethod(
        `%c${emoji} ${message}`,
        browserStyle,
        log.label ? `\n${log.label}` : '',
        ...(Array.isArray(log?.data) ? log.data : [log?.data]),
      );
    }

    writeLogToSeq(level, log);

    // if (process.env.NEXT_PUBLIC_WRITE_LOGS_TO.includes(LogPublisherType.File)) {
    //   writeLogToFile(level, log);
    // }
  } catch (err) {
    console.error(err);
  }
};

/**
 * App Custom logger.
 */
export function log(
  labelOrMsg: string | unknown,
  args?: unknown,
  options: { isMiddleware?: boolean } = {},
) {
  const { isMiddleware = false } = options;
  const data = safeArrayConversion(args);

  logWrite({
    level: LogLevel.Log,
    isMiddleware,
    label: labelOrMsg,
    data,
  });
}

export function info(
  labelOrMsg: string | unknown,
  args?: unknown,
  options: { isMiddleware?: boolean } = {},
) {
  const { isMiddleware = false } = options;
  const data = safeArrayConversion(args);

  logWrite({
    level: LogLevel.Info,
    isMiddleware,
    label: labelOrMsg,
    data,
  });
}

export function debug(
  labelOrMsg: string | unknown,
  args?: unknown,
  options: { isMiddleware?: boolean } = {},
) {
  const { isMiddleware = false } = options;
  const data = safeArrayConversion(args);

  logWrite({
    level: LogLevel.Debug,
    isMiddleware,
    label: labelOrMsg,
    data,
  });
}

export function error(
  labelOrMsg: string | unknown,
  args?: unknown,
  options: { isMiddleware?: boolean } = {},
) {
  const { isMiddleware = false } = options;
  const data = safeArrayConversion(args);

  logWrite({
    level: LogLevel.Error,
    isMiddleware,
    label: labelOrMsg,
    data,
  });
}

export function warn(
  labelOrMsg: string | unknown,
  args?: unknown,
  options: { isMiddleware?: boolean } = {},
) {
  const { isMiddleware = false } = options;
  const data = safeArrayConversion(args);

  logWrite({
    level: LogLevel.Warn,
    isMiddleware,
    label: labelOrMsg,
    data,
  });
}

export function trace(
  labelOrMsg: string | unknown,
  args?: unknown,
  options: { isMiddleware?: boolean } = {},
) {
  const { isMiddleware = false } = options;
  const data = safeArrayConversion(args);

  logWrite({
    level: LogLevel.Trace,
    isMiddleware,
    label: labelOrMsg,
    data,
  });
}

export class ILoggerService {
  private createLogMethod(level: LogLevel) {
    return (
      labelOrMsg: string,
      args?: unknown,
      options?: { isMiddleware?: boolean },
    ) =>
      logWrite({
        level,
        label: labelOrMsg,
        data: safeArrayConversion(args),
        isMiddleware: options?.isMiddleware,
      });
  }

  log = this.createLogMethod(LogLevel.Log);
  info = this.createLogMethod(LogLevel.Info);
  debug = this.createLogMethod(LogLevel.Debug);
  error = this.createLogMethod(LogLevel.Error);
  warn = this.createLogMethod(LogLevel.Warn);
}
