import type { LogLevel } from '../types';
import { EdgeColorManager } from '../utils/edge-colors';
import { Logger } from './logger';

export class EdgeLogger extends Logger {
  // Override to use Edge Runtime compatible methods
  override log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    // Fire-and-forget async operations to maintain void return type
    if (this.config.enableJSON) {
      this.logToJSONEdge(level, message, data).catch(console.error);
    } else {
      this.logToConsoleEdge(level, message, data).catch(console.error);
    }
  }

  private async logToJSONEdge(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): Promise<void> {
    try {
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context: { ...this.context },
        ...(data !== undefined && { data }),
      };
      const jsonString = await this.stringifyEdge(entry);
      console.log(jsonString, data);
    } catch (error) {
      // Fallback to basic logging
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  private async logToConsoleEdge(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): Promise<void> {
    try {
      const formatted = await this.formatMessageEdge(level, message);
      console.log(formatted, data);
    } catch (error) {
      // Fallback to basic logging
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  }

  private async stringifyEdge(obj: unknown): Promise<string> {
    return new Promise((resolve) => {
      // Use setTimeout with 0 delay for Edge Runtime compatibility
      setTimeout(() => {
        try {
          resolve(JSON.stringify(obj, null, this.config.prettyJSON ? 2 : 0));
        } catch {
          resolve('{"error": "Serialization failed"}');
        }
      }, 0);
    });
  }

  private async formatMessageEdge(
    level: LogLevel,
    message: string,
  ): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Use Edge Runtime optimized color handling
          const formatted = this.formatMessage(level, message).formatted;
          resolve(formatted);
        } catch {
          resolve(`[${level.toUpperCase()}] ${message}`);
        }
      }, 0);
    });
  }

  // Override the color manager to use Edge Runtime optimized version
  protected createColorManager(): EdgeColorManager {
    return new EdgeColorManager({
      enableColors: this.config.enableColors,
      customColors: this.config.customColors || {},
      forcePlainText: false,
    });
  }

  // Override convenience methods to be async
  override debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  override info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  override warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  override error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  override trace(message: string, data?: unknown): void {
    this.log('trace', message, data);
  }

  override logMessage(message: string, data?: unknown): void {
    this.log('log', message, data);
  }

  // Convenience methods for common logging patterns
  override success(message: string, data?: unknown): void {
    this.info(`✅ ${message}`, data);
  }

  override failure(message: string, data?: unknown): void {
    this.error(`❌ ${message}`, data);
  }

  override start(message: string, data?: unknown): void {
    this.info(`🚀 ${message}`, data);
  }

  override end(message: string, data?: unknown): void {
    this.info(`🏁 ${message}`, data);
  }

  // Edge Runtime specific methods
  async request(req: Request, data?: unknown): Promise<void> {
    this.setContext({ type: 'request', url: req.url, method: req.method });
    this.info('Request received', data);
  }

  async response(res: Response, data?: unknown): Promise<void> {
    this.setContext({ type: 'response', status: res.status });
    this.info('Response sent', data);
  }

  async middleware(name: string, data?: unknown): Promise<void> {
    this.setContext({ type: 'middleware', name });
    this.info(`Middleware: ${name}`, data);
  }

  async route(route: string, data?: unknown): Promise<void> {
    this.setContext({ type: 'route', route });
    this.info(`Route: ${route}`, data);
  }

  async serverComponent(component: string, data?: unknown): Promise<void> {
    this.setContext({ type: 'server-component', component });
    this.info(`Server Component: ${component}`, data);
  }

  async clientComponent(component: string, data?: unknown): Promise<void> {
    this.setContext({ type: 'client-component', component });
    this.info(`Client Component: ${component}`, data);
  }

  async staticGeneration(page: string, data?: unknown): Promise<void> {
    this.setContext({ type: 'static-generation', page });
    this.info(`Static Generation: ${page}`, data);
  }

  async revalidation(path: string, data?: unknown): Promise<void> {
    this.setContext({ type: 'revalidation', path });
    this.info(`Revalidation: ${path}`, data);
  }

  async cache(
    operation: 'hit' | 'miss' | 'set',
    key: string,
    data?: unknown,
  ): Promise<void> {
    this.setContext({ type: 'cache', operation, key });
    this.info(`Cache ${operation}: ${key}`, data);
  }
}
