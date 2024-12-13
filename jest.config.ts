import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['<rootDir>/tests/**/?(*.)+(test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.d.ts', '!lib/**/*.test.ts'],
};

export default config;
