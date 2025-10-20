/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }] },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['<rootDir>/.stryker-tmp/'],
  // no per-test server setup; we test directly against the Express app via supertest
  globalSetup: '<rootDir>/tests/global.setup.ts'
};
