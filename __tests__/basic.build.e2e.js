const fs = require('fs')

const {
  distLocator,
  build,
  useContext,
  launchAndLighthouse
} = require('./build-utils')

const dist = distLocator('basic', 'gridsome')
useContext('basic')

beforeAll(build, 60000)

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
    expect(manifest.icons).toContainEqual({
      src: '/gridsome/assets/icons/android-chrome-192x192.png',
      type: 'image/png',
      sizes: '192x192',
      purpose: 'maskable any'
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
})

describe('real browser', () => {
  let consoleOutput, httpResponse, result
  beforeAll(async () => {
    ({ consoleOutput, httpResponse, result } = await launchAndLighthouse({
      directory: './',
      publicPath: '/gridsome/',
      lighthouseConfig: {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['pwa']
        }
      },
      lighthouseOpts: {}
    }))
  }, 10000)
  it('runs without error', () => {
    const consoleOutputError = consoleOutput
      .filter(message => message.type() === 'error')
      .map(message => message.text())
    expect(consoleOutputError).toHaveLength(0)
  })
  it('registers sw successfully', () => {
    const consoleOutputText = consoleOutput.map(message => message.text())
    expect(consoleOutputText).toContain('Service worker has been registered.')
    expect(consoleOutputText).toContain('Content has been cached for offline use.')
    expect(httpResponse.some(r => r.fromServiceWorker())).toBe(true)
  })

  const meaningfulAudits = [
    'service-worker',
    'installable-manifest',
    'apple-touch-icon',
    'splash-screen',
    'themed-omnibox',
    'maskable-icon'
  ]
  for (const audit of meaningfulAudits) {
    it(`has ${audit}`, () => expect(result.lhr.audits[audit].score).toBe(1))
  }
})
