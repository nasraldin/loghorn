// Next.js Integration Example for LogHorn Logger // This example shows how to use
the Logger in a Next.js application

// 1. Basic Setup - Create a logger instance import { createLogger } from 'loghorn';

// Create a logger with Next.js specific configuration const logger = createLogger({
environment: process.env.NODE_ENV || 'development', enableColors:
process.env.NODE_ENV !== 'production', enableEmojis: process.env.NODE_ENV !==
'production', enableTimestamps: true, enableStackTraces: process.env.NODE_ENV !==
'production', enableJSON: process.env.NODE_ENV === 'production', logLevels: { debug:
{ enabled: process.env.NODE_ENV === 'development' }, info: { enabled: true }, warn:
{ enabled: true }, error: { enabled: true }, trace: { enabled: process.env.NODE_ENV
=== 'development' }, log: { enabled: true }, }, });

// 2. API Route Example (pages/api/users.js or app/api/users/route.js) export
default async function handler(req, res) { // Set request context
logger.setContext({ requestId: req.headers['x-request-id'] ||
Math.random().toString(36).substr(2, 9), userId: req.headers['x-user-id'], endpoint:
'/api/users', method: req.method, });

logger.info('API request received', { method: req.method, url: req.url, headers:
req.headers, });

try { // Simulate database operation logger.debug('Fetching users from database');

    const users = await fetchUsers();

    logger.success('Users fetched successfully', { count: users.length });

    res.status(200).json(users);

} catch (error) { logger.error('Failed to fetch users', error);
res.status(500).json({ error: 'Internal server error' }); } }

// 3. Page Component Example (pages/index.js or app/page.js) import { useEffect,
useState } from 'react';

export default function HomePage() { const [data, setData] = useState(null); const
[loading, setLoading] = useState(true);

useEffect(() => { logger.info('Home page loaded');

    const fetchData = async () => {
      logger.debug('Fetching page data');

      try {
        const response = await fetch('/api/data');
        const result = await response.json();

        logger.success('Page data loaded', { dataSize: result.length });
        setData(result);
      } catch (error) {
        logger.error('Failed to load page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

}, []);

return ( <div> <h1>Welcome to Next.js with LogHorn</h1> {loading ? <p>Loading...</p>
: <p>Data loaded!</p>} </div> ); }

// 4. Middleware Example (middleware.js) import { NextResponse } from 'next/server';

export function middleware(request) { // Set request context logger.setContext({
requestId: request.headers.get('x-request-id') ||
Math.random().toString(36).substr(2, 9), pathname: request.nextUrl.pathname, method:
request.method, });

logger.info('Middleware processing request', { url: request.url, method:
request.method, userAgent: request.headers.get('user-agent'), });

// Add request ID to headers const requestId = request.headers.get('x-request-id')
|| Math.random().toString(36).substr(2, 9); const response = NextResponse.next();
response.headers.set('x-request-id', requestId);

return response; }

// 5. Custom Hook for React Components import { useCallback } from 'react';

export function useLogger(context = {}) { const log = useCallback((level, message,
data) => { logger.setContext(context); logger[level](message, data); }, [context]);

return { debug: (message, data) => log('debug', message, data), info: (message,
data) => log('info', message, data), warn: (message, data) => log('warn', message,
data), error: (message, data) => log('error', message, data), success: (message,
data) => logger.success(message, data), failure: (message, data) =>
logger.failure(message, data), }; }

// 6. Component with Logging function UserProfile({ userId }) { const log =
useLogger({ userId, component: 'UserProfile' });

useEffect(() => { log.info('User profile component mounted', { userId }); },
[userId, log]);

const handleUpdateProfile = async (data) => { log.debug('Updating user profile', {
userId, data });

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        log.success('Profile updated successfully');
      } else {
        log.error('Failed to update profile', { status: response.status });
      }
    } catch (error) {
      log.error('Profile update error', error);
    }

};

return ( <div> <h2>User Profile</h2> {/_ Component content _/} </div> ); }

// 7. Group Logging Example async function processUserData(userId) { return
logger.groupAsync('Processing user data', async () => { logger.info('Starting user
data processing', { userId });

    // Fetch user data
    logger.debug('Fetching user data from API');
    const userData = await fetchUserData(userId);
    logger.success('User data fetched', { dataSize: Object.keys(userData).length });

    // Process data
    logger.debug('Processing user preferences');
    const processedData = await processPreferences(userData.preferences);
    logger.info('Preferences processed', { processedCount: processedData.length });

    // Save results
    logger.debug('Saving processed data');
    await saveProcessedData(userId, processedData);
    logger.success('Data processing completed');

    return processedData;

}, { context: { userId }, collapsed: false, }); }

// 8. Error Boundary with Logging class ErrorBoundary extends React.Component {
constructor(props) { super(props); this.state = { hasError: false }; }

static getDerivedStateFromError(error) { return { hasError: true }; }

componentDidCatch(error, errorInfo) { logger.error('React error boundary caught
error', { error: error.message, stack: error.stack, componentStack:
errorInfo.componentStack, }); }

render() { if (this.state.hasError) { return <h1>Something went wrong.</h1>; }

    return this.props.children;

} }

// 9. Environment Configuration (.env.local) /\*

# LogHorn Configuration for Next.js

LOGHORN_ENVIRONMENT=development LOGHORN_ENABLE_COLORS=true
LOGHORN_ENABLE_EMOJIS=true LOGHORN_ENABLE_TIMESTAMPS=true
LOGHORN_ENABLE_STACK_TRACES=true LOGHORN_ENABLE_JSON=false
LOGHORN_DEBUG_ENABLED=true LOGHORN_TRACE_ENABLED=true

# Production settings (in production environment)

# LOGHORN_ENVIRONMENT=production

# LOGHORN_ENABLE_COLORS=false

# LOGHORN_ENABLE_EMOJIS=false

# LOGHORN_ENABLE_JSON=true

# LOGHORN_DEBUG_ENABLED=false

# LOGHORN_TRACE_ENABLED=false

\*/

// 10. Utility Functions async function fetchUsers() { // Simulate database call
return new Promise((resolve) => { setTimeout(() => { resolve([ { id: 1, name: 'John
Doe', email: 'john@example.com' }, { id: 2, name: 'Jane Smith', email:
'jane@example.com' }, ]); }, 100); }); }

async function fetchUserData(userId) { // Simulate API call return new
Promise((resolve) => { setTimeout(() => { resolve({ id: userId, name: 'John Doe',
email: 'john@example.com', preferences: ['theme:dark', 'notifications:email'], });
}, 200); }); }

async function processPreferences(preferences) { // Simulate processing return new
Promise((resolve) => { setTimeout(() => { resolve(preferences.map(pref => ({ key:
pref.split(':')[0], value: pref.split(':')[1] }))); }, 100); }); }

async function saveProcessedData(userId, data) { // Simulate save operation return
new Promise((resolve) => { setTimeout(() => { resolve({ success: true }); }, 150);
}); }

// 11. Export for use in other files export { logger, useLogger, ErrorBoundary };
