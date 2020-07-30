# @allanchain/gridsome-plugin-pwa

[![npm (scoped)](https://img.shields.io/npm/v/@allanchain/gridsome-plugin-pwa)](https://www.npmjs.com/package/@allanchain/gridsome-plugin-pwa)
![License](https://img.shields.io/github/license/AllanChain/gridsome-plugin-pwa)
![Run Tests](https://github.com/AllanChain/gridsome-plugin-pwa/workflows/Run%20Tests/badge.svg)
[![codecov](https://codecov.io/gh/AllanChain/gridsome-plugin-pwa/branch/master/graph/badge.svg)](https://codecov.io/gh/AllanChain/gridsome-plugin-pwa)

:warning: **status: not so stable, contributions welcome**

- [Overview](#overview)
- [Installation](#installation)
  - [1. Add to Dependencies](#1-add-to-dependencies)
  - [2. Register as Gridsome Plugin](#2-register-as-gridsome-plugin)
    - [Example Configuration](#example-configuration)
  - [3. Register service worker](#3-register-service-worker)
- [Options](#options)
  - [workboxPluginMode](#workboxpluginmode)
  - [workboxCompileSrc](#workboxcompilesrc)
  - [workboxOptions](#workboxoptions)
  - [name](#name)
  - [themeColor](#themecolor)
  - [msTileColor](#mstilecolor)
  - [appleMobileWebAppCapable](#applemobilewebappcapable)
  - [appleMobileWebAppStatusBarStyle](#applemobilewebappstatusbarstyle)
  - [manifestPath](#manifestpath)
  - [manifestOptions](#manifestoptions)
  - [icon](#icon)
  - [maskableIcon](#maskableicon)
  - [appleMaskIcon](#applemaskicon)
  - [appleMaskIconColor](#applemaskiconcolor)
- [Developing and Testing](#developing-and-testing)
- [LICENSE](#license)

## Overview

This plugin is based on [gridsome-plugin-pwa](https://github.com/rishabh3112/gridsome-plugin-pwa) and `@vue/cli-plugin-pwa`, and it is created to be a better alternative. it serves manifest and no-op service worker in development, use similar config structure, just as `vue-cli` does

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

This plugin should work with zero config (you still nead step 3) if your icon file is `src/favicon.png`

```js
// gridsome.config.js
module.exports = {
  plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: {}
    }
  ]
}
```

Checkout [Options](#options) for detailed explanation of all options.

#### Example Configuration

You can also checkout [example gridsome app](examples/basic/gridsome.config.js).

`generateSW` mode:

```js
{
  manifestOptions: {
    short_name: 'Gridsome',
    description: 'Gridsome is awesome!',
    display: 'standalone',
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
  workboxOptions: {
    cacheId: 'awesome-pwa',
    globPatterns: ['assets/@(js|css)/*', 'index.html'],
    skipWaiting: true
  }
}
```

`injectManifest` mode:

```js
{
  workboxPluginMode: 'injectManifest',
  workboxOptions: {
    swSrc: './src/service-worker.js',
    globPatterns: ['assets/@(js|css)/*', 'index.html']
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

## Options

### workboxPluginMode

Default: `'generateSW'`

This allows you to the choose between the two modes supported by the underlying
[`workbox-build`](https://developers.google.com/web/tools/workbox/modules/workbox-build).

- `'generateSW'` will lead to a new service worker file being created
each time you rebuild your web app.

- `'injectManifest'` allows you to start with an existing service worker file,
and creates a copy of that file with a "precache manifest" injected into it.

The "[Which Plugin to Use?](https://developers.google.com/web/tools/workbox/modules/workbox-build#which_plugin_to_use)"
guide can help you choose between the two modes.

### workboxCompileSrc

Default: `true`

Only works in `injectManifest` mode. Compile your `service-worker.js` with webpack.

### workboxOptions

Default:

```js
{
  modifyURLPrefix: { '': config.publicPath },
  globDirectory: config.outputDir,
  globPatterns: ['assets/@(js|css)/*'],
  swDest: path.join(config.outputDir, 'service-worker.js')
  sourcemap: false, // if generateSW
  cacheId: config.siteName // if generateSW
}
```

These options are passed on through to the underlying `workbox-build`.

For more information on what values are supported, please see the guide for
[`generateSW`](https://developers.google.com/web/tools/workbox/modules/workbox-build#full_generateSW_config)
or for [`injectManifest`](https://developers.google.com/web/tools/workbox/modules/workbox-build#full_injectManifest_config).

**It is not recommended to precache all files**, because your site can be large. Instead, precache important files and consider runtime caching for other files.

### name

Default: `config.siteName`

Used as the value for the `apple-mobile-web-app-title` and `application-name` meta tags in the generated HTML.

### themeColor

Default: `'#00a672'`

### msTileColor

Default: `'#00a672'`

### appleMobileWebAppCapable

Default: `'no'`

This defaults to `'no'` because iOS before 11.3 does not have proper PWA support. See [this article](https://medium.com/@firt/dont-use-ios-web-app-meta-tag-irresponsibly-in-your-progressive-web-apps-85d70f4438cb) for more details.

### appleMobileWebAppStatusBarStyle

Default: `'default'`

### manifestPath

Default: `'manifest.json'`

The path of app’s manifest. Different to `vue-cli`, currently you can only use the generated manifest.

### manifestOptions

Default: 
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

### icon

Default: `'src/favicon.png'`

The icon file to generate icons of all sizes. It is a relative **file path**, not a relative URL.

### maskableIcon

Default: `false`

Whether the icon provided is maskable.

### appleMaskIcon

Default: `undefined`

URL to apple mask icon (a.k.a safari pinned tab SVG)

A square SVG image, with a transparent (or simply: no) background, and all vectors 100% black.

### appleMaskIconColor

Default: `themeColor`

Active color of `appleMaskIcon`


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
