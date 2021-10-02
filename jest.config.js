module.exports = {
  verbose: true,
  collectCoverage: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ['utils.js'],
  collectCoverageFrom: [
    'gridsome.*.js',
    'lib/*.js',
    '!lib/noopServiceWorker*'
  ]
}
