import { siteConfig } from '@config';
import { env } from '@environment';
import { v1 as uuid } from 'uuid';

import { LogLevel } from '../config';

interface CLEF {
  Timestamp: Date;
  MessageTemplate: string;
  Level: LogLevel;
  Properties: object;
}

const LOG_MESSAGE_TEMPLATE =
  '{@Application} v{@AppVersion} {@Env} {@LogLevel} by {@User} at {Timestamp} {Label}';

/**
 * Log Entry for build Log
 */
export class LogEntry {
  EventId: string = uuid();
  Timestamp = new Date(Date.now());
  Properties: unknown;
  Label: string | unknown;
  Level: LogLevel;
  Tags?: string[];
  Exception?: unknown;
  MessageTemplate: string = LOG_MESSAGE_TEMPLATE;
  LogUuid?: string | null;

  constructor(
    properties: unknown,
    label?: string | unknown,
    level?: LogLevel,
    logUuid?: string | null,
    exception?: unknown,
    messageTemplate?: string,
    tags?: string[],
  ) {
    this.Properties = properties;
    this.Label = label ?? '';
    this.Level = level ?? LogLevel.Info;
    this.Tags = tags;
    this.Exception = exception;
    this.MessageTemplate = messageTemplate ?? LOG_MESSAGE_TEMPLATE;
    this.LogUuid = logUuid ?? '';
  }

  buildLog(): CLEF {
    return {
      Timestamp: this.Timestamp,
      Level: this.Level,
      MessageTemplate: this.MessageTemplate,
      Properties: {
        AppId: siteConfig.appId,
        Application: siteConfig.appName.en,
        AppVersion: siteConfig.appVersion,
        Env: env.NODE_ENV,
        EventId: this.EventId,
        LogLevel: this.Level,
        User: 'SYSTEM',
        Timestamp: this.Timestamp,
        Tags: this.Tags,
        Exception: this.Exception,
        Label: this.Label,
        LogUuid: this.LogUuid,
        Data: JSON.stringify(this.Properties),
      },
    };
  }
}
