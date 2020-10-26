const path = require('path')

const workboxModes = ['generateSW', 'injectManifest']

module.exports = (config, options) => {
  if (!workboxModes.includes(options.workboxPluginMode)) {
    throw new Error(
      `${options.workboxPluginMode} is not a supported Workbox ` +
      `webpack plugin mode. Valid modes are: ${workboxModes}`
    )
  }

  const defaultWorkboxOptions = {
    modifyURLPrefix: { '': config.publicPath },
    globDirectory: config.outputDir,
    globPatterns: ['assets/@(js|css)/*'],
    swDest: path.join(config.outputDir, 'service-worker.js')
  }

  if (options.workboxPluginMode === 'generateSW') {
    Object.assign(defaultWorkboxOptions, {
      cacheId: config.siteName,
      sourcemap: false
    })
  }

  const workboxConfig = Object.assign(
    defaultWorkboxOptions,
    options.workboxOptions
  )

  let compileOptions = false
  if (
    options.workboxPluginMode === 'injectManifest' &&
    options.workboxCompileSrc
  ) {
    compileOptions = {
      swSrc: workboxConfig.swSrc,
      swDest: path.relative(config.outputDir, workboxConfig.swDest),
      // Will apply as compilation plugin if is array
      webpackCompilationPlugins: options.workboxCompileSrc
    }
    // inject manifest derectly into compiled sw
    workboxConfig.swSrc = workboxConfig.swDest
  }

  return {
    workboxConfig,
    compileOptions
  }
}
