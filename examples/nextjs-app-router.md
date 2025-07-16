// Next.js App Router Integration with LogHorn Logger // TypeScript example for
modern Next.js applications

import { createLogger } from 'loghorn'; import type { NextRequest, NextResponse }
from 'next/server'; import type { ReactNode } from 'react';

// 1. Create a shared logger instance export const logger = createLogger({
environment: (process.env.NODE_ENV as any) || 'development', enableColors:
process.env.NODE_ENV !== 'production', enableEmojis: process.env.NODE_ENV !==
'production', enableTimestamps: true, enableStackTraces: process.env.NODE_ENV !==
'production', enableJSON: process.env.NODE_ENV === 'production', logLevels: { debug:
{ enabled: process.env.NODE_ENV === 'development' }, info: { enabled: true }, warn:
{ enabled: true }, error: { enabled: true }, trace: { enabled: process.env.NODE_ENV
=== 'development' }, log: { enabled: true }, }, });

// 2. API Route Handler (app/api/users/route.ts) export async function GET(request:
NextRequest) { const requestId = request.headers.get('x-request-id') ||
Math.random().toString(36).substr(2, 9);

logger.setContext({ requestId, endpoint: '/api/users', method: 'GET', });

logger.info('GET /api/users request received', { url: request.url, headers:
Object.fromEntries(request.headers.entries()), });

try { logger.debug('Fetching users from database'); const users = await
fetchUsers();

    logger.success('Users fetched successfully', { count: users.length });

    return NextResponse.json(users, {
      headers: { 'x-request-id': requestId },
    });

} catch (error) { logger.error('Failed to fetch users', error); return
NextResponse.json( { error: 'Internal server error' }, { status: 500, headers: {
'x-request-id': requestId } } ); } }

export async function POST(request: NextRequest) { const requestId =
request.headers.get('x-request-id') || Math.random().toString(36).substr(2, 9);

logger.setContext({ requestId, endpoint: '/api/users', method: 'POST', });

try { const body = await request.json(); logger.info('Creating new user', {
userData: body });

    const newUser = await createUser(body);
    logger.success('User created successfully', { userId: newUser.id });

    return NextResponse.json(newUser, {
      status: 201,
      headers: { 'x-request-id': requestId },
    });

} catch (error) { logger.error('Failed to create user', error); return
NextResponse.json( { error: 'Failed to create user' }, { status: 500, headers: {
'x-request-id': requestId } } ); } }

// 3. Page Component (app/page.tsx) 'use client';

import { useEffect, useState } from 'react'; import { useLogger } from
'./hooks/useLogger';

