const generateWorkboxConfig = require('../lib/generateWorkboxConfig')
const { defaultOptions } = require('../gridsome.server')
const defaultsDeep = require('lodash/defaultsDeep')

const workbox = userOptions => {
  const options = defaultsDeep(userOptions, defaultOptions())
  return generateWorkboxConfig(
    'Awesome Gridsome',
    options.workboxPluginMode,
    options.workboxOptions
  )
}

describe('Generate Workbox Config', () => {
  it('works with zero config', () => {
    const config = workbox({})
    expect(config.cacheId).toBe('Awesome Gridsome')
    expect(config.exclude.length).toBe(3)
  })
  it('throws error on unknown mode', () => {
    expect(() => workbox({ workboxPluginMode: 'InhectManidfet' }))
      .toThrow('is not a supported')
  })
  it('takes config', () => {
    expect(workbox({ workboxOptions: { skipWaiting: true } }).skipWaiting)
      .toBeTruthy()
  })
  it('should be able to use InjectManifest', () => {
    const config = workbox({
      workboxPluginMode: 'InjectManifest',
      workboxOptions: {
        swSrc: 'src/sw.js'
      }
    })
    expect(config).toEqual({ swSrc: 'src/sw.js' })
  })
})
