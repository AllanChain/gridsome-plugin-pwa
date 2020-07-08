const ManifestPlugin = require('./lib/manifestPlugin')
const createNoopServiceWorkerMiddleware = require('./lib/noopServiceWorkerMiddleware')

function Plugin (api, options) {
  api.chainWebpack((webpackConfig, { isServer, isProd }) => {
    if (isServer) return

    webpackConfig
      .plugin('pwa-manifest')
      .use(ManifestPlugin, [{ name: api.config.siteName, ...options }])

    // generate /service-worker.js in production mode
    if (isProd) {
      const workboxPluginMode = options.workboxPluginMode
      const workboxWebpackModule = require('workbox-webpack-plugin')

      if (!(workboxPluginMode in workboxWebpackModule)) {
        throw new Error(
          `${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
          `Valid modes are: ${Object.keys(workboxWebpackModule).join(', ')}`
        )
      }

      const essentialExclude = [
        // https://github.com/gridsome/gridsome/blob/2538985/gridsome/lib/webpack/utils.js#L5
        /styles(\.\w{8})?\.js$/,
        /manifest\/client.json$/
      ]

      const defaultExclude = [
        /assets\/icons/
      ]

      const defaultGenerateSWOptions = workboxPluginMode === 'GenerateSW' ? {
        cacheId: api.config.siteName
      } : {}

      const workBoxConfig = Object.assign(defaultGenerateSWOptions, options.workboxOptions)

      workBoxConfig.exclude = workBoxConfig.exclude
        ? essentialExclude.concat(workBoxConfig.exclude)
        : essentialExclude.concat(defaultExclude)

      webpackConfig
        .plugin('workbox')
        .use(workboxWebpackModule[workboxPluginMode], [workBoxConfig])
    }
  })

  api.configureServer(app => {
    app.use(createNoopServiceWorkerMiddleware())
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
