const sharp = require('sharp')
const rename = require('rename')

const ID = 'gridsome:manifest-plugin'

module.exports = class ManifestPlugin {
  constructor (options) {
    this.options = options
  }

  apply (compiler) {
    compiler.hooks.thisCompilation.tap(ID, (compilation) => {
      const logger = compiler.getInfrastructureLogger(ID)

      compilation.hooks.additionalAssets.tapPromise(ID, async () => {
        const options = this.options
        const manifestDest = options.manifestPath
        const iconsDir = 'assets/icons/'
        const iconName = options.icon.split('/').slice(-1)[0]
        const type = 'image/' + iconName.split('.').slice(-1)[0]

        // Generate all size images from options.icon
        const sizes = [512, 384, 192, 180, 152, 144, 128, 120, 96, 72, 48, 16]

        const icons = []
        logger.info('Generating icons')
        await Promise.all(
          sizes.map(async (size) => {
            const sizes = `${size}x${size}`
            const src = iconsDir + rename(iconName, { suffix: `-${sizes}` })
            icons.push({
              src,
              type,
              sizes,
              purpose: options.maskableIcon ? 'maskable any' : 'any'
            })
            const imageData = await sharp(options.icon)
              .resize(size, size)
              .toBuffer()
            compilation.emitAsset(src, {
              source: () => imageData,
              size: () => imageData.length
            })
          })
        )
        const defaultManifest = {
          start_url: '.',
          display: 'standalone',
          background_color: '#000000',
          icons,
          name: options.name,
          short_name: options.name,
          theme_color: options.themeColor
        }
        const outputManifest = JSON.stringify(
          Object.assign(defaultManifest, options.manifestOptions)
        )
        logger.info('Writing manifest to ' + manifestDest)
        compilation.emitAsset(manifestDest, {
          source: () => outputManifest,
          size: () => outputManifest.length
        })
      })
    })
  }
}
