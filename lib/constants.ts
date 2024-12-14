import { isBoolean } from './utils';

export const appName =
  process.env?.LOG_APP_NAME || process.env?.NEXT_PUBLIC_LOG_APP_NAME;

export const messageTemplate =
  process.env?.LOG_MESSAGE_TEMPLATE ||
  process.env?.NEXT_PUBLIC_LOG_MESSAGE_TEMPLATE ||
  '{@LogLevel} {@Application} {@Env} at {Timestamp}';

export const writeLogsTo =
  process.env?.WRITE_LOGS_TO || process.env?.NEXT_PUBLIC_WRITE_LOGS_TO || 'console';

export const LogEnv = process.env?.NODE_ENV?.toLowerCase() || 'development';

export const envLogLevel =
  process.env?.LOG_LEVEL?.toLowerCase() ||
  process.env?.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase() ||
  'trace';

export const logUuidCookieKey =
  process.env?.LOG_UUID_COOKIE_KEY ||
  process.env?.NEXT_PUBLIC_LOG_UUID_COOKIE_KEY ||
  'logUuid';

export const isLoggerEnabled = isBoolean(
  process.env?.ENABLE_LOGS || process.env?.NEXT_PUBLIC_ENABLE_LOGS,
);

export const isMiddlewareEnabled = isBoolean(
  process.env?.MIDDLEWARE_LOGS || process.env?.NEXT_PUBLIC_MIDDLEWARE_LOGS,
);

export const writeLogsToSeq = isBoolean(
  process.env?.WRITE_LOGS_TO_SEQ || process.env?.NEXT_PUBLIC_WRITE_LOGS_TO_SEQ,
);

export const seqUrl =
  process.env?.SEQ_URL || process.env?.NEXT_PUBLIC_SEQ_URL || '';

export const seqApiKey =
  process.env?.SEQ_API_KEY || process.env?.NEXT_PUBLIC_SEQ_API_KEY || '';
