const { defaultOptions } = require('../gridsome.server')
const defaultsDeep = require('lodash/defaultsDeep')
const client = require('../gridsome.client')

const clientHead = // in js, no such default param behavior like python
  (userOptions, head = { head: { meta: [], link: [] } }) => {
    const options = {
      name: 'Awesome Gridsome',
      publicPath: '/gridsome/',
      msTileImage: '/gridsome/assets/icons/favicon.png-144x144.png',
      ...defaultsDeep(userOptions, defaultOptions())
    }
    client(null, options, head)
    return head
  }

it('works with zero config', () => {
  expect(JSON.stringify(clientHead({}))).toMatchSnapshot()
})
