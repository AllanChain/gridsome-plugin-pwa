const ID = 'gridsome:manifest-plugin'

module.exports = class ManifestPlugin {
  constructor (manifestDest, outputManifest) {
    this.manifestDest = manifestDest
    this.outputManifest = outputManifest
  }

  apply (compiler) {
    compiler.hooks.thisCompilation.tap(ID, (compilation) => {
      const logger = compiler.getInfrastructureLogger(ID)

      compilation.hooks.additionalAssets.tapPromise(ID, async () => {
        try {
          const manifestString = JSON.stringify(this.outputManifest)
          logger.info('Writing manifest to ' + this.manifestDest)
          compilation.emitAsset(this.manifestDest, {
            source: () => manifestString,
            size: () => manifestString.length
          })
        } catch (err) {
          logger.error(err.message)
          compilation.errors.push(err)
        }
      })
    })
  }
}
