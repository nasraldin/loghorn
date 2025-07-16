// Next.js Setup with LogHorn Logger
// TypeScript configuration and utility functions

// 2. API Route Handler (app/api/users/route.ts)
import { NextResponse, type NextRequest } from 'next/server';

import { createLogger } from '../lib';

// 1. Create a shared logger instance
export const logger = createLogger({
  environment: (process.env.NODE_ENV as any) || 'development',
  enableColors: process.env.NODE_ENV !== 'production',
  enableEmojis: process.env.NODE_ENV !== 'production',
  enableTimestamps: true,
  enableStackTraces: process.env.NODE_ENV !== 'production',
  enableJSON: process.env.NODE_ENV === 'production',
  // Override specific log levels
  logLevels: {
    debug: { enabled: process.env.NODE_ENV === 'development' },
    trace: { enabled: process.env.NODE_ENV === 'development' },
    // Other levels use defaults
  },
});

export async function GET(request: NextRequest) {
  const requestId =
    request.headers.get('x-request-id') || Math.random().toString(36).substr(2, 9);

  logger.setContext({
    requestId,
    endpoint: '/api/users',
    method: 'GET',
  });

  logger.info('GET /api/users request received', {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    logger.debug('Fetching users from database');
    const users = await fetchUsers();

    logger.success('Users fetched successfully', { count: users.length });

    return NextResponse.json(users, {
      headers: { 'x-request-id': requestId },
    });
  } catch (error) {
    logger.error('Failed to fetch users', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'x-request-id': requestId } },
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId =
    request.headers.get('x-request-id') || Math.random().toString(36).substr(2, 9);

  logger.setContext({
    requestId,
    endpoint: '/api/users',
    method: 'POST',
  });

  try {
    const body = await request.json();
    logger.info('Creating new user', { userData: body });

    const newUser = await createUser(body);
    logger.success('User created successfully', { userId: newUser.id });

    return NextResponse.json(newUser, {
      status: 201,
      headers: { 'x-request-id': requestId },
    });
  } catch (error) {
    logger.error('Failed to create user', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500, headers: { 'x-request-id': requestId } },
    );
  }
}

// 3. Middleware (middleware.ts)
export function middleware(request: NextRequest) {
  const requestId =
    request.headers.get('x-request-id') || Math.random().toString(36).substr(2, 9);

  logger.setContext({
    requestId,
    pathname: request.nextUrl.pathname,
    method: request.method,
  });

  logger.info('Middleware processing request', {
    url: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
  });

  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// 4. Utility Functions
async function fetchUsers(): Promise<any[]> {
  // Simulate database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ]);
    }, 100);
  });
}

async function createUser(userData: any): Promise<any> {
  // Simulate user creation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000),
        ...userData,
        createdAt: new Date().toISOString(),
      });
    }, 200);
  });
}

// 5. Group Logging Example
export async function processUserData(userId: string) {
  return logger.groupAsync(
    'Processing user data',
    async () => {
      logger.info('Starting user data processing', { userId });

      // Fetch user data
      logger.debug('Fetching user data from API');
      const userData = await fetchUserData(userId);
      logger.success('User data fetched', {
        dataSize: Object.keys(userData).length,
      });

      // Process data
      logger.debug('Processing user preferences');
      const processedData = await processPreferences(userData.preferences);
      logger.info('Preferences processed', {
        processedCount: processedData.length,
      });

      // Save results
      logger.debug('Saving processed data');
      await saveProcessedData(userId, processedData);
      logger.success('Data processing completed');

      return processedData;
    },
    {
      context: { userId },
      collapsed: false,
    },
  );
}

async function fetchUserData(userId: string): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        preferences: ['theme:dark', 'notifications:email'],
      });
    }, 200);
  });
}

async function processPreferences(preferences: string[]): Promise<any[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        preferences.map((pref) => ({
          key: pref.split(':')[0],
          value: pref.split(':')[1],
        })),
      );
    }, 100);
  });
}

async function saveProcessedData(userId: string, data: any[]): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 150);
  });
}

// 6. Environment Configuration
export const LOGHORN_CONFIG = {
  // Development settings
  development: {
    enableColors: true,
    enableEmojis: true,
    enableTimestamps: true,
    enableStackTraces: true,
    enableJSON: false,
    debug: true,
    trace: true,
  },
  // Production settings
  production: {
    enableColors: false,
    enableEmojis: false,
    enableTimestamps: true,
    enableStackTraces: false,
    enableJSON: true,
    debug: false,
    trace: false,
  },
  // Test settings
  test: {
    enableColors: false,
    enableEmojis: false,
    enableTimestamps: false,
    enableStackTraces: false,
    enableJSON: true,
    debug: false,
    trace: false,
  },
};

// 7. Request Context Helper
export function createRequestContext(request: NextRequest) {
  return {
    requestId:
      request.headers.get('x-request-id') ||
      Math.random().toString(36).substr(2, 9),
    userId: request.headers.get('x-user-id'),
    sessionId: request.headers.get('x-session-id'),
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  };
}

// 8. Error Handler Helper
export function handleApiError(error: any, requestId: string) {
  logger.error('API Error', {
    error: error.message,
    stack: error.stack,
    requestId,
  });

  return NextResponse.json(
    {
      error: 'Internal server error',
      requestId,
    },
    {
      status: 500,
      headers: { 'x-request-id': requestId },
    },
  );
}

// 9. Performance Monitoring Helper
export function createPerformanceLogger(operation: string) {
  const startTime = Date.now();

  return {
    start: () => {
      logger.debug(`${operation} started`);
    },
    end: (data?: any) => {
      const duration = Date.now() - startTime;
      logger.info(`${operation} completed`, {
        duration: `${duration}ms`,
        ...data,
      });
    },
    error: (error: any) => {
      const duration = Date.now() - startTime;
      logger.error(`${operation} failed`, {
        duration: `${duration}ms`,
        error: error.message,
      });
    },
  };
}
