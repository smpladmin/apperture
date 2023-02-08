import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});
const customJestConfig = {
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@theme/(.*)$': '<rootDir>/theme/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@pages/(.*)$': '<rootDir>/pages/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
