// Enhanced Next.js 15 App Router Integration Example
// This example demonstrates all the new App Router specific features

const { NextJSLogger } = require('../dist/frameworks/nextjs');

// Create a Next.js logger with enhanced App Router features
const logger = new NextJSLogger({
  environment: 'development',
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  enableStackTraces: true,
  enableJSON: false,
  projectName: 'MyNextJSApp',
  // App Router specific configuration
  enableAppRouterLogging: true,
  enableServerComponents: true,
  enableClientComponents: true,
  enableStreaming: true,
  enableSuspense: true,
  enableParallelRoutes: true,
  enableInterceptingRoutes: true,
  logLevels: {
    debug: { level: 'debug', color: 'gray', emoji: '🐛', enabled: true },
    info: { level: 'info', color: 'cyan', emoji: '💡', enabled: true },
    warn: { level: 'warn', color: 'yellow', emoji: '⚠️', enabled: true },
    error: { level: 'error', color: 'red', emoji: '❌', enabled: true },
    trace: { level: 'trace', color: 'purple', emoji: '🔍', enabled: true },
    log: { level: 'log', color: 'green', emoji: '📝', enabled: true },
  },
});

console.log('\n🚀 Enhanced Next.js 15 App Router Integration Demo\n');

// 1. App Router Specific Methods
console.log('📱 App Router Specific Methods:');
logger.serverComponent('UserProfile', 'Component rendered', {
  userId: '123',
  renderTime: '2ms',
});
logger.clientComponent('UserForm', 'Component mounted', {
  formId: 'form-1',
  validation: 'enabled',
});
logger.streaming('Stream started', { chunkSize: 1024, compression: 'gzip' });
logger.suspense('UserDataBoundary', 'Loading user data', {
  userId: '123',
  retryCount: 0,
});
logger.parallelRoute('@modal', 'Modal route loaded', {
  modalType: 'user',
  animation: 'slide',
});
logger.interceptingRoute('/users/[id]', 'Route intercepted', {
  userId: '123',
  redirect: false,
});

console.log('\n🔄 App Router Lifecycle Methods:');
logger.layout('RootLayout', 'Layout rendered', {
  pathname: '/dashboard',
  theme: 'dark',
});
logger.template('UserTemplate', 'Template rendered', {
  templateId: 'user',
  cache: 'hit',
});
logger.loading('UserLoading', 'Loading component rendered', {
  loadingType: 'skeleton',
  duration: '150ms',
});
logger.errorBoundary('UserErrorBoundary', 'Error caught', {
  errorType: 'fetch',
  fallback: 'enabled',
});
logger.notFound('UserNotFound', 'User not found', {
  userId: '999',
  searchTerm: 'invalid',
});

console.log('\n📊 App Router Data Fetching:');
logger.dataFetch('getUser', 'User data fetched', {
  userId: '123',
  cache: 'miss',
  duration: '45ms',
});
logger.metadata('generateMetadata', 'Metadata generated', {
  page: '/users',
  seo: 'optimized',
});

console.log('\n🍪 App Router Request/Response:');
logger.cookies('set', 'Cookie set', {
  name: 'session',
  value: 'abc123',
  httpOnly: true,
});
logger.headers('set', 'Header set', {
  name: 'x-custom',
  value: 'value',
  secure: true,
});
logger.redirect('/old-path', '/new-path', { reason: 'migration', permanent: true });
logger.searchParams({ page: '1', limit: '10' }, 'Search params processed', {
  query: 'users',
  filters: 'active',
});
logger.segment('users', 'Segment processed', {
  segmentType: 'dynamic',
  params: { id: '123' },
});

console.log('\n⚡ Performance Monitoring:');
logger.performance('Database Query', 150, {
  query: 'SELECT * FROM users',
  rows: 25,
});
logger.performance('API Call', 45, {
  endpoint: '/api/users',
  method: 'GET',
  status: 200,
});

console.log('\n🔧 Configuration Management:');
// Update configuration dynamically
logger.updateNextJSConfig({
  enableServerComponents: false,
  enableClientComponents: false,
});

// Test that disabled features don't log
logger.serverComponent('TestComponent', 'This should not log');
logger.clientComponent('TestComponent', 'This should not log');

// Re-enable features
logger.updateNextJSConfig({
  enableServerComponents: true,
  enableClientComponents: true,
});

console.log('\n🛠️ Error Handling:');
const error = new Error('Database connection failed');
logger.nextError(error, { userId: '123', operation: 'user-fetch' });

console.log('\n📚 Legacy Methods Compatibility:');
logger.ssr('Server-side rendering started', { page: '/dashboard', time: '2.5s' });
logger.api('API request received', {
  method: 'GET',
  path: '/api/users',
  status: 200,
});
logger.page('Page component mounted', {
  pageName: 'Dashboard',
  route: '/dashboard',
});

console.log('\n✅ Enhanced Next.js 15 App Router Integration Demo Complete!\n');

// Display current configuration
const config = logger.getNextJSConfig();
console.log('📋 Current Configuration:');
console.log('- Server Components:', config.enableServerComponents);
console.log('- Client Components:', config.enableClientComponents);
console.log('- Streaming:', config.enableStreaming);
console.log('- Suspense:', config.enableSuspense);
console.log('- Parallel Routes:', config.enableParallelRoutes);
console.log('- Intercepting Routes:', config.enableInterceptingRoutes);
