const fs = require('fs')

const { useBuild } = require('./build-utils')

const dist = useBuild('inject', 'dist')

describe('sevice worker', () => {
  const sw = dist('service-worker.js')
  let swContent
  it('exists', () => {
    expect(fs.existsSync(sw)).toBeTruthy()
    swContent = fs.readFileSync(sw, 'utf8')
  })
  it('splits chunk', () => {
    expect(swContent).toMatch('importScripts')
    expect(fs.existsSync(dist('assets', 'js', 'sw-lib.js'))).toBe(true)
  })
  it('includes precache and navigation route', () => {
    expect(swContent.match(/"\/offline\/index\.html"/g)).toHaveLength(2)
  })
  it('injects manfest', () => {
    expect(swContent).toMatch(/"revision":"[\da-f]+"/)
  })
  it('applies DefinePlugin', () => {
    expect(swContent).not.toMatch('(APP_SHELL)')
  })
})
