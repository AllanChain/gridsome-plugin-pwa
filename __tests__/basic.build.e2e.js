const fs = require('fs')

const { useBuild } = require('./build-utils')

const dist = useBuild('basic', 'gridsome')

describe('manifest.json', () => {
  const manifestFilePath = dist('manifest.json')
  let manifest
  it('exists', () => {
    expect(fs.existsSync(manifestFilePath)).toBeTruthy()
    manifest = JSON.parse(fs.readFileSync(manifestFilePath))
  })
  it('contains configured fields', () => {
    expect(manifest.short_name).toBe('Gridsome')
    expect(manifest.start_url).toBe('.')
    expect(manifest.icons).toBeInstanceOf(Array)
    expect(manifest.icons).toHaveLength(5)
    expect(manifest.icons).toContainEqual({
      src: '/gridsome/assets/static/favicon-maskable.cbda223.test.png',
      sizes: '512x512',
      purpose: 'maskable',
      type: 'image/png'
    })
  })
  it('honors default options', () => {
    expect(manifest.name).toBe('Awesome Gridsome')
    expect(manifest.background_color).toBe('#000000')
    expect(manifest.theme_color).toBe('#00a672')
  })
})

describe('icon', () => {
  const icon = dist('assets', 'static', 'favicon-maskable.9b6f2f7.test.png')
  it('exists', () => {
    expect(fs.existsSync(icon)).toBeTruthy()
  })
  it('has reasonable size', () => {
    expect(fs.statSync(icon).size).toBeGreaterThan(1000)
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
    expect(swContent).toMatch('/gridsome/offline/index.html')
  })
  it('uses skip waiting', () => {
    expect(swContent).toMatch('skipWaiting()')
  })
  it('does not have unexpected content', () => {
    expect(swContent).not.toMatch('undefined')
    expect(swContent).not.toMatch('//')
  })
})

describe('meta', () => {
  let indexContent, aboutContent
  it('exists', () => {
    indexContent = fs.readFileSync(dist('index.html'), 'utf8')
    aboutContent = fs.readFileSync(dist('about', 'index.html'), 'utf8')
  })
  it('has correct path in index.html', () => {
    expect(indexContent).toMatch('rel="manifest" href="/gridsome/manifest.json"')
  })
  it('has correct path in about/', () => {
    expect(aboutContent).toMatch('rel="manifest" href="/gridsome/manifest.json"')
  })
  it('has mask icon', () => {
    expect(indexContent).toMatch('rel="mask-icon')
  })
  it('does not have unexpected content', () => {
    expect(indexContent).not.toMatch('undefined')
    expect(aboutContent).not.toMatch('//')
  })
})
