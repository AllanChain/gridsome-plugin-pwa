const workboxModes = ['GenerateSW', 'InjectManifest']

// https://github.com/gridsome/gridsome/blob/2538985/gridsome/lib/webpack/utils.js#L5
const essentialExclude = [
  /styles(\.\w{8})?\.js$/,
  /manifest\/client.json$/
]

const defaultExclude = [
  /assets\/icons/
]

module.exports = (siteName, workboxPluginMode, workboxOptions) => {
  if (!workboxModes.includes(workboxPluginMode)) {
    throw new Error(
      `${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
      `Valid modes are: ${workboxModes}`
    )
  }

  const defaultGenerateSWOptions = workboxPluginMode === 'GenerateSW'
    ? { cacheId: siteName }
    : {}

  const workBoxConfig = Object.assign(defaultGenerateSWOptions, workboxOptions)

  workBoxConfig.exclude = workBoxConfig.exclude
    ? essentialExclude.concat(workBoxConfig.exclude)
    : essentialExclude.concat(defaultExclude)

  return workBoxConfig
}
