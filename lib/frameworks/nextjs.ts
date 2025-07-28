import { Logger } from '../core/logger';
import type { LogContext, NextJSLoggerConfig } from '../types';

export class NextJSLogger extends Logger {
  private enableSSRLogging: boolean;
  private enableAPILogging: boolean;
  private enablePageLogging: boolean;
  private readonly enableConsoleMethods: boolean;
  private readonly enableGrouping: boolean;
  private readonly maxGroupDepth: number;
  private enableAppRouterLogging: boolean;
  private enableServerComponents: boolean;
  private enableClientComponents: boolean;
  private enableStreaming: boolean;
  private enableSuspense: boolean;
  private enableParallelRoutes: boolean;
  private enableInterceptingRoutes: boolean;

  constructor(config: NextJSLoggerConfig) {
    super(config);
    this.enableSSRLogging = config.enableSSRLogging ?? true;
    this.enableAPILogging = config.enableAPILogging ?? true;
    this.enablePageLogging = config.enablePageLogging ?? true;
    this.enableConsoleMethods = config.enableConsoleMethods ?? true;
    this.enableGrouping = config.enableGrouping ?? true;
    this.maxGroupDepth = config.maxGroupDepth ?? 10;
    this.enableAppRouterLogging = config.enableAppRouterLogging ?? true;
    this.enableServerComponents = config.enableServerComponents ?? true;
    this.enableClientComponents = config.enableClientComponents ?? true;
    this.enableStreaming = config.enableStreaming ?? true;
    this.enableSuspense = config.enableSuspense ?? true;
    this.enableParallelRoutes = config.enableParallelRoutes ?? true;
    this.enableInterceptingRoutes = config.enableInterceptingRoutes ?? true;
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
    if (this.enableAppRouterLogging) {
      this.setContext({ type: 'route' });
      this.info(`[ROUTE] ${message}`, data);
    }
  }

  middleware(message: string, data?: unknown): void {
    if (this.enableAppRouterLogging) {
      this.setContext({ type: 'middleware' });
      this.info(`[MIDDLEWARE] ${message}`, data);
    }
  }

  // Next.js 15 App Router specific methods
  serverComponent(componentName: string, message: string, data?: unknown): void {
    if (this.enableServerComponents) {
      this.setContext({
        type: 'server-component',
        componentName,
        renderMode: 'server',
      });
      this.info(`[SERVER_COMPONENT] ${componentName}: ${message}`, data);
    }
  }

  clientComponent(componentName: string, message: string, data?: unknown): void {
    if (this.enableClientComponents) {
      this.setContext({
        type: 'client-component',
        componentName,
        renderMode: 'client',
      });
      this.info(`[CLIENT_COMPONENT] ${componentName}: ${message}`, data);
    }
  }

  streaming(message: string, data?: unknown): void {
    if (this.enableStreaming) {
      this.setContext({ type: 'streaming' });
      this.info(`[STREAMING] ${message}`, data);
    }
  }

  suspense(boundaryName: string, message: string, data?: unknown): void {
    if (this.enableSuspense) {
      this.setContext({
        type: 'suspense',
        boundaryName,
      });
      this.info(`[SUSPENSE] ${boundaryName}: ${message}`, data);
    }
  }

  parallelRoute(routeName: string, message: string, data?: unknown): void {
    if (this.enableParallelRoutes) {
      this.setContext({
        type: 'parallel-route',
        routeName,
      });
      this.info(`[PARALLEL_ROUTE] ${routeName}: ${message}`, data);
    }
  }

  interceptingRoute(routeName: string, message: string, data?: unknown): void {
    if (this.enableInterceptingRoutes) {
      this.setContext({
        type: 'intercepting-route',
        routeName,
      });
      this.info(`[INTERCEPTING_ROUTE] ${routeName}: ${message}`, data);
    }
  }

  // Next.js request/response logging
  request(req: any, data?: unknown): void {
    const requestId =
      req.headers?.['x-request-id'] || Math.random().toString(36).substring(2, 11);

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

    this.error(`[NEXT_ERROR] ${error.message}`, { error, stack: error.stack });
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

  // Next.js 15 App Router lifecycle methods
  layout(layoutName: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'layout',
      layoutName,
    });
    this.info(`[LAYOUT] ${layoutName}: ${message}`, data);
  }

  template(templateName: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'template',
      templateName,
    });
    this.info(`[TEMPLATE] ${templateName}: ${message}`, data);
  }

  loading(loadingName: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'loading',
      loadingName,
    });
    this.info(`[LOADING] ${loadingName}: ${message}`, data);
  }

  errorBoundary(errorName: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'error-boundary',
      errorName,
    });
    this.error(`[ERROR_BOUNDARY] ${errorName}: ${message}`, data);
  }

  notFound(notFoundName: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'not-found',
      notFoundName,
    });
    this.warn(`[NOT_FOUND] ${notFoundName}: ${message}`, data);
  }

  // Next.js 15 App Router data fetching
  dataFetch(operation: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'data-fetch',
      operation,
    });
    this.info(`[DATA_FETCH] ${operation}: ${message}`, data);
  }

  // Next.js 15 App Router metadata
  metadata(metadataType: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'metadata',
      metadataType,
    });
    this.info(`[METADATA] ${metadataType}: ${message}`, data);
  }

  // Next.js 15 App Router cookies
  cookies(operation: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'cookies',
      operation,
    });
    this.info(`[COOKIES] ${operation}: ${message}`, data);
  }

  // Next.js 15 App Router headers
  headers(operation: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'headers',
      operation,
    });
    this.info(`[HEADERS] ${operation}: ${message}`, data);
  }

  // Next.js 15 App Router redirects
  redirect(from: string, to: string, data?: unknown): void {
    this.setContext({
      type: 'redirect',
      from,
      to,
    });
    this.info(`[REDIRECT] ${from} → ${to}`, data);
  }

  // Next.js 15 App Router search params
  searchParams(
    params: Record<string, string>,
    message: string,
    data?: unknown,
  ): void {
    this.setContext({
      type: 'search-params',
      params,
    });
    this.info(`[SEARCH_PARAMS] ${message}`, data);
  }

  // Next.js 15 App Router segments
  segment(segmentName: string, message: string, data?: unknown): void {
    this.setContext({
      type: 'segment',
      segmentName,
    });
    this.info(`[SEGMENT] ${segmentName}: ${message}`, data);
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
    if (config.enableAppRouterLogging !== undefined) {
      this.enableAppRouterLogging = config.enableAppRouterLogging;
    }
    if (config.enableServerComponents !== undefined) {
      this.enableServerComponents = config.enableServerComponents;
    }
    if (config.enableClientComponents !== undefined) {
      this.enableClientComponents = config.enableClientComponents;
    }
    if (config.enableStreaming !== undefined) {
      this.enableStreaming = config.enableStreaming;
    }
    if (config.enableSuspense !== undefined) {
      this.enableSuspense = config.enableSuspense;
    }
    if (config.enableParallelRoutes !== undefined) {
      this.enableParallelRoutes = config.enableParallelRoutes;
    }
    if (config.enableInterceptingRoutes !== undefined) {
      this.enableInterceptingRoutes = config.enableInterceptingRoutes;
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
      enableAppRouterLogging: this.enableAppRouterLogging,
      enableServerComponents: this.enableServerComponents,
      enableClientComponents: this.enableClientComponents,
      enableStreaming: this.enableStreaming,
      enableSuspense: this.enableSuspense,
      enableParallelRoutes: this.enableParallelRoutes,
      enableInterceptingRoutes: this.enableInterceptingRoutes,
    };
  }
}
