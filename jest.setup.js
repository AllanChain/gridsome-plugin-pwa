/* eslint-disable no-console */
process.env.GRIDSOME_TEST = 1
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  // Keep native behaviour for other methods,
  // use those to print out things in your own tests, not `console.log`
  error: console.error,
  info: console.info,
  debug: console.debug
}
