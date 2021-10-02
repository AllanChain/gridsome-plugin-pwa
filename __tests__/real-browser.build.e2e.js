const { useBrowser, useTrueBuild, useContext } = require('./build-utils')
const desktopConfig = require('lighthouse/lighthouse-core/config/desktop-config')

const audits = [
  'service-worker',
  'installable-manifest',
  'apple-touch-icon',
  'splash-screen',
  'themed-omnibox',
  'maskable-icon'
]
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['pwa']
  },
  audits
}
const port = 3000

const CONFIGS = {
  basic: {
    name: 'basic',
    publicPath: '/gridsome/',
    lighthouseConfig: { ...desktopConfig, audits }
  },
  basicMobile: {
    name: 'basic',
    publicPath: '/gridsome/',
    lighthouseConfig
  },
  inject: {
    name: 'inject',
    directory: 'dist',
    lighthouseConfig
  }
}

useTrueBuild('basic', 'gridsome')
useTrueBuild('inject', 'dist')

for (const configName in CONFIGS) {
  describe(`${configName} in real browser`, () => {
    useContext(CONFIGS[configName].name)
    const { directory = './' } = CONFIGS[configName]
    const browserFixture = useBrowser(directory, port)
    const consoleOutput = []
    const httpResponse = []
    let result
    beforeAll(async () => {
      const lighthouse = require('lighthouse')
      const { browser } = browserFixture
      const {
        publicPath = '/',
        lighthouseConfig,
        lighthouseOpts = {}
      } = CONFIGS[configName]
      const url = `http://localhost:${port}${publicPath}`

      for (let _ = 0; _ < 2; _++) { // simulate open again
        const page = await browser.newPage()
        page.on('console', consoleOutput.push.bind(consoleOutput))
        page.on('response', httpResponse.push.bind(httpResponse))
        await page.goto(url, { waitUntil: 'networkidle0' })
        await page.close()
      }
      lighthouseOpts.port = new URL(browser.wsEndpoint()).port
      result = await lighthouse(url, lighthouseOpts, lighthouseConfig)
    }, 30000)
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
    for (const audit of audits) {
      it(`has ${audit}`, () => expect(result.lhr.audits[audit].score).toBe(1))
    }
  })
}

describe('app shell of inject', () => {
  useContext('inject')
  const browserFixture = useBrowser('dist', port)
  const url = `http://localhost:${port}/`
  const blogUrl = `http://localhost:${port}/blog/say-hello-to-gridsome/`
  beforeAll(async () => { // cache pwa
    const { browser } = browserFixture
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.close()
  })
  it('runs app shell without error', async () => {
    const { browser } = browserFixture
    const consoleOutput = []
    const httpResponse = []
    const page = await browser.newPage()
    page.on('console', consoleOutput.push.bind(consoleOutput))
    page.on('response', httpResponse.push.bind(httpResponse))
    await page.goto(blogUrl, { waitUntil: 'networkidle0' })
    expect(consoleOutput
      .filter(message => message.type() === 'error')
      .map(message => message.text())
    ).toHaveLength(0)
    // First response is always document
    expect(httpResponse[0].fromServiceWorker()).toBe(true)
    const html = await httpResponse[0].text()
    expect(html).toMatch('html')
    expect(html).not.toMatch('Gatsby')
    expect(html).not.toMatch('data-server-rendered')
    expect(html).not.toMatch('data-html-server-rendered')
    const contentText = await page.$eval('#content', el => el.innerText)
    expect(contentText).toMatch('Gatsby')
    await page.close()
  })
})

describe('app shell of basic', () => {
  useContext('basic')
  const browserFixture = useBrowser('./', port)
  const aboutUrl = `http://localhost:${port}/gridsome/about/`
  beforeAll(async () => { // cache pwa
    const { browser } = browserFixture
    const page = await browser.newPage()
    await page.goto(aboutUrl, { waitUntil: 'networkidle0' })
    await page.close()
  })
  it('runs app shell without error', async () => {
    const { browser } = browserFixture
    const httpResponse = []
    const page = await browser.newPage()
    page.on('response', httpResponse.push.bind(httpResponse))
    await page.goto(aboutUrl, { waitUntil: 'networkidle0' })
    // First response is always document
    expect(httpResponse[0].fromServiceWorker()).toBe(true)
    expect(await httpResponse[0].text()).toMatch('html')
    expect(await httpResponse[0].text()).not.toMatch('About us')
    await page.close()
  })
})
