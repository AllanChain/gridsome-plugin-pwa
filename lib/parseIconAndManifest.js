const path = require('path')
const { existsSync } = require('fs')

const defaultIconConfig = src => ({
  androidChrome: { // a.k.a icons in manifest.json
    src,
    name: 'android-chrome',
    sizes: [512, 384, 192, 144, 96, 72, 48],
    maskable: false,
    urls: null
  },
  msTileImage: {
    src,
    name: 'msapplication-icon',
    size: 144,
    url: null
  },
  appleMaskIcon: {
    url: null
  }
})

const checkIcon = icon => {
  if (!existsSync(icon)) {
    throw new Error(`Icon file "${icon}" not found in ${process.cwd()}`)
  }
}

const expandIconConfig = (config, defaultSrc) => {
  if (typeof config === 'undefined') return defaultIconConfig(defaultSrc)
  if (typeof config === 'string') return defaultIconConfig(config)
  if (typeof config === 'object') {
    const resultConfig = defaultIconConfig(defaultSrc)
    for (const key in resultConfig) {
      const value = config[key]
      if (typeof value === 'object') {
        Object.assign(resultConfig[key], value)
      } else if (typeof value === 'string') {
        Object.assign(resultConfig[key], { src: value })
      } else if (typeof value === 'undefined') continue
      else throw new Error(`Unrecognized icon value for ${key}: ${value}`)
    }
    return resultConfig
  }
  throw new Error(`Unrecognized icon config: ${config}`)
}

const parseIconAndManifest = async ({ assets, context, config }, options) => {
  const defaultSrc = config.icon.favicon.src
  const iconConfig = expandIconConfig(options.icon, defaultSrc)
  const clientOptions = {}

  let icons
  if (iconConfig.androidChrome.urls) {
    if (iconConfig.androidChrome.urls.length !== iconConfig.androidChrome.sizes.length) {
      throw new Error('Android Chrome urls and sizes not match')
    }
    icons = iconConfig.androidChrome.urls.map((url, i) => {
      const size = iconConfig.androidChrome.sizes[i]
      return {
        src: url,
        type: 'image/' + url.split('.').slice(-1)[0],
        sizes: `${size}x${size}`,
        purpose: iconConfig.androidChrome.maskable ? 'maskable any' : 'any'
      }
    })
  } else {
    checkIcon(iconConfig.androidChrome.src)
    const chromeIcons = await assets.add(
      path.resolve(context, iconConfig.androidChrome.src),
      { imageWidths: iconConfig.androidChrome.sizes }
    )
    icons = chromeIcons.sets.map(set => ({
      src: set.src,
      type: chromeIcons.mimeType,
      sizes: `${set.width}x${set.width}`,
      purpose: iconConfig.androidChrome.maskable ? 'maskable any' : 'any'
    }))
  }
  if (!iconConfig.msTileImage.url) {
    checkIcon(iconConfig.msTileImage.src)
    const msIcon = await assets.add(
      path.resolve(context, iconConfig.msTileImage.src),
      { imageWidths: [iconConfig.msTileImage.size] }
    )
    clientOptions.msTileImage = msIcon.src
  } else clientOptions.msTileImage = iconConfig.msTileImage.url

  clientOptions.appleMaskIcon = iconConfig.appleMaskIcon.url

  const defaultManifest = {
    icons,
    name: options.name,
    short_name: options.name,
    theme_color: options.themeColor
  }

  return {
    manifest: Object.assign(defaultManifest, options.manifestOptions),
    clientOptions
  }
}

module.exports = {
  expandIconConfig,
  parseIconAndManifest
}
