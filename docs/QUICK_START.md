# LogHorn Quick Start Guide

Get up and running with LogHorn in minutes!

## 🚀 Installation

```bash
npm install loghorn
# or
yarn add loghorn
# or
pnpm add loghorn
```

## 📝 Basic Usage

### 1. Simple Logging

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger();

logger.info('Hello, LogHorn!');
logger.warn('This is a warning');
logger.error('Something went wrong', { error: 'details' });
```

### 2. Next.js Integration

```javascript
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

// Next.js specific methods
logger.ssr('Server-side rendering started');
logger.api('API request received', { method: 'GET', path: '/api/users' });
logger.page('Page component mounted');
```

### 3. Performance Monitoring

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger();

// Track performance automatically
const users = await logger.trackPerformance(
  'fetch-users',
  async () => {
    const response = await fetch('/api/users');
    return response.json();
  },
  'api',
);
```

## 🎯 Common Use Cases

### API Route Logging

```javascript
// app/api/users/route.ts
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

export async function GET(req: Request) {
  logger.api('GET /api/users', {
    query: req.nextUrl.searchParams.toString(),
  });

  try {
    const users = await getUsers();
    logger.success('Users fetched successfully', { count: users.length });
    return Response.json(users);
  } catch (error) {
    logger.error('Failed to fetch users', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
```

### Middleware Logging

```javascript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

export function middleware(request: NextRequest) {
  logger.middleware('Request processed', {
    method: request.method,
    pathname: request.nextUrl.pathname,
  });

  return NextResponse.next();
}
```

### Error Handling

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger();

try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', error);
  throw error;
}
```

### Group Logging

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger();

logger.group('User Authentication', () => {
  logger.info('Starting authentication process');
  logger.info('Validating credentials');
  logger.success('User authenticated successfully');
});
```

### Performance Tracking

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger();

// Manual tracking
const metricId = logger.startPerformance('database-query', 'database');
try {
  const result = await db.query('SELECT * FROM users');
  logger.completePerformance(metricId);
  // return result;
} catch (error) {
  logger.completePerformance(metricId, error);
  throw error;
}

// Automatic tracking
const users = await logger.trackPerformance(
  'fetch-users',
  async () => {
    const response = await fetch('/api/users');
    return response.json();
  },
  'api',
);
```

## ⚙️ Configuration

### Environment-Based Configuration

LogHorn automatically configures itself based on your environment:

```javascript
import { createLogger } from 'loghorn';

// Automatically detects environment
const logger = createLogger({
  environment: process.env.NODE_ENV || 'development',
  projectName: 'my-app',
});
```

### Custom Configuration

```javascript
import { createLogger } from 'loghorn';

const logger = createLogger({
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  enableStackTraces: true,
  enableJSON: false,
  projectName: 'my-app',

  // Custom colors and emojis
  customColors: {
    success: '#28a745',
    failure: '#dc3545',
  },
  customEmojis: {
    success: '🎉',
    failure: '💥',
  },
});
```

### Environment Variables

```bash
# Set environment variables
LOGHORN_ENVIRONMENT=production
LOGHORN_ENABLE_JSON=true
LOGHORN_ENABLE_TIMESTAMPS=true
LOGHORN_PROJECT_NAME=my-app
```

## 🔧 Next.js 15 App Router

### Server Components

```javascript
// app/users/page.tsx
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

export default async function UsersPage() {
  logger.serverComponent('UsersPage', 'Component rendered');

  const users = await getUsers();

  return (
    <div>
      <h1>Users</h1>
      {/* Component content */}
    </div>
  );
}
```

### Client Components

```javascript
// components/UserForm.tsx
'use client';

import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

