import { LogLevel } from '../config';
import { appName, messageTemplate } from '../constants';
import { generateUuid } from '../utils';

interface CLEF {
  Timestamp: Date;
  MessageTemplate: string;
  Level: LogLevel;
  Properties: object;
}

/**
 * Log Entry for build Log
 */
export class LogEntry {
  EventId: string = generateUuid();
  Timestamp = new Date(Date.now());
  Properties: unknown;
  Label: string | unknown;
  Level: LogLevel;
  Tags?: string[];
  Exception?: unknown;
  MessageTemplate: string = String(messageTemplate);
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
    this.MessageTemplate = String(messageTemplate);
    this.LogUuid = logUuid ?? '';
  }

  buildLog(): CLEF {
    return {
      Timestamp: this.Timestamp,
      Level: this.Level,
      MessageTemplate: this.MessageTemplate,
      Properties: {
        Application: appName,
        Env: process.env.NODE_ENV,
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
