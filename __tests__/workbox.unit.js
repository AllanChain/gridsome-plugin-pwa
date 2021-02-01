const path = require('path')
const generateWorkboxConfig = require('../lib/generateWorkboxConfig')
const { defaultOptions } = require('../gridsome.server')
const defaultsDeep = require('lodash/defaultsDeep')

const apiConfig = {
  siteName: 'Awesome Gridsome',
  outputDir: 'gridsome',
  publicPath: 'gridsome/'
}

const workbox = userOptions => {
  const options = defaultsDeep(userOptions, defaultOptions())
  return generateWorkboxConfig(apiConfig, options)
}

describe('Generate Workbox Config', () => {
  it('works with zero config', () => {
    const { workboxConfig, compileOptions } = workbox({})
    expect(workboxConfig.cacheId).toBe('Awesome Gridsome')
    expect(workboxConfig.swDest).toBe(path.join('gridsome', 'service-worker.js'))
    expect(compileOptions).toBe(false)
  })
  it('throws error on unknown mode', () => {
    expect(() => workbox({ workboxPluginMode: 'InhectManidfet' }))
      .toThrow('is not a supported')
  })
  it('takes config', () => {
    expect(
      workbox({ workboxOptions: { skipWaiting: true } })
        .workboxConfig.skipWaiting
    ).toBeTruthy()
  })
  it('should be able to use injectManifest', () => {
    const { workboxConfig, compileOptions } = workbox({
      workboxPluginMode: 'injectManifest',
      workboxOptions: {
        swSrc: './src/sw.js',
        swDest: 'gridsome/sw.js'
      }
    })
    expect(workboxConfig.swSrc).toBe('gridsome/sw.js')
    expect(compileOptions.swSrc).toBe('./src/sw.js')
    expect(compileOptions.swDest).toBe('sw.js')
  })
})
