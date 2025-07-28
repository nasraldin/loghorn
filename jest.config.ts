import type { Config } from 'jest';

const config: Config = {
  verbose: false, // Changed from true to false to reduce output overhead
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.d.ts', '!lib/**/*.test.ts'],
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  // Performance optimizations
  maxWorkers: '50%', // Use 50% of available CPU cores
  workerIdleMemoryLimit: '512MB', // Limit memory per worker
  maxConcurrency: 5, // Limit concurrent tests
  // Caching
  cache: true,
  cacheDirectory: '.jest-cache',
  // Reduce overhead
  bail: false,
  // Reduce file watching overhead
  watchman: false, // Disable watchman to avoid warnings
};

export default config;
