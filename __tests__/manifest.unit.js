const path = require('path')
const {
  expandIconConfig,
  parseIconAndManifest
} = require('../lib/parseIconAndManifest')
const { defaultOptions } = require('../gridsome.server')
const defaultsDeep = require('lodash/defaultsDeep')
const { useContext } = require('./build-utils')

const expand = config => expandIconConfig(config, './src/favicon.png')

const parse = async userOptions => await parseIconAndManifest(
  process.GRIDSOME,
  Object.assign(
    { name: 'Awesome Gridsome' },
    defaultsDeep(userOptions, defaultOptions())
  )
)

useContext('basic')
beforeAll(() => {
  const createApp = require(path.join(
    process.cwd(), 'node_modules', 'gridsome', 'lib', 'app')
  )
  // Make expected path prefix
  process.env.NODE_ENV = 'production'
  createApp(process.cwd())
})
afterAll(() => {

})

describe('helper function expandIconConfig', () => {
  it('throws gracefully on bad config', () => {
    expect(() => expand({ androidChrome: 23 }))
      .toThrow('Unrecognized')
  })
  it('works with a string', () => {
    const config = expand('favicon.ico')
    expect(config.msTileImage.src).toBe('favicon.ico')
    expect(config.androidChrome[0].src).toBe('favicon.ico')
    expect(config.androidChrome[0].purpose).toBe('any')
  })
  it('works if androidChrome is a string', () => {
    const config = expand({ androidChrome: 'favicon.ico' })
    expect(config.androidChrome[0].src).toBe('favicon.ico')
    expect(config.androidChrome[0].purpose).toBe('any')
    expect(config.msTileImage.src).toBe('./src/favicon.png')
  })
  it('works if androidChrome is an array', () => {
    const config = expand({
      androidChrome: [
        { src: 'favicon.ico', purpose: 'maskable' },
        { src: 'favicon-maskable.png', purpose: 'any' }
      ]
    })
    expect(config.androidChrome[0].src).toBe('favicon.ico')
    expect(config.androidChrome[1].src).toBe('favicon-maskable.png')
    expect(config.msTileImage.src).toBe('./src/favicon.png')
  })
})

describe('Generate Manifest', () => {
  it('works with zero config', async () => {
    const { manifest } = await parse({})
    expect(manifest.name).toBe('Awesome Gridsome')
    expect(JSON.stringify(manifest)).not.toMatch('//')
    expect(JSON.stringify(manifest)).not.toMatch('undefined')
    expect(manifest.icons[0].type).toBe('image/png')
  })
  it('throws error if icon not found', async () => {
    await expect(parse({ icon: 'src/not.exist.png' }))
      .rejects.toThrow('not found')
  })
  it('throws if urls and sizes not match', async () => {
    await expect(parse({
      icon: { androidChrome: { sizes: [], urls: ['/fav.ico'] } }
    })).rejects.toThrow('not match')
  })
})

describe('client options', () => {
  it('returns correct by default', async () => {
    const clientOptions = (await parse({})).clientOptions
    expect(clientOptions.msTileImage)
      .toBe('/gridsome/assets/static/favicon.d8f1621.test.png')
    expect(clientOptions.appleMaskIcon).toBe(null)
  })
  it('respects provided', async () => {
    expect((await parse({
      icon: { appleMaskIcon: { url: './safari-pinned-tab.svg' } }
    })).clientOptions.appleMaskIcon).toBe('./safari-pinned-tab.svg')
  })
})
