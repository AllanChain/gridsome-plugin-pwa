module.exports = function (Vue, options, { head }) {
  head.link.push({
    rel: 'manifest',
    href: options.publicPath + options.manifestPath
  })

  if (options.appleMaskIcon && options.appleMaskIconColor) {
    head.link.push({
      rel: 'mask-icon',
      href: options.appleMaskIcon,
      color: options.appleMaskIconColor || options.themeColor
    })
  }

  // Apple touch icon is handled by gridsome.

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
    content: options.name
  })

  head.meta.push({
    name: 'msapplication-TileColor',
    content: options.msTileColor
  })

  head.meta.push({
    name: 'msapplication-TileImage',
    content: options.msTileImage
  })
}
