import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import type { Logger } from '../core/logger';
import type { MiddlewareOptions } from '../types';

export interface ExpressRequest extends Request {
  loghorn?: {
    requestId: string;
    startTime: number;
    context: Record<string, unknown>;
  };
}

export interface ExpressResponse extends Response {
  loghorn?: {
    requestId: string;
    endTime: number;
    statusCode: number;
  };
}

export function createLoggingMiddleware(
  logger: Logger,
  options: MiddlewareOptions = {},
): (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => void {
  const {
    logRequests = true,
    logResponses = true,
    logErrors = true,
    excludePaths = [],
    customFormat,
  } = options;

  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    // Skip logging for excluded paths
    if (excludePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const requestId = uuidv4();
    const startTime = Date.now();

    // Add loghorn context to request
    req.loghorn = {
      requestId,
      startTime,
      context: {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
      },
    };

    // Set context for this request
    logger.setContext({
      requestId,
      method: req.method,
      url: req.url,
    });

    // Log request if enabled
    if (logRequests) {
      logger.info(`📥 ${req.method} ${req.url}`, {
        requestId,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        headers: req.headers,
      });
    }

    // Override res.end to capture response data
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Add loghorn context to response
      res.loghorn = {
        requestId,
        endTime,
        statusCode: res.statusCode,
      };

      // Log response if enabled
      if (logResponses) {
        const statusEmoji =
          res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
        logger.info(
          `${statusEmoji} ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
          {
            requestId,
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('Content-Length'),
          },
        );
      }

      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };

    // Handle errors
    if (logErrors) {
      res.on('error', (error: Error) => {
        logger.error(`💥 Error in ${req.method} ${req.url}`, {
          requestId,
          error: error.message,
          stack: error.stack,
        });
      });
    }

    // Custom format if provided
    if (customFormat) {
      customFormat(req, res, next);
    } else {
      next();
    }
  };
}

export function createMorganMiddleware(logger: Logger) {
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const morgan = require('morgan');

    const morganMiddleware = morgan(
      (tokens: any, req: ExpressRequest, res: ExpressResponse) => {
        const requestId = req.loghorn?.requestId || 'unknown';
        const method = tokens.method(req, res);
        const url = tokens.url(req, res);
        const status = tokens.status(req, res);
        const responseTime = tokens['response-time'](req, res);

        return `${method} ${url} ${status} ${responseTime}ms [${requestId}]`;
      },
      {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          },
        },
      },
    );

    return morganMiddleware(req, res, next);
  };
}
