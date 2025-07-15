import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import { v4 as uuidv4 } from 'uuid';

import type { Logger } from '../core/logger';
import type { MiddlewareOptions } from '../types';

export interface FastifyLoghornOptions extends MiddlewareOptions {}

export function fastifyLoghorn(
  fastify: FastifyInstance,
  logger: Logger,
  options: FastifyLoghornOptions = {},
) {
  const {
    logRequests = true,
    logResponses = true,
    logErrors = true,
    excludePaths = [],
    customFormat,
  } = options;

  fastify.addHook(
    'onRequest',
    (
      request: FastifyRequest,
      _reply: FastifyReply,
      done: HookHandlerDoneFunction,
    ) => {
      if (excludePaths.some((path) => request.url.startsWith(path))) {
        return done();
      }
      const requestId = uuidv4();
      (request as any).loghorn = { requestId, startTime: Date.now() };
      logger.setContext({
        requestId,
        method: request.method,
        url: request.url,
      });
      if (logRequests) {
        logger.info(`📥 ${request.method} ${request.url}`, {
          requestId,
          headers: request.headers,
          ip: request.ip,
        });
      }
      done();
    },
  );

  fastify.addHook(
    'onResponse',
    (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction,
    ) => {
      const loghorn = (request as any).loghorn;
      if (!loghorn) return done();
      const { requestId, startTime } = loghorn;
      const duration = Date.now() - startTime;
      if (logResponses) {
        const statusEmoji =
          reply.statusCode >= 400 ? '❌' : reply.statusCode >= 300 ? '⚠️' : '✅';
        logger.info(
          `${statusEmoji} ${request.method} ${request.url} - ${reply.statusCode} (${duration}ms)`,
          {
            requestId,
            statusCode: reply.statusCode,
            duration,
            contentLength: reply.getHeader('content-length'),
          },
        );
      }
      done();
    },
  );

  fastify.addHook(
    'onError',
    (
      request: FastifyRequest,
      _reply: FastifyReply,
      error: Error,
      done: HookHandlerDoneFunction,
    ) => {
      const loghorn = (request as any).loghorn;
      const requestId = loghorn?.requestId || 'unknown';
      if (logErrors) {
        logger.error(`💥 Error in ${request.method} ${request.url}`, {
          requestId,
          error: error.message,
          stack: error.stack,
        });
      }
      done();
    },
  );

  // Custom format hook (optional)
  if (customFormat) {
    fastify.addHook(
      'onSend',
      (
        request: FastifyRequest,
        reply: FastifyReply,
        _payload: any,
        done: HookHandlerDoneFunction,
      ) => {
        customFormat(request as any, reply as any, done);
      },
    );
  }
}
