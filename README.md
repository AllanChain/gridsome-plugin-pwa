# @allanchain/gridsome-plugin-pwa

status: not so stable

- [Overview](#overview)
- [Installation](#installation)
  - [1. Add to Dependencies](#1-add-to-dependencies)
  - [2. Register as Gridsome Plugin](#2-register-as-gridsome-plugin)
    - [Configuration](#configuration)
    - [Sample Config](#sample-config)
  - [3. Register service worker](#3-register-service-worker)

## Overview

This plugin is based on [gridsome-plugin-pwa](https://github.com/rishabh3112/gridsome-plugin-pwa) and created to be a better alternative. it serves manifest and no-op service worker in development, use `workbox-webpack-plugin`, just as `vue-cli` does

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

#### Configuration

- **workboxPluginMode**

  This allows you to the choose between the two modes supported by the underlying
  [`workbox-webpack-plugin`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin).

  - `'GenerateSW'` (default), will lead to a new service worker file being created
  each time you rebuild your web app.

  - `'InjectManifest'` allows you to start with an existing service worker file,
  and creates a copy of that file with a "precache manifest" injected into it.

  The "[Which Plugin to Use?](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#which_plugin_to_use)"
  guide can help you choose between the two modes.

- **workboxOptions**

  These options are passed on through to the underlying `workbox-webpack-plugin`.

  For more information on what values are supported, please see the guide for
  [`GenerateSW`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_generatesw_config)
  or for [`InjectManifest`](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#full_injectmanifest_config).

- **name**

  - Default: "siteName" field in gridsome config

    Used as the value for the `apple-mobile-web-app-title` meta tag in the generated HTML.

- **themeColor**

  - Default: `'#00a672'`

- **msTileColor**

  - Default: `'#00a672'`

- **appleMobileWebAppCapable**

  - Default: `'no'`

    This defaults to `'no'` because iOS before 11.3 does not have proper PWA support. See [this article](https://medium.com/@firt/dont-use-ios-web-app-meta-tag-irresponsibly-in-your-progressive-web-apps-85d70f4438cb) for more details.

- **appleMobileWebAppStatusBarStyle**

  - Default: `'default'`

- **manifestPath**

  - Default: `'manifest.json'`

    The path of app’s manifest. If the path is an URL, the plugin won't generate a manifest.json in the dist directory during the build.

- **manifestOptions**

  - Default: `{}`

    The object will be used to generate the `manifest.json`

    If the following attributes are not defined in the object, default options will be used instead.
      - name: `name`
      - short_name: `name`
      - start_url: `'.'`
      - display: `'standalone'`
      - theme_color: `themeColor`

Options below are different to `cli-plugin-pwa`

---

- **icon**

  - Default: `'src/favicon.png'`

    The icon file to generate icons of all sizes.

- **maskableIcon**

  - Default: `false`

    Whether the icon provided is maskable.

- **svgFavicon**

  - Default: `undefined`

    Standard Meta Tags. Requires favicon.ico fallback

- **appleMaskIcon**

  - Default: `undefined`

- **appleMaskIconColor**

  - Default: `themeColor`

#### Sample Config

```js
  plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: {
        name: 'Awesome Gridsome',
        manifestOptions: {
          short_name: 'Gridsome',
          description: 'Gridsome is awesome!',
          display: 'standalone',
          background_color: '#ffffff',
          gcm_sender_id: undefined,
          start_url: '/',
          categories: ['education'],
          lang: 'en-GB',
          dir: 'auto'
        },
        appleMobileWebAppStatusBarStyle: 'default',
        manifestPath: 'manifest.json',
        icon: 'src/favicon.png',
        msTileColor: '#00a672',
        workboxOptions: { // options passed to workbox-webpack-plugin
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

```

`src/main.js`:

```js
export default function (Vue, { router, head, isClient }) {
    if (isClient && process.env.NODE_ENV === 'production') {
      require('./registerServiceWorker')
    }
  // ...
}
```
