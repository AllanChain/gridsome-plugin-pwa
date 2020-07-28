const path = require('path')

const context = path.join(__dirname, '..', 'examples', 'basic')
process.chdir(context)

const build = require(path.join(
  context, 'node_modules', 'gridsome', 'lib', 'build.js'
))

module.exports = {
  context,
  dist: (...file) => path.join(context, 'gridsome', ...file),
  build: async () => build(context)
}
