# @allanchain/gridsome-plugin-pwa

## Overview

This plugin is based on [gridsome-plugin-pwa](https://github.com/rishabh3112/gridsome-plugin-pwa) and created to be a better alternative.

It tries to be more similar to `cli-plugin-pwa`, but makes use of gridsome's image processing power.

## Installation

### 1. Add to Dependencies

You need `register-service-worker` to register service worker yourself.

```bash
npm install @allanchain/gridsome-plugin-pwa register-service-worker
# or
yarn add @allanchain/gridsome-plugin-pwa register-service-worker
```

### 2. Register as Gridsome Plugin

```js
plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: {
        title: 'Gridsome',
        startUrl: '/',
        display: 'standalone',
        statusBarStyle: 'default',
        manifestPath: 'manifest.json',
        shortName: 'Gridsome',
        themeColor: '#666600',
        backgroundColor: '#ffffff',
        icon: 'src/favicon.png', // path in your project
        msTileImage: '',
        msTileColor: '#666600',
        gcmSenderId: undefined,
        workboxOptions: {  // options passed to workbox-webpack-plugin
          cacheId: 'awesome-pwa',
          skipWaiting: true,
          exclude: [
            /manifest\.json/
          ]
        }
      }
    }
  ]
```

### 3. Register service worker

You need manually register service worker, just as what you do in `vue-cli`, which gives you more power.

Create `registerServiceWorker.js` and import it in `main.js`

A good start point is `vue-cli`'s template. `src/registerServiceWorker.js`:

```js
/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  // replace with your location. Default is service-worker.js
  register('/service-worker.js', {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
    },
    updated () {
      console.log('New content is available; please refresh.')
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
```

`src/main.js`:

```js
export default function (Vue, { router, head, isClient }) {
  if (isClient) require('./registerServiceWorker')
  // ...
}
```
