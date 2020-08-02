const {
  iconType,
  expandIconConfig,
  parseIconAndManifest
} = require('../lib/parseIconAndManifest')
const { defaultOptions } = require('../gridsome.server')
const defaultsDeep = require('lodash/defaultsDeep')
const { useContext } = require('./utils')

const fakeConfig = {
  icon: { favicon: { src: './src/favicon.png' } },
  publicPath: '/gridsome/'
}

const expand = config => expandIconConfig(config, './src/favicon.png')

const parse = userOptions => parseIconAndManifest(
  fakeConfig,
  Object.assign(
    { name: 'Awesome Gridsome' },
    defaultsDeep(userOptions, defaultOptions())
  )
)

useContext()

describe('helper function iconType', () => {
  it('gets correct type', () => {
    expect(iconType('./src/favicon.ico')).toBe('ico')
  })
  it('works on multiple dots', () => {
    expect(iconType('./src/fav.a.b.c.png')).toBe('png')
  })
})

describe('helper function expandIconConfig', () => {
  it('throws gracefully on bad config', () => {
    expect(() => expand({ androidChrome: 23 }))
      .toThrow('Unrecognized')
  })
  it('works with a string', () => {
    const config = expand('favicon.ico')
    expect(config.msTileImage.src).toBe('favicon.ico')
    expect(config.androidChrome.name).toBe('android-chrome')
  })
  it('works if androiidChrome is a string', () => {
    const config = expand({ androidChrome: 'favicon.ico' })
    expect(config.androidChrome.src).toBe('favicon.ico')
    expect(config.msTileImage.src).toBe('./src/favicon.png')
  })
})

describe('Generate Manifest', () => {
  it('works with zero config', () => {
    expect(parse({}).manifest.name).toBe('Awesome Gridsome')
  })
  it('does no have double slashes', () => {
    expect(JSON.stringify(parse({}).manifest)).not.toMatch('//')
  })
  it('gets correct icon type', () => {
    expect(parse({}).manifest.icons[0].type).toBe('image/png')
  })
  it('throws error if icon not found', () => {
    expect(() => parse({ icon: 'src/not.exist.png' }))
      .toThrow('not found')
  })
  it('throws if urls and sizes not match', () => {
    expect(() => parse({
      icon: { androidChrome: { sizes: [], urls: ['/fav.ico'] } }
    })).toThrow('not match')
  })
})

describe('client options', () => {
  it('returns correct by default', () => {
    const clientOptions = parse({}).clientOptions
    expect(clientOptions.msTileImage)
      .toBe('/gridsome/assets/icons/msapplication-icon-144x144.png')
    expect(clientOptions.appleMaskIcon).toBe(null)
  })
  it('respects provided', () => {
    expect(parse({
      icon: { appleMaskIcon: { url: './safari-pinned-tab.svg' } }
    }).clientOptions.appleMaskIcon).toBe('./safari-pinned-tab.svg')
  })
})