export default function UserForm() {
  logger.clientComponent('UserForm', 'Component mounted');

  const handleSubmit = async (data: FormData) => {
    logger.info('Form submitted', { formData: Object.fromEntries(data) });
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Streaming

```javascript
// app/users/page.tsx
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

export default async function UsersPage() {
  logger.streaming('Stream started', { chunkSize: 1024 });

  return (
    <Suspense fallback={<Loading />}>
      <UserList />
    </Suspense>
  );
}
```

### Suspense Boundaries

```javascript
// components/UserDataBoundary.tsx
import { createNextJSLogger } from 'loghorn';

const logger = createNextJSLogger();

export default function UserDataBoundary({ children }: { children: React.ReactNode }) {
  logger.suspense('UserDataBoundary', 'Loading user data');

  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
}
```

## 🚀 Edge Runtime

### Automatic Detection

LogHorn automatically detects Edge Runtime environments:

```javascript
import { createLogger } from 'loghorn';

// Works in both Node.js and Edge Runtime
const logger = createLogger();
```

### Edge-Specific Configuration

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger({
  performance: {
    enableMemoryTracking: false, // Not available in Edge Runtime
    enableCpuTracking: false, // Not available in Edge Runtime
  },
});
```

## 📊 Performance Monitoring

### Basic Performance Tracking

```javascript
import { createPerformanceLogger } from 'loghorn';

const logger = createPerformanceLogger({
  enablePerformanceLogging: true,
  performanceLogInterval: 30000, // Log stats every 30 seconds
});

// Track operations
const users = await logger.trackPerformance(
  'fetch-users',
  async () => {
    const response = await fetch('/api/users');
    return response.json();
  },
  'api',
);

// Get performance statistics
const stats = logger.getPerformanceStats();
console.log('Success rate:', stats.successRate);
console.log('Average duration:', stats.averageDuration);
```

### Performance Health Monitoring

```javascript
// Check performance health
const health = logger.checkPerformanceHealth();
if (!health.healthy) {
  console.log('Performance issues detected:');
  health.warnings.forEach((warning) => console.log('⚠️', warning));
  health.critical.forEach((critical) => console.log('❌', critical));
}
```

## 🎨 Output Examples

### Development Output

```
💡 [my-app] [2024-01-15T10:30:45.123Z] [INFO] User authentication started
✅ [my-app] [2024-01-15T10:30:45.456Z] [INFO] Authentication successful
📊 [my-app] [2024-01-15T10:30:45.789Z] [INFO] 📊 User Data
┌─ name ─┬─ age ─┬─ city ─┐
│ John   │ 30    │ NYC    │
│ Jane   │ 25    │ LA     │
└────────┴───────┴────────┘
```

### Production Output

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "User authentication started",
  "project": "my-app",
  "context": {
    "requestId": "req-123",
    "userId": "user-456"
  }
}
```

### Performance Output

```
📊 Performance Statistics
Total Operations: 150
Average Duration: 45ms
Success Rate: 98.5%
Error Rate: 1.5%
Throughput: 2.5 ops/sec

✅ Performance Health: Healthy
⚠️  Warnings: 2 slow operations detected
❌ Critical: None
```

## 🔧 Advanced Features

### Context Management

```javascript
// Set context for the entire request
logger.setContext({
  requestId: req.headers['x-request-id'],
  userId: req.user?.id,
  sessionId: req.session?.id,
});

// Log with context
logger.info('User action', { action: 'login', timestamp: Date.now() });

// Clear context when done
logger.clearContext();
```

### Table Logging

```javascript
// Array of objects
logger.table('Users', [
  { name: 'John', age: 30, city: 'NYC' },
  { name: 'Jane', age: 25, city: 'LA' },
]);

// Object with key-value pairs
logger.table('Configuration', {
  environment: 'production',
  port: 3000,
  database: 'postgresql',
});
```

### Time Tracking

```javascript
logger.time('Database Query');
// ... perform operation
logger.timeEnd('Database Query');
```

## 🧪 Testing

### Basic Test Setup

```javascript
import { createLogger } from 'loghorn';

describe('Logger Tests', () => {
  let logger;
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    logger = createLogger({
      environment: 'test',
      enableColors: false,
      enableEmojis: false,
      enableJSON: true,
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should log info message', () => {
    logger.info('Test message');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test message'),
    );
  });
});
```

### Performance Logger Testing

```javascript
import { createPerformanceLogger } from 'loghorn';

describe('Performance Logger Tests', () => {
  let logger;

  beforeEach(() => {
    logger = createPerformanceLogger({
      enablePerformanceLogging: false,
      performance: {
        enableMemoryTracking: false,
        enableCpuTracking: false,
        autoCleanupInterval: 0,
      },
    });
  });

  afterEach(() => {
    logger.destroy();
  });

  test('should track performance', async () => {
    const result = await logger.trackPerformance(
      'test-operation',
      async () => {
        return 'test result';
      },
      'test',
    );

    expect(result).toBe('test result');
  });
});
```

## 🚀 Production Deployment

### Environment Variables

```bash
# Production environment
LOGHORN_ENVIRONMENT=production
LOGHORN_ENABLE_JSON=true
LOGHORN_ENABLE_TIMESTAMPS=true
LOGHORN_ENABLE_COLORS=false
LOGHORN_ENABLE_EMOJIS=false
LOGHORN_ENABLE_STACK_TRACES=false
LOGHORN_PROJECT_NAME=my-app

# Performance monitoring
LOGHORN_ENABLE_PERFORMANCE_LOGGING=true
LOGHORN_PERFORMANCE_LOG_INTERVAL=60000
LOGHORN_MAX_METRICS_HISTORY=1000
```

### Vercel Deployment

```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV LOGHORN_ENVIRONMENT=production
ENV LOGHORN_ENABLE_JSON=true

EXPOSE 3000

CMD ["npm", "start"]
```

## 📚 Next Steps

1. **Read the API Documentation**: [API.md](API.md)
2. **Check Best Practices**: [BEST_PRACTICES.md](BEST_PRACTICES.md)
3. **Migration Guide**: [MIGRATION.md](MIGRATION.md)
4. **Examples**: Check the [examples folder](../examples/)

## 🆘 Getting Help

- 📖 **Documentation**: [API Documentation](API.md)
- 🐛 **Issues**: Report bugs on GitHub
- 💬 **Discussions**: Ask questions in GitHub Discussions
- 📝 **Examples**: See the [examples folder](../examples/)

## 🎉 You're Ready!

You now have everything you need to start using LogHorn effectively. The library
will automatically adapt to your environment and provide the best logging experience
for your Next.js application.

Happy logging! 🦄
