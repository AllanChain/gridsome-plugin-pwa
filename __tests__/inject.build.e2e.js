const fs = require('fs')

const { dist, build } = require('./utils')

beforeAll(async () => {
  process.env.PWA_OPTIONS = 'injectManifest'
  await build()
}, 60000)

afterAll(() => {
  process.env.PWA_OPTIONS = ''
})

describe('sevice worker', () => {
  const sw = dist('service-worker.js')
  let swContent
  it('exists', () => {
    expect(fs.existsSync(sw)).toBeTruthy()
    swContent = fs.readFileSync(sw, 'utf8')
  })
  it('has reasonable size', () => {
    expect(fs.statSync(sw).size).toBeGreaterThan(10000)
  })
  it('includes original code', () => {
    expect(swContent).toMatch('/gridsome/index.html')
  })
  it('injects manfest', () => {
    expect(swContent).toMatch('')
  })
})
