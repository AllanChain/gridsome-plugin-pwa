const { launchAndLighthouse, useTrueBuild } = require('./build-utils')

useTrueBuild('basic', 'gridsome')

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
