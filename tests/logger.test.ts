import logger, {
  // debug,
  // error,
  ILoggerService,
  // info,
  log,
  // logWrite,
  // trace,
  // warn,
} from '../lib';
// import { LogLevel } from '../lib/config';
import { safeArrayConversion } from '../lib/utils';

describe('Logger', () => {
  beforeEach(() => {
    // Mock env
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_LOGS = 'true';
    process.env.LOG_APP_NAME = 'test';
    process.env.MIDDLEWARE_LOGS = 'true';
    jest.clearAllMocks(); // Clear the mocks for fresh tests
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.clearAllMocks();
  });

  describe('Environment Configuration', () => {
    it('should not log when logger is disabled', () => {
      process.env.ENABLE_LOGS = 'false';
      log('test message');
      expect(console.log).not.toHaveBeenCalled();
      // Restore original value
      process.env.ENABLE_LOGS = 'true';
    });

    it('should handle different log levels based on environment', () => {
      // Mock production environment
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const testMessage = 'Debug message in production';
      logger.debug(testMessage);

      // Debug messages should not be logged in production
      expect(console.debug).not.toHaveBeenCalled();

      // Restore original environment
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('safeArrayConversion', () => {
    it('should return an empty array for null or undefined', () => {
      expect(safeArrayConversion(null)).toEqual([]);
      expect(safeArrayConversion(undefined)).toEqual([]);
    });

    it('should return the same array if the input is an array', () => {
      const input = [1, 2, 3];
      expect(safeArrayConversion(input)).toEqual(input);
    });

    it('should return an array with the object inside if the input is an object', () => {
      const input = { key: 'value' };
      expect(safeArrayConversion(input)).toEqual([input]);
    });

    it('should handle circular references gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circular: any = {};
      circular.self = circular;
      expect(safeArrayConversion(circular)).toEqual([circular]);
    });

    it('should return the value in an array if the input is neither null, undefined, nor an array', () => {
      const input = 'test';
      expect(safeArrayConversion(input)).toEqual([input]);
    });
  });

  // describe('logWrite function', () => {
  //   it('should call the correct console method based on log level', () => {
  //     // const spyLog = jest.spyOn(console, 'log');
  //     // const spyInfo = jest.spyOn(console, 'info');

  //     logWrite({ level: LogLevel.Log, label: 'test', data: ['message'] });
  //     expect(console.log).toHaveBeenCalled();

  //     logWrite({ level: LogLevel.Info, label: 'test', data: ['message'] });
  //     expect(console.info).toHaveBeenCalled();
  //   });
  // });

  // describe('log function', () => {
  //   it('should call console.log when log() is called with valid arguments', () => {
  //     const message = 'Test log message';
  //     log('test label', message);

  //     expect(console.log).toHaveBeenCalledWith(
  //       expect.stringContaining('Log'),
  //       expect.stringContaining(message),
  //     );
  //   });

  //   it('should call writeLogToSeq with proper arguments when log() is called', () => {
  //     const message = 'Test log message';
  //     log('test label', message);
  //     // eslint-disable-next-line @typescript-eslint/no-require-imports
  //     expect(require('../lib/logger').writeLogToSeq).toHaveBeenCalledWith(
  //       expect.anything(),
  //       expect.objectContaining({
  //         label: 'test label',
  //         data: [message],
  //       }),
  //     );
  //   });
  // });

  // describe('info function', () => {
  //   it('should call console.info when info() is called with valid arguments', () => {
  //     const message = 'Test info message';
  //     info('test label', { message });

  //     expect(console.info).toHaveBeenCalledWith(
  //       expect.stringContaining('Info'),
  //       expect.stringContaining(message),
  //     );
  //   });
  // });

  // describe('debug function', () => {
  //   it('should call console.debug when debug() is called with valid arguments', () => {
  //     const message = 'Test debug message';
  //     debug('test label', message);

  //     expect(console.debug).toHaveBeenCalledWith(
  //       expect.stringContaining('Debug'),
  //       expect.stringContaining(message),
  //     );
  //   });
  // });

  // describe('error function', () => {
  //   it('should call console.error when error() is called with valid arguments', () => {
  //     const message = 'Test error message';
  //     error('test label', message);

  //     expect(console.error).toHaveBeenCalledWith(
  //       expect.stringContaining('Error'),
  //       expect.stringContaining(message),
  //     );
  //   });
  // });

  // describe('warn function', () => {
  //   it('should call console.warn when warn() is called with valid arguments', () => {
  //     const message = 'Test warn message';
  //     warn('test label', message);

  //     expect(console.warn).toHaveBeenCalledWith(
  //       expect.stringContaining('Warn'),
  //       expect.stringContaining(message),
  //     );
  //   });
  // });

  // describe('trace function', () => {
  //   it('should call console.trace when trace() is called with valid arguments', () => {
  //     const message = 'Test trace message';
  //     trace('test label', message);

  //     expect(console.trace).toHaveBeenCalledWith(
  //       expect.stringContaining('Trace'),
  //       expect.stringContaining(message),
  //     );
  //   });
  // });

  describe('ILoggerService', () => {
    it('should create an instance with all log methods', () => {
      const logger = new ILoggerService();

      expect(logger.log).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
    });
  });
});
