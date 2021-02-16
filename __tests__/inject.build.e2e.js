const fs = require('fs')

const { distLocator, build, useContext } = require('./build-utils')

const dist = distLocator('inject', 'dist')
useContext('inject')

beforeAll(async () => {
  await build('inject')
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
  it('splits chunk', () => {
    expect(swContent).toMatch('importScripts')
    expect(fs.statSync(sw).size).toBeGreaterThan(4000)
    expect(fs.statSync(sw).size).toBeLessThan(20000)
  })
  it('includes original code', () => {
    expect(swContent).toMatch('/index.html')
  })
  it('injects manfest', () => {
    expect(swContent).toMatch(/"revision":"[\da-f]+"/)
  })
})
