const path = require('path')
const { fork } = require('child_process')
const axios = require('axios')
const { useContext } = require('./build-utils')

let developProcess
let hostUrl = 'http://localhost:8080'
const get = async path => await axios.get(hostUrl + path)

useContext('basic')

beforeAll(() => {
  // Spawning process to easily kill it
  developProcess = fork(
    path.join('node_modules', 'gridsome', 'bin', 'gridsome.js'),
    ['develop'],
    { silent: true }
  )
  developProcess.stdout.setEncoding('utf-8')
  return new Promise(resolve => {
    developProcess.stdout.on('data', data => {
      // Remove color control code
      /* eslint-disable-next-line no-control-regex */
      data = data.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '')
      const result = data.match(/Project is running at: (http:\/\/localhost:\d+)/)
      if (result !== null) {
        hostUrl = result[1]
        resolve()
      }
    })
  })
}, 30000)

afterAll(() => {
  developProcess.kill('SIGINT')
})

describe('manifest', () => {
  let res
  it('is served', async () => {
    res = await get('/manifest.json')
    expect(res.status).toBe(200)
  }, 30000) // first request takes some time
  it('looks not bad', () => {
    expect(res.data.short_name).toBe('Gridsome')
  })
  it('has correct icon', async () => {
    return get(res.data.icons[0].src).then(
      res => expect(res.status).toBe(200)
    )
  })
})

describe('service worker', () => {
  let res
  it('is served', async () => {
    res = await get('/service-worker.js')
    expect(res.status).toBe(200)
  })
  it('is no-op sw', () => {
    expect(res.data).toMatch('no-op')
  })
})
