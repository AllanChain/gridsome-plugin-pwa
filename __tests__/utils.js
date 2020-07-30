const path = require('path')

const context = path.join(__dirname, '..', 'examples', 'basic')

module.exports = {
  context,
  dist: (...file) => path.join(context, 'gridsome', ...file),
  build: async () => {
    const build = require(path.join(
      context, 'node_modules', 'gridsome', 'lib', 'build.js'
    ))
    await build(context)
  },
  useContext: () => {
    const cwd = process.cwd()
    beforeAll(() => process.chdir(context))
    afterAll(() => process.chdir(cwd))
  }
}
