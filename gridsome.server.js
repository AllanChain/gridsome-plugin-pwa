const path = require('path')
function Plugin (api, options) {
  options = Object.assign({ name: api.config.siteName }, options)

  let manifest, clientOptions
  const { parseIconAndManifest } = require('./lib/parseIconAndManifest')
  // Ensure set client option before generate temporary code
  api._app.hooks.beforeBootstrap.tapPromise(
    'GridsomePWAParse',
    async () => {
      ({ manifest, clientOptions } = await parseIconAndManifest(
        api._app, options
      ))
      api.setClientOptions({
        ...options,
        ...clientOptions,
        publicPath: api.config.publicPath
      })
    }
  )

  // shared between webpack and workbox config
  let workboxConfig, compileOptions

  if (process.env.NODE_ENV === 'production') {
    const generateWorkboxConfig = require('./lib/generateWorkboxConfig');
    ({ workboxConfig, compileOptions } = generateWorkboxConfig(
      api.config,
      options
    ))
  }

  api.chainWebpack((webpackConfig, { isServer, isProd }) => {
    if (isServer) return

    const ManifestPlugin = require('./lib/manifestPlugin')
    webpackConfig
      .plugin('pwa-manifest')
      .use(ManifestPlugin, [options.manifestPath, manifest])

    if (isProd && compileOptions) {
      const compileSWPlugin = require('./lib/compileSWPlugin')
      webpackConfig
        .plugin('compile-sw')
        .use(compileSWPlugin, [compileOptions])
    }
  })

  api.afterBuild(async () => {
    if (options.appShellPath) {
      const patchAppShell = require('./lib/appShellPatcher')
      patchAppShell(path.resolve(api.config.outputDir, options.appShellPath))
    }
    const workboxBuildModule = require('workbox-build')
    const workboxBuildFunc = workboxBuildModule[options.workboxPluginMode]
    const { count, size } = await workboxBuildFunc(workboxConfig)
    // eslint-disable-next-line no-console
    console.log(`Precache ${count} files, totaling ${size} bytes.`)
  })

  api.configureServer(app => {
    app.use(require('./lib/noopServiceWorkerMiddleware')())
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
  maskableIcon: false,
  msTileColor: '#00a672',
  workboxPluginMode: 'generateSW',
  workboxCompileSrc: true,
  workboxOptions: {},
  appShellPath: null
})

module.exports = Plugin
