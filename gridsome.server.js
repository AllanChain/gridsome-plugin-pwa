const path = require('path')

const handleManifestAndClient = async (api, options) => {
  const { parseIconAndManifest } = require('./lib/parseIconAndManifest')
  const { manifest, clientOptions } = await parseIconAndManifest(
    api._app, options
  )
  api.setClientOptions({
    ...options,
    ...clientOptions,
    publicPath: api.config.publicPath
  })
  return manifest
}

function Plugin (api, options) {
  options = Object.assign({ name: api.config.siteName }, options)

  // shared between webpack and workbox config
  let workboxConfig, compileOptions

  if (process.env.NODE_ENV === 'production') {
    const generateWorkboxConfig = require('./lib/generateWorkboxConfig');
    ({ workboxConfig, compileOptions } = generateWorkboxConfig(
      api.config,
      options
    ))
  }

  api.chainWebpack(async (webpackConfig, { isServer, isProd }) => {
    if (isServer) return

    const ManifestPlugin = require('./lib/manifestPlugin')
    const manifest = await handleManifestAndClient(api, options)
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
    console.log(`[PWA] Precache ${count} files, totaling ${size} bytes.`)
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
