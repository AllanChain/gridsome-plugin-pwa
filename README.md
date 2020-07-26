# @allanchain/gridsome-plugin-pwa

[![npm (scoped)](https://img.shields.io/npm/v/@allanchain/gridsome-plugin-pwa)](https://www.npmjs.com/package/@allanchain/gridsome-plugin-pwa)
![License](https://img.shields.io/github/license/AllanChain/gridsome-plugin-pwa)
![Run Tests](https://github.com/AllanChain/gridsome-plugin-pwa/workflows/Run%20Tests/badge.svg)

:warning: **status: writing tests**

- [Overview](#overview)
- [Installation](#installation)
  - [1. Add to Dependencies](#1-add-to-dependencies)
  - [2. Register as Gridsome Plugin](#2-register-as-gridsome-plugin)
    - [Configuration](#configuration)
    - [Sample Config](#sample-config)
  - [3. Register service worker](#3-register-service-worker)
- [Developing and Testing](#developing-and-testing)
- [LICENSE](#license)

## Overview

This plugin is based on [gridsome-plugin-pwa](https://github.com/rishabh3112/gridsome-plugin-pwa) and `@vue/cli-plugin-pwa`, and it is created to be a better alternative. it serves manifest and no-op service worker in development, use `workbox-webpack-plugin`, use similar config structure, just as `vue-cli` does

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

> This plugin should work with zero config (you still nead step 3) if your icon file is `src/favicon.png`

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
  
  - Default:
    - `{}` if `InjectManifest`
    - if `GenerateSW`

      you can override `/assets\/icons/` if provide `exclude` yourself, but cannot override first two because thay are to prevent error.

      ```js
      {
        exclude: [
          /styles(\.\w{8})?\.js$/,
          /manifest\/client.json$/,
          /assets\/icons/
        ]
      }
      ```

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

    The path of app’s manifest. Different to `vue-cli`, currently you can only use the generated manifest.

- **manifestOptions**

  - Default: 
    ```js
    {
      start_url: '.',
      display: 'standalone',
      background_color: '#000000'
    }
    ```

    The object will be used to generate the `manifest.json`

    If the following attributes are not defined in the object, default options will be used instead.
      - name: `name`
      - short_name: `name`
      - start_url: `'.'`
      - display: `'standalone'`
      - theme_color: `themeColor`

- **icon**

  - Default: `'src/favicon.png'`

    The icon file to generate icons of all sizes. It is a relative **file path**, not a relative URL.

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

You can also checkout [example gridsome app](examples/basic/gridsome.config.js).

`GenerateSW` mode:

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

`InjectManifest` mode:

```js
{
  workboxPluginMode: 'InjectManifest',
  workboxOptions: {
    swSrc: './src/service-worker.js',
    additionalManifestEntries: [
      '/index.html' // also precache '/index.html'
    ]
  }
}
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

## Developing and Testing

```bash
# link this plugin to example project
yarn link
cd examples/basic
yarn link @allanchain/gridsome-plugin-pwa
# install example project dependencies
yarn --frozen-lockfile
# link peer dependency sharp
cd node_modules/sharp
yarn link
cd ../../../..
yarn link sharp
# install plugin dependencies
yarn --frozen-lockfile
```

Now you can make modifications to this plugin and run `yarn run develop` in example project to see the effect.

Or run `yarn test` in root dir of this project to see test results.

## LICENSE

[MIT](LICENSE)
