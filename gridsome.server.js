function Plugin (api, options) {
  api.chainWebpack((webpackConfig, { isServer, isProd }) => {
    if (isServer) return

    const ManifestPlugin = require('./lib/manifestPlugin')
    webpackConfig
      .plugin('pwa-manifest')
      .use(ManifestPlugin, [{ name: api.config.siteName, ...options }])

    // generate /service-worker.js in production mode
    if (isProd) {
      const workboxWebpackModule = require('workbox-webpack-plugin')
      const generateWorkboxConfig = require('./lib/generateWorkboxConfig')
      webpackConfig
        .plugin('workbox')
        .use(
          workboxWebpackModule[options.workboxPluginMode],
          [generateWorkboxConfig(
            api.config.siteName,
            options.workboxPluginMode,
            options.workboxOptions
          )]
        )
    }
  })

  api.configureServer(app => {
    app.use(require('./lib/noopServiceWorkerMiddleware')())
  })

  api.setClientOptions({
    ...options,
    pathPrefix: api.config.pathPrefix + '/'
  })
}

Plugin.defaultOptions = () => ({
  appleMobileWebAppStatusBarStyle: 'default',
  appleMobileWebAppCapable: 'no',
  manifestPath: 'manifest.json',
  themeColor: '#00a672',
  manifestOptions: {
    start_url: '.',
    display: 'standalone',
    background_color: '#000000'
  },
  icon: 'src/favicon.png',
  maskableIcon: false,
  msTileColor: '#00a672',
  workboxPluginMode: 'GenerateSW',
  workboxOptions: {
    skipWaiting: true
  }
})

module.exports = Plugin
