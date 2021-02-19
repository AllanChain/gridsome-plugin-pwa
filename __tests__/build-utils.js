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
  async launchAndLighthouse ({
    directory = './',
    publicPath = '/',
    lighthouseConfig,
    lighthouseOpts
  }) {
    const handler = require('serve-handler')
    const http = require('http')
    const puppeteer = require('puppeteer')
    const lighthouse = require('lighthouse')

    const port = 3000
    const url = `http://localhost:${port}${publicPath}`

    const server = http.createServer((request, response) => {
      return handler(request, response, { public: directory })
    })
    server.listen(port)
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-gpu', '--enable-features=NetworkService'],
      ignoreHTTPSErrors: true
    })
    lighthouseOpts = lighthouseOpts || {}
    lighthouseOpts.port = new URL(browser.wsEndpoint()).port
    try {
      const consoleOutput = []
      const httpResponse = []
      for (let _ = 0; _ < 2; _++) { // simulate open again
        const page = await browser.newPage()
        page.on('console', consoleOutput.push.bind(consoleOutput))
        page.on('response', httpResponse.push.bind(httpResponse))
        await page.goto(url, { waitUntil: 'networkidle0' })
        page.close()
      }
      return {
        consoleOutput,
        httpResponse,
        result: await lighthouse(url, lighthouseOpts, lighthouseConfig)
      }
    } finally {
      browser.close()
      server.close()
    }
  }
}