export default function HomePage() { const [data, setData] = useState<any>(null);
const [loading, setLoading] = useState(true); const log = useLogger({ component:
'HomePage' });

useEffect(() => { log.info('Home page component mounted');

    const fetchData = async () => {
      log.debug('Fetching page data');

      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        log.success('Page data loaded successfully', { dataSize: result.length });
        setData(result);
      } catch (error) {
        log.error('Failed to load page data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

}, [log]);

return ( <div className="container mx-auto p-4">

<h1 className="text-2xl font-bold mb-4"> Welcome to Next.js with LogHorn </h1>
{loading ? ( <p>Loading...</p> ) : ( <div> <p>Data loaded successfully!</p>
<pre className="mt-4 p-2 bg-gray-100 rounded"> {JSON.stringify(data, null, 2)}
</pre> </div> )} </div> ); }

// 4. Custom Hook for React Components import { useCallback, useContext,
createContext } from 'react';

interface LoggerContext { requestId?: string; userId?: string; sessionId?: string; }

const LoggerContext = createContext<LoggerContext>({});

export function LoggerProvider({ children, context = {} }: { children: ReactNode;
context?: LoggerContext; }) { return ( <LoggerContext.Provider value={context}>
{children} </LoggerContext.Provider> ); }

export function useLogger(componentContext: Record<string, any> = {}) { const
context = useContext(LoggerContext);

const log = useCallback((level: string, message: string, data?: any) => {
logger.setContext({ ...context, ...componentContext }); (logger as
any)[level](message, data); }, [context, componentContext]);

return { debug: (message: string, data?: any) => log('debug', message, data), info:
(message: string, data?: any) => log('info', message, data), warn: (message: string,
data?: any) => log('warn', message, data), error: (message: string, data?: any) =>
log('error', message, data), success: (message: string, data?: any) =>
logger.success(message, data), failure: (message: string, data?: any) =>
logger.failure(message, data), }; }

// 5. Component with Logging 'use client';

import { useEffect } from 'react'; import { useLogger } from './hooks/useLogger';

interface UserProfileProps { userId: string; userData?: any; }

export function UserProfile({ userId, userData }: UserProfileProps) { const log =
useLogger({ userId, component: 'UserProfile' });

useEffect(() => { log.info('User profile component mounted', { userId }); },
[userId, log]);

const handleUpdateProfile = async (data: any) => { log.debug('Updating user
profile', { userId, data });

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

return ( <div className="p-4 border rounded">

<h2 className="text-xl font-semibold mb-4">User Profile</h2> {userData ? ( <div>
<p><strong>Name:</strong> {userData.name}</p> <p><strong>Email:</strong>
{userData.email}</p> <button onClick={() => handleUpdateProfile({ name: 'Updated
Name' })} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" > Update Profile
</button> </div> ) : ( <p>Loading user data...</p> )} </div> ); }

// 6. Middleware (middleware.ts) import { NextResponse } from 'next/server'; import
type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) { const requestId =
request.headers.get('x-request-id') || Math.random().toString(36).substr(2, 9);

logger.setContext({ requestId, pathname: request.nextUrl.pathname, method:
request.method, });

logger.info('Middleware processing request', { url: request.url, method:
request.method, userAgent: request.headers.get('user-agent'), });

const response = NextResponse.next(); response.headers.set('x-request-id',
requestId);

return response; }

export const config = { matcher: [ /* * Match all request paths except for the ones
starting with: * - api (API routes) * - _next/static (static files) * - _next/image
(image optimization files) * - favicon.ico (favicon file) */
'/((?!api|_next/static|_next/image|favicon.ico).*)', ], };

// 7. Error Boundary Component 'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: Error; }

interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode; }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState>
{ constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError:
false }; }

static getDerivedStateFromError(error: Error): ErrorBoundaryState { return {
hasError: true, error }; }

componentDidCatch(error: Error, errorInfo: any) { logger.error('React error boundary
caught error', { error: error.message, stack: error.stack, componentStack:
errorInfo.componentStack, }); }

render() { if (this.state.hasError) { return this.props.fallback || (

<div className="p-4 border border-red-300 bg-red-50 rounded">
<h2 className="text-red-800 font-semibold">Something went wrong</h2>
<p className="text-red-600 mt-2"> {this.state.error?.message || 'An unexpected error
occurred'} </p> </div> ); }

    return this.props.children;

} }

// 8. Layout with Logger Provider (app/layout.tsx) import { LoggerProvider } from
'./components/LoggerProvider';

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
return ( <html lang="en"> <body> <LoggerProvider
context={{ sessionId: 'session-123' }}> <ErrorBoundary> {children} </ErrorBoundary>
</LoggerProvider> </body> </html> ); }

// 9. Utility Functions async function fetchUsers(): Promise<any[]> { // Simulate
database call return new Promise((resolve) => { setTimeout(() => { resolve([ { id:
1, name: 'John Doe', email: 'john@example.com' }, { id: 2, name: 'Jane Smith',
email: 'jane@example.com' }, ]); }, 100); }); }

async function createUser(userData: any): Promise<any> { // Simulate user creation
return new Promise((resolve) => { setTimeout(() => { resolve({ id:
Math.floor(Math.random() \* 1000), ...userData, createdAt: new Date().toISOString(),
}); }, 200); }); }

// 10. Group Logging Example export async function processUserData(userId: string) {
return logger.groupAsync('Processing user data', async () => { logger.info('Starting
user data processing', { userId });

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

async function fetchUserData(userId: string): Promise<any> { return new
Promise((resolve) => { setTimeout(() => { resolve({ id: userId, name: 'John Doe',
email: 'john@example.com', preferences: ['theme:dark', 'notifications:email'], });
}, 200); }); }

async function processPreferences(preferences: string[]): Promise<any[]> { return
new Promise((resolve) => { setTimeout(() => { resolve(preferences.map(pref => ({
key: pref.split(':')[0], value: pref.split(':')[1] }))); }, 100); }); }

async function saveProcessedData(userId: string, data: any[]): Promise<any> { return
new Promise((resolve) => { setTimeout(() => { resolve({ success: true }); }, 150);
}); }
