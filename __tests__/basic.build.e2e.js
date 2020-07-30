const fs = require('fs')

const { dist, build } = require('./utils')

beforeAll(async () => {
  await build()
}, 60000)

describe('manifest.json', () => {
  const manifestFilePath = dist('manifest.json')
  let manifest
  it('exists', () => {
    expect(fs.existsSync(manifestFilePath)).toBeTruthy()
    manifest = JSON.parse(fs.readFileSync(manifestFilePath))
  })
  it('contains configured fields', () => {
    expect(manifest.short_name).toBe('Gridsome')
    expect(manifest.start_url).toBe('/')
    expect(manifest.icons).toBeInstanceOf(Array)
    expect(manifest.icons).toContainEqual({
      src: '/gridsome/assets/icons/android-chrome-192x192.png',
      type: 'image/png',
      sizes: '192x192',
      purpose: 'any'
    })
  })
  it('honors default options', () => {
    expect(manifest.name).toBe('Awesome Gridsome')
    expect(manifest.background_color).toBe('#000000')
    expect(manifest.theme_color).toBe('#00a672')
  })
})

describe('icon', () => {
  const icon = dist('assets', 'icons', 'android-chrome-192x192.png')
  it('exists', () => {
    expect(fs.existsSync(icon)).toBeTruthy()
  })
  it('has reasonable size', () => {
    expect(fs.statSync(icon).size).toBeGreaterThan(30000)
  })
})

describe('sevice worker', () => {
  const sw = dist('service-worker.js')
  let swContent
  it('exists', () => {
    expect(fs.existsSync(sw)).toBeTruthy()
    swContent = fs.readFileSync(sw, 'utf8')
  })
  it('uses correct cache id', () => {
    expect(swContent).toMatch('setCacheNameDetails({prefix:"awesome-pwa"})')
  })
  it('does essential ignore', () => {
    expect(swContent).not.toMatch('client.json')
    expect(swContent).not.toMatch('js/style')
  })
  it('does configured ignore', () => {
    expect(swContent).not.toMatch('manifest.json')
  })
  it('includes prefetch assets', () => {
    expect(swContent).toMatch('/gridsome/assets/js/app')
    expect(swContent).toMatch('/gridsome/index.html')
  })
  it('uses skip waiting', () => {
    expect(swContent).toMatch('skipWaiting()')
  })
})

describe('meta', () => {
  it('has correct path in index.html', () => {
    const indexContent = fs.readFileSync(dist('index.html'), 'utf8')
    expect(indexContent).toMatch('rel="manifest" href="/gridsome/manifest.json"')
  })
  it('has correct path in about/', () => {
    const indexContent = fs.readFileSync(dist('about', 'index.html'), 'utf8')
    expect(indexContent).toMatch('rel="manifest" href="/gridsome/manifest.json"')
  })
})
