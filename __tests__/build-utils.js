const path = require('path')
const fs = require('fs')
const { fork } = require('child_process')

const resolveContext = name => path.join(__dirname, '..', 'examples', name)
const useContext = name => {
  const cwd = process.cwd()
  beforeAll(() => process.chdir(resolveContext(name)))
  afterAll(() => process.chdir(cwd))
}
const useBuild = (func) => (name, out) => {
  useContext(name)
  beforeAll(func, 30000)
  afterAll(() => fs.rmdirSync(out, { recursive: true }))
  return (...file) => path.join(resolveContext(name), out, ...file)
}

// using function `build` in jest produces strange error:
// workbox-build fails to locate modules from workbox correctly,
// `workbox-79e58606` becomes a file path
// so we just run from child process
const trueBuild = async () => {
  return new Promise((resolve, reject) => fork(
    path.join('node_modules', 'gridsome', 'bin', 'gridsome.js'),
    ['build'],
    { silent: true }
  ).on('close', code => code === 0 ? resolve() : reject(code)))
}
// Keeping build function for coverage
const build = async () => {
  await require(path.resolve(
    process.cwd(), './node_modules/gridsome/lib/build.js')
  )(process.cwd())
}

module.exports = {
  resolveContext,
  useContext,
  useBuild: useBuild(build),
  useTrueBuild: useBuild(trueBuild),
  useBrowser (directory, port) {
    const fixture = {}
    const handler = require('serve-handler')
    const http = require('http')
    const puppeteer = require('puppeteer')
    beforeAll(async () => {
      fixture.server = http.createServer((request, response) => {
        return handler(request, response, { public: directory })
      })
      fixture.server.listen(port)
      fixture.browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-gpu', '--enable-features=NetworkService'],
        ignoreHTTPSErrors: true
      })
    })
    afterAll(async () => {
      await fixture.browser.close()
      fixture.server.close()
    })
    return fixture
  }
}
