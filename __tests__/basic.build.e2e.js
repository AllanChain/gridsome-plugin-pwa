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
  it('exists', () => {
    expect(fs.existsSync(manifestFilePath)).toBeTruthy()
  })
  it('contains configured fields', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestFilePath))
    expect(manifest.name).toBe('Awesome Gridsome')
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
  it('exists', () => {
    expect(fs.existsSync(sw)).toBeTruthy()
  })
  const swContent = fs.readFileSync(sw, 'utf8')
  it('uses correct cache id', () => {
    expect(swContent).toMatch('setCacheNameDetails({prefix:"awesome-pwa"})')
  })
  it('ignores correctly', () => {
    expect(swContent).not.toMatch('client.json')
    expect(swContent).not.toMatch('manifest.json')
    expect(swContent).not.toMatch('js/style')
  })
  it('includes prefetch assets', () => {
    expect(swContent).toMatch('/assets/js/app')
  })
  it('uses skip waiting', () => {
    expect(swContent).toMatch('skipWaiting()')
  })
})
