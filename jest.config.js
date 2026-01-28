export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/thirdparty/**/*.js', // Exclude third-party code from coverage
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/test/**/*.test.js'],
  transform: {},
  moduleFileExtensions: ['js'],
  verbose: true,
};
