const fs = require('fs')

const { distLocator, build, useContext } = require('./build-utils')

const dist = distLocator('inject', 'dist')
useContext('inject')

beforeAll(build, 60000)

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
  it('splits chunk', () => {
    expect(fs.statSync(sw).size).toBeGreaterThan(4000)
    expect(fs.statSync(sw).size).toBeLessThan(20000)
    expect(swContent).toMatch('importScripts')
  })
  it('includes original code', () => {
    expect(swContent).toMatch('/gridsome/index.html')
  })
  it('injects manfest', () => {
    expect(swContent).toMatch('')
  })
})
