const rename = require('rename')

module.exports = options => {
  const iconsDir = 'assets/icons/'
  const iconName = options.icon.split('/').slice(-1)[0]
  const type = 'image/' + iconName.split('.').slice(-1)[0]

  // Generate all size images from options.icon
  const allSizes = [512, 384, 192, 180, 152, 144, 128, 120, 96, 72, 48, 16]

  const icons = allSizes.map((size) => ({
    src: iconsDir + rename(iconName, { suffix: `-${size}x${size}` }),
    type,
    sizes: `${size}x${size}`,
    purpose: options.maskableIcon ? 'maskable any' : 'any'
  }))

  const defaultManifest = {
    icons,
    name: options.name,
    short_name: options.name,
    theme_color: options.themeColor
  }
  return Object.assign(defaultManifest, options.manifestOptions)
}
