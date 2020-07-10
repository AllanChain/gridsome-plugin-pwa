const path = require('path')
const generateManifest = require('../lib/generateManifest')
const { defaultOptions } = require('../gridsome.server')
const defaultsDeep = require('lodash/defaultsDeep')

const context = path.join(__dirname, '..', 'examples', 'basic')
process.chdir(context)

const manifest = userOptions => generateManifest({
  name: 'Awesome Gridsome',
  ...defaultsDeep(userOptions, defaultOptions())
})

describe('Generate Manifest', () => {
  it('works with zero config', () => {
    expect(manifest({}).name).toBe('Awesome Gridsome')
  })
  it('does no have double slashes', () => {
    expect(JSON.stringify(manifest({}))).not.toMatch('//')
  })
  it('gets correct icon type', () => {
    expect(manifest({}).icons[0].type).toBe('image/png')
  })
  it('throws error if icon not found', () => {
    expect(() => manifest({ icon: 'src/not.exist.png' }))
      .toThrow('not found')
  })
})
