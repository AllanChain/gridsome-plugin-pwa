module.exports = {
  verbose: true,
  collectCoverage: true,
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ['utils.js'],
  collectCoverageFrom: ['gridsome.*.js', 'lib/*.js', '!noopServiceWorker*']
}
