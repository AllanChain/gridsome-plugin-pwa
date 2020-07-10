const sharp = require('sharp')
const generateManifest = require('./generateManifest')

const ID = 'gridsome:manifest-plugin'

module.exports = class ManifestPlugin {
  constructor (options) {
    this.options = options
  }

  apply (compiler) {
    compiler.hooks.thisCompilation.tap(ID, (compilation) => {
      const logger = compiler.getInfrastructureLogger(ID)

      compilation.hooks.additionalAssets.tapPromise(ID, async () => {
        try {
          const manifestDest = this.options.manifestPath
          const outputManifest = generateManifest(this.options)
          const manifestString = JSON.stringify(outputManifest)
          logger.info('Writing manifest to ' + manifestDest)
          compilation.emitAsset(manifestDest, {
            source: () => manifestString,
            size: () => manifestString.length
          })
          logger.info('Generating icons')
          await Promise.all(
            outputManifest.icons.map(async icon => {
              const size = parseInt(icon.sizes.match(/\d+/), 10)
              const imageData = await sharp(this.options.icon)
                .resize(size, size)
                .toBuffer()
              compilation.emitAsset(icon.src, {
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
