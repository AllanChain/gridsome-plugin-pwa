const generateManifest = require('../lib/generateManifest')
const { defaultOptions } = require('../gridsome.server')
const defaultsDeep = require('lodash/defaultsDeep')

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
    expect(manifest({ icon: 'src/favicon.test.ico' }).icons[0].type)
      .toBe('image/ico')
  })
})
