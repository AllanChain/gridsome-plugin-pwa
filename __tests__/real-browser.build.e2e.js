const { launchAndLighthouse, useTrueBuild, useContext } = require('./build-utils')
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
  // audits
}

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
    let consoleOutput, httpResponse, result
    beforeAll(async () => {
      ({ consoleOutput, httpResponse, result } = await launchAndLighthouse(
        CONFIGS[configName]
      ))
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
