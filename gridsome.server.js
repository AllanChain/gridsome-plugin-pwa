const path = require('path')
const ManifestPlugin = require('./lib/manifestPlugin')
const createNoopServiceWorkerMiddleware = require('./lib/noopServiceWorkerMiddleware')

function Plugin (api, options) {
  api.chainWebpack((webpackConfig, context) => {
    if (context.isClient) {
      webpackConfig
        .plugin('pwa-manifest')
        .use(ManifestPlugin, [options])
    }
    // generate /service-worker.js in production mode
    if (process.env.NODE_ENV === 'production') {
      // Default to GenerateSW mode, though InjectManifest also might be used.
      const workboxPluginMode = options.workboxPluginMode || 'GenerateSW'
      const workboxWebpackModule = require('workbox-webpack-plugin')

      if (!(workboxPluginMode in workboxWebpackModule)) {
        throw new Error(
          `${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
          `Valid modes are: ${Object.keys(workboxWebpackModule).join(', ')}`
        )
      }

      const defaultOptions = {
        exclude: [
          /\.map$/,
          /img\/icons\//,
          /favicon\.ico$/,
          /^manifest.*\.js?$/
        ]
      }

      const defaultGenerateSWOptions = workboxPluginMode === 'GenerateSW' ? {
        cacheId: api.config.siteName
      } : {}

      const workBoxConfig = Object.assign(defaultOptions, defaultGenerateSWOptions, options.workboxOptions)

      webpackConfig
        .plugin('workbox')
        .use(workboxWebpackModule[workboxPluginMode], [workBoxConfig])
    }
  })

  api.configureServer(app => {
    app.use(createNoopServiceWorkerMiddleware())
  })

  const pathPrefix = api.config.pathPrefix + '/'

  api.setClientOptions({
    title: options.title,
    serviceWorkerPath: path.join(pathPrefix, options.serviceWorkerPath),
    manifestPath: path.join(pathPrefix, options.manifestPath),
    statusBarStyle: options.statusBarStyle,
    themeColor: options.themeColor,
    icon: options.icon,
    appleMaskIcon: options.appleMaskIcon,
    appleMaskIconColor: options.appleMaskIconColor,
    msTileColor: options.msTileColor,
    svgFavicon: options.svgFavicon
  })
}

Plugin.defaultOptions = () => ({
  title: 'Gridsome',
  startUrl: '/',
  display: 'standalone',
  statusBarStyle: 'default',
  manifestPath: 'manifest.json',
  serviceWorkerPath: 'service-worker.js',
  shortName: 'Gridsome',
  themeColor: '#666600',
  backgroundColor: '#ffffff',
  icon: '',
  msTileImage: '',
  msTileColor: '#666600',
  workboxOptions: {
    skipWaiting: true
  }
})

module.exports = Plugin
