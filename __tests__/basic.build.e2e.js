const path = require('path')
const fs = require('fs')

const context = path.join(__dirname, '..', 'examples', 'basic')

process.chdir(context)

const build = require(path.join(
  context, 'node_modules', 'gridsome', 'lib', 'build.js'
))

beforeAll(async () => {
  await build(context)
}, 60000)

describe('manifest.json generation', () => {
  const manifestFilePath = path.join(context, 'dist', 'manifest.json')
  it('exists', () => {
    expect(fs.existsSync(manifestFilePath)).toBeTruthy()
  })
  it('contains configured fields', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestFilePath))
    expect(manifest.name).toBe('Awesome Gridsome')
    expect(manifest.short_name).toBe('Gridsome')
    expect(manifest.start_url).toBe('/')
    expect(manifest.icons).toBeInstanceOf(Array)
    expect(manifest.icons).toContainEqual({
      src: 'assets/icons/favicon-192x192.png',
      type: 'image/png',
      sizes: '192x192',
      purpose: 'any'
    })
  })
})
