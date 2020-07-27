const { SingleEntryPlugin } = require('webpack')
const ID = 'gridsome:manifest-plugin'

module.exports = class CompileSWPlugin {
  constructor (config) {
    this.config = config
  }

  apply (compiler) {
    compiler.hooks.thisCompilation.tap(ID, (compilation) => {
      compilation.hooks.additionalAssets.tapPromise(ID, async () => {
        const logger = compiler.getInfrastructureLogger(ID)
        logger.info(JSON.stringify(this.config))
        const outputOptions = {
          path: compiler.options.output.path,
          filename: this.config.swDest
        }

        const childCompiler = compilation.createChildCompiler(
          ID,
          outputOptions
        )

        childCompiler.context = compiler.context
        childCompiler.inputFileSystem = compiler.inputFileSystem
        childCompiler.outputFileSystem = compiler.outputFileSystem

        if (Array.isArray(this.config.webpackCompilationPlugins)) {
          for (const plugin of this.config.webpackCompilationPlugins) {
            plugin.apply(childCompiler)
          }
        }

        new SingleEntryPlugin(
          compiler.context,
          this.config.swSrc,
          ID
        ).apply(childCompiler)

        await new Promise((resolve, reject) => {
          childCompiler.runAsChild((error, entries, childCompilation) => {
            if (error) {
              reject(error)
            } else {
              compilation.warnings = compilation.warnings.concat(
                childCompilation.warnings)
              compilation.errors = compilation.errors.concat(
                childCompilation.errors)

              resolve()
            }
          })
        })
      })
    })
  }
}
