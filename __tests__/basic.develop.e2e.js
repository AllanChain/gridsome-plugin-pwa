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

it('serves manifest.json', async () => {
  const res = await get('/manifest.json')
  expect(res.status).toBe(200)
}, 30000)
