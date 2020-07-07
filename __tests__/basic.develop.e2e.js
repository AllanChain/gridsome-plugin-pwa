const path = require('path')
const { spawn } = require('child_process')
const axios = require('axios')

let developProcess
const context = path.join(__dirname, '..', 'examples', 'basic')
const get = async path => await axios.get('http://localhost:8080' + path)
const sleep = time => new Promise(resolve => setTimeout(resolve, time))

beforeAll(async () => {
  // Spawning process to easily kill it
  developProcess = spawn(
    path.join(context, 'node_modules', '.bin', 'gridsome'),
    ['develop'],
    { cwd: context }
  )
  await sleep(10000)
}, 10100)

afterAll(() => {
  developProcess.kill('SIGINT')
})

describe('manifest.json', () => {
  let res
  it('is served', async () => {
    res = await get('/manifest.json')
    expect(res.status).toBe(200)
  }, 30000) // first request takes some time
  it('looks not bad', () => {
    expect(res.data.short_name).toBe('Gridsome')
  })
})

describe('icon', () => {
  it('is served', async () => {
    const res = await get('/assets/icons/favicon-144x144.png')
    expect(res.status).toBe(200)
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
