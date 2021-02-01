const path = require('path')

const resolveContext = name => path.join(__dirname, '..', 'examples', name)

module.exports = {
  resolveContext,
  distLocator: (name, out = 'gridsome') =>
    (...file) => path.join(resolveContext(name), out, ...file),
  build: async (name) => {
    const build = require(path.join(
      resolveContext(name), 'node_modules', 'gridsome', 'lib', 'build.js'
    ))
    await build(resolveContext(name))
  },
  useContext: (name) => {
    const cwd = process.cwd()
    beforeAll(() => process.chdir(resolveContext(name)))
    afterAll(() => process.chdir(cwd))
  }
}
