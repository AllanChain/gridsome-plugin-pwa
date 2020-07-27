function Plugin (api, options) {
  options = Object.assign({ name: api.config.siteName }, options)

  // shared between webpack and workbox config
  let workboxConfig, compileOptions

  if (process.env.NODE_ENV === 'production') {
    const generateWorkboxConfig = require('./lib/generateWorkboxConfig');
    ({ workboxConfig, compileOptions } = generateWorkboxConfig(
      api.config,
      options.workboxPluginMode,
      options.workboxOptions
    ))
  }

  api.chainWebpack((webpackConfig, { isServer, isProd }) => {
    if (isServer) return

    const ManifestPlugin = require('./lib/manifestPlugin')
    webpackConfig
      .plugin('pwa-manifest')
      .use(ManifestPlugin, [options])

    if (isProd && options.workboxPluginMode === 'injectManifest') {
      const compileSWPlugin = require('./lib/compileSWPlugin')
      webpackConfig
        .plugin('compile-sw')
        .use(compileSWPlugin, [compileOptions])
    }
  })

  api.afterBuild(async () => {
    const workboxBuildModule = require('workbox-build')
    const workboxBuildFunc = workboxBuildModule[options.workboxPluginMode]
    const { count, size } = await workboxBuildFunc(workboxConfig)
    console.log(`Precache ${count} files, totaling ${size} bytes.`)
  })

  api.configureServer(app => {
    app.use(require('./lib/noopServiceWorkerMiddleware')())
  })

  api.setClientOptions({
    ...options,
    publicPath: api.config.publicPath
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
  workboxPluginMode: 'generateSW',
  workboxOptions: {}
})

module.exports = Plugin
