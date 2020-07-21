const path = require('path')
const fs = require('fs')

const context = path.join(__dirname, '..', 'examples', 'basic')
const dist = (...file) => path.join(context, 'dist', ...file)

process.chdir(context)

const build = require(path.join(
  context, 'node_modules', 'gridsome', 'lib', 'build.js'
))

beforeAll(async () => {
  await build(context)
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
      src: 'assets/icons/favicon-192x192.png',
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
  const icon = dist('assets', 'icons', 'favicon-192x192.png')
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
  it('does not ignore default if configured', () => {
    expect(swContent).toMatch('assets/icons')
  })
  it('includes prefetch assets', () => {
    expect(swContent).toMatch('/gridsome/assets/js/app')
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
