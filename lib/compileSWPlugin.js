/**
 * Code from https://github.com/GoogleChrome/workbox/blob/v6.0.0-alpha.1/packages/workbox-webpack-plugin/src/inject-manifest.js#L166-L207
 * with MIT License
 * TODO: keep up with workbox changes.
 */
const webpack = require('webpack')

const ID = 'gridsome:compile-sw-plugin'

module.exports = class CompileSWPlugin {
  constructor (config) {
    this.config = config
  }

  apply (compiler) {
    compiler.hooks.thisCompilation.tap(ID, (compilation) => {
      compilation.hooks.additionalAssets.tapPromise(ID, async () => {
        const outputOptions = {
          path: compiler.options.output.path,
          filename: this.config.swDest,
          globalObject: 'self'
        }
        const childCompiler = compilation.createChildCompiler(
          ID, outputOptions
          // For some reason passing plugins via third param has no effect
        )

        childCompiler.context = compiler.context
        childCompiler.inputFileSystem = compiler.inputFileSystem
        childCompiler.outputFileSystem = compiler.outputFileSystem
        childCompiler.options.target = 'webworker'

        if (Array.isArray(this.config.webpackCompilationPlugins)) {
          for (const plugin of this.config.webpackCompilationPlugins) {
            plugin.apply(childCompiler)
          }
        }

        new webpack.webworker.WebWorkerTemplatePlugin().apply(childCompiler)

        new webpack.EntryPlugin(
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
