import { Logger } from '../core/logger';
import type { LogContext, NextJSLoggerConfig } from '../types';

export class NextJSLogger extends Logger {
  private enableSSRLogging: boolean;
  private enableAPILogging: boolean;
  private enablePageLogging: boolean;
  private enableConsoleMethods: boolean;
  private enableGrouping: boolean;
  private maxGroupDepth: number;

  constructor(config: NextJSLoggerConfig) {
    super(config);
    this.enableSSRLogging = config.enableSSRLogging ?? true;
    this.enableAPILogging = config.enableAPILogging ?? true;
    this.enablePageLogging = config.enablePageLogging ?? true;
    this.enableConsoleMethods = config.enableConsoleMethods ?? true;
    this.enableGrouping = config.enableGrouping ?? true;
    this.maxGroupDepth = config.maxGroupDepth ?? 10;
  }

  // Next.js specific logging methods
  ssr(message: string, data?: unknown): void {
    if (this.enableSSRLogging) {
      this.setContext({ type: 'ssr' });
      this.info(`[SSR] ${message}`, data);
    }
  }

  api(message: string, data?: unknown): void {
    if (this.enableAPILogging) {
      this.setContext({ type: 'api' });
      this.info(`[API] ${message}`, data);
    }
  }

  page(message: string, data?: unknown): void {
    if (this.enablePageLogging) {
      this.setContext({ type: 'page' });
      this.info(`[PAGE] ${message}`, data);
    }
  }

  // Next.js App Router specific methods
  route(message: string, data?: unknown): void {
    this.setContext({ type: 'route' });
    this.info(`[ROUTE] ${message}`, data);
  }

  middleware(message: string, data?: unknown): void {
    this.setContext({ type: 'middleware' });
    this.info(`[MIDDLEWARE] ${message}`, data);
  }

  // Next.js request/response logging
  request(req: any, data?: unknown): void {
    const requestId =
      req.headers?.['x-request-id'] || Math.random().toString(36).substr(2, 9);

    this.setContext({
      type: 'request',
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
    });

    this.info(`[REQUEST] ${req.method} ${req.url}`, data);
  }

  response(res: any, data?: unknown): void {
    this.setContext({
      type: 'response',
      statusCode: res.statusCode,
    });

    this.info(`[RESPONSE] ${res.statusCode}`, data);
  }

  // Next.js error handling
  nextError(error: Error, context?: LogContext): void {
    this.setContext({
      type: 'next-error',
      ...context,
    });

    this.error(`[NEXT_ERROR] ${error.message}`, error);
  }

  // Next.js performance monitoring
  performance(operation: string, duration: number, data?: unknown): void {
    this.setContext({ type: 'performance' });
    this.info(`[PERFORMANCE] ${operation} took ${duration}ms`, data);
  }

  // Next.js hydration logging
  hydration(message: string, data?: unknown): void {
    this.setContext({ type: 'hydration' });
    this.info(`[HYDRATION] ${message}`, data);
  }

  // Next.js static generation
  staticGen(message: string, data?: unknown): void {
    this.setContext({ type: 'static-gen' });
    this.info(`[STATIC_GEN] ${message}`, data);
  }

  // Next.js image optimization
  imageOpt(message: string, data?: unknown): void {
    this.setContext({ type: 'image-opt' });
    this.info(`[IMAGE_OPT] ${message}`, data);
  }

  // Next.js cache operations
  cache(message: string, data?: unknown): void {
    this.setContext({ type: 'cache' });
    this.info(`[CACHE] ${message}`, data);
  }

  // Next.js revalidation
  revalidate(message: string, data?: unknown): void {
    this.setContext({ type: 'revalidate' });
    this.info(`[REVALIDATE] ${message}`, data);
  }

  // Update configuration
  updateNextJSConfig(config: Partial<NextJSLoggerConfig>): void {
    super.updateConfig(config);

    if (config.enableSSRLogging !== undefined) {
      this.enableSSRLogging = config.enableSSRLogging;
    }
    if (config.enableAPILogging !== undefined) {
      this.enableAPILogging = config.enableAPILogging;
    }
    if (config.enablePageLogging !== undefined) {
      this.enablePageLogging = config.enablePageLogging;
    }
  }

  // Get Next.js specific configuration
  getNextJSConfig(): NextJSLoggerConfig {
    return {
      ...this.getConfig(),
      enableSSRLogging: this.enableSSRLogging,
      enableAPILogging: this.enableAPILogging,
      enablePageLogging: this.enablePageLogging,
      enableConsoleMethods: this.enableConsoleMethods,
      enableGrouping: this.enableGrouping,
      maxGroupDepth: this.maxGroupDepth,
    };
  }
}
