/**
 * Code from https://github.com/GoogleChrome/workbox/blob/v6/packages/workbox-webpack-plugin/src/inject-manifest.js#L166-L207
 * with MIT License
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
          ID,
          outputOptions,
          this.config.webpackCompilationPlugins
        )

        childCompiler.context = compiler.context
        childCompiler.inputFileSystem = compiler.inputFileSystem
        childCompiler.outputFileSystem = compiler.outputFileSystem
        childCompiler.options.target = 'webworker'

        new webpack.webworker.WebWorkerTemplatePlugin().apply(childCompiler)

        new webpack.SingleEntryPlugin(
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
