const clientConfig = function (Vue, options, { head }) {
  const iconsDir = options.pathPrefix + 'assets/icons/'
  const iconName = options.icon.split('/').slice(-1)[0]
  const msTileImage = `${iconsDir}${iconName}-144x144.png`

  head.link.push({
    rel: 'manifest',
    href: options.pathPrefix + options.manifestPath
  })

  if (options.svgFavicon) {
    var emptyIcon = head.link.find(x => x.rel === 'icon' && x.href === 'data:,')
    if (emptyIcon) {
      const index = head.link.indexOf(emptyIcon)
      head.link.splice(index, 1)
    }

    head.link.push({
      rel: 'icon',
      type: 'image/svg+xml',
      href: options.svgFavicon
    })

    head.link.push({
      rel: 'alternate icon',
      href: 'favicon.ico'
    })
  }

  if (options.appleMaskIcon && options.appleMaskIconColor) {
    head.link.push({
      rel: 'mask-icon',
      href: options.appleMaskIcon,
      color: options.appleMaskIconColor || options.themeColor
    })
  }

  head.meta.push({
    name: 'theme-color',
    content: options.themeColor
  })

  head.meta.push({
    name: 'apple-mobile-web-app-capable',
    content: options.appleMobileWebAppCapable
  })

  head.meta.push({
    name: 'apple-mobile-web-app-status-bar-style',
    content: options.appleMobileWebAppStatusBarStyle
  })

  head.meta.push({
    name: 'apple-mobile-web-app-title',
    content: options.name
  })

  head.meta.push({
    name: 'application-name',
    content: options.title
  })

  if (options.msTileColor) {
    head.meta.push({
      name: 'msapplication-TileColor',
      content: options.msTileColor
    })
  }

  head.meta.push({
    name: 'msapplication-TileImage',
    content: msTileImage
  })
}

export default clientConfig
