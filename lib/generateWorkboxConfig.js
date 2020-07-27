const path = require('path')

const workboxModes = ['generateSW', 'injectManifest']

module.exports = (config, workboxPluginMode, workboxOptions) => {
  if (!workboxModes.includes(workboxPluginMode)) {
    throw new Error(
      `${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
      `Valid modes are: ${workboxModes}`
    )
  }

  const defaultWorkboxOptions = {
    modifyURLPrefix: { '': config.publicPath },
    globDirectory: config.outputDir,
    globPatterns: ['assets/@(js|css)/*'],
    swDest: path.join(config.outputDir, 'service-worker.js')
  }

  if (workboxPluginMode === 'generateSW') {
    Object.assign(defaultWorkboxOptions, {
      cacheId: config.siteName,
      sourcemap: false
    })
  }

  const workboxConfig = Object.assign(defaultWorkboxOptions, workboxOptions)

  let compileOptions = false
  if (workboxPluginMode === 'injectManifest') {
    compileOptions = {
      swSrc: workboxConfig.swSrc,
      swDest: path.relative(config.outputDir, workboxConfig.swDest)
    }
    // inject manifest derectly into compiled sw
    workboxConfig.swSrc = workboxConfig.swDest
  }

  return {
    workboxConfig,
    compileOptions
  }
}
