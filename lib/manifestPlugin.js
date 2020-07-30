const sharp = require('sharp')

const ID = 'gridsome:manifest-plugin'

module.exports = class ManifestPlugin {
  constructor (manifestDest, outputManifest, iconTasks) {
    this.manifestDest = manifestDest
    this.outputManifest = outputManifest
    this.iconTasks = iconTasks
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
          logger.info('Generating icons')
          await Promise.all(
            this.iconTasks.map(async task => {
              const imageData = await sharp(task.src)
                .resize(task.size, task.size)
                .toBuffer()
              compilation.emitAsset(task.dest, {
                source: () => imageData,
                size: () => imageData.length
              })
            })
          )
        } catch (err) {
          logger.error(err.message)
          compilation.errors.push(err)
        }
      })
    })
  }
}
