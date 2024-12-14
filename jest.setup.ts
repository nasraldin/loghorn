beforeAll(() => {
  // Mock console methods
  // @ts-expect-error Console mock
  global.console = {
    log: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };
});

beforeEach(() => {
  jest.clearAllMocks(); // Clear previous mocks to avoid interference
});
