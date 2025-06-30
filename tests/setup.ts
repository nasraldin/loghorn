// Mock console methods to capture output
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  group: console.group,
  groupEnd: console.groupEnd,
  time: console.time,
  timeEnd: console.timeEnd,
};

// Global test utilities
declare global {
  var capturedLogs: string[];
  var capturedErrors: string[];
  var capturedWarns: string[];
  var capturedInfos: string[];
  var capturedDebugs: string[];
}

beforeEach(() => {
  // Reset captured logs
  global.capturedLogs = [];
  global.capturedErrors = [];
  global.capturedWarns = [];
  global.capturedInfos = [];
  global.capturedDebugs = [];

  // Mock console methods
  console.log = jest.fn((...args) => {
    global.capturedLogs.push(args.join(" "));
    originalConsole.log(...args);
  });

  console.info = jest.fn((...args) => {
    global.capturedInfos.push(args.join(" "));
    originalConsole.info(...args);
  });

  console.warn = jest.fn((...args) => {
    global.capturedWarns.push(args.join(" "));
    originalConsole.warn(...args);
  });

  console.error = jest.fn((...args) => {
    global.capturedErrors.push(args.join(" "));
    originalConsole.error(...args);
  });

  console.debug = jest.fn((...args) => {
    global.capturedDebugs.push(args.join(" "));
    originalConsole.debug(...args);
  });

  console.group = jest.fn();
  console.groupEnd = jest.fn();
  console.time = jest.fn();
  console.timeEnd = jest.fn();
});

afterEach(() => {
  // Restore original console methods
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
  console.time = originalConsole.time;
  console.timeEnd = originalConsole.timeEnd;
});

// Helper function to get captured logs
export function getCapturedLogs(): string[] {
  return global.capturedLogs;
}

export function getCapturedErrors(): string[] {
  return global.capturedErrors;
}

export function getCapturedWarns(): string[] {
  return global.capturedWarns;
}

export function getCapturedInfos(): string[] {
  return global.capturedInfos;
}

export function getCapturedDebugs(): string[] {
  return global.capturedDebugs;
}

// Helper function to clear captured logs
export function clearCapturedLogs(): void {
  global.capturedLogs = [];
  global.capturedErrors = [];
  global.capturedWarns = [];
  global.capturedInfos = [];
  global.capturedDebugs = [];
}
