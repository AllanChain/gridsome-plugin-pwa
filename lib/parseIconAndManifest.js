const path = require('path')
const { existsSync } = require('fs')

const defaultIconConfig = src => ({
  androidChrome: [{ // a.k.a icons in manifest.json
    src,
    sizes: [512, 384, 192, 144, 96, 72, 48],
    purpose: 'any',
    urls: null
  }],
  msTileImage: {
    src,
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

const translateInnerIconConfig = (value) => {
  if (typeof value === 'object') return value
  if (typeof value === 'string') return { src: value }
  if (typeof value === 'undefined') return
  throw new Error(`Unrecognized icon value: ${value}`)
}

const expandInnerIconConfig = (defaultConfig, value) => ({
  ...defaultConfig,
  ...translateInnerIconConfig(value)
})

const expandIconConfig = (config, defaultSrc) => {
  if (typeof config === 'undefined') return defaultIconConfig(defaultSrc)
  if (typeof config === 'string') return defaultIconConfig(config)
  if (typeof config === 'object') {
    const defaultConfig = defaultIconConfig(defaultSrc)
    const resultConfig = {}
    for (const key in defaultConfig) {
      const value = config[key]
      if (key === 'androidChrome') {
        let wrapValue = value
        if (Array.isArray(value)) {
          if (value.length === 0) {
            throw new Error(`Value for ${key} must not be an empty array`)
          }
        } else wrapValue = [value]
        resultConfig[key] = wrapValue.map(value =>
          expandInnerIconConfig(defaultConfig[key][0], value))
      } else {
        resultConfig[key] = expandInnerIconConfig(defaultConfig[key], value)
      }
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
  await Promise.all(iconConfig.androidChrome.map(async chromeIcon => {
    if (chromeIcon.urls) {
      if (chromeIcon.urls.length !== chromeIcon.sizes.length) {
        throw new Error('Android Chrome urls and sizes not match')
      }
      icons = chromeIcon.urls.map((url, i) => {
        const size = chromeIcon.sizes[i]
        return {
          src: url,
          type: 'image/' + url.split('.').slice(-1)[0],
          sizes: `${size}x${size}`,
          purpose: chromeIcon.purpose
        }
      })
    } else {
      checkIcon(chromeIcon.src)
      const chromeIcons = await assets.add(
        path.resolve(context, chromeIcon.src),
        { imageWidths: chromeIcon.sizes }
      )
      icons = chromeIcons.sets.map(set => ({
        src: set.src,
        type: chromeIcons.mimeType,
        sizes: `${set.width}x${set.width}`,
        purpose: chromeIcon.purpose
      }))
    }
  }))
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
