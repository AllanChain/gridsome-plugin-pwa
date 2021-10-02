# @allanchain/gridsome-plugin-pwa

[![npm (scoped)](https://img.shields.io/npm/v/@allanchain/gridsome-plugin-pwa)](https://www.npmjs.com/package/@allanchain/gridsome-plugin-pwa)
![License](https://img.shields.io/github/license/AllanChain/gridsome-plugin-pwa)
![Run Tests](https://github.com/AllanChain/gridsome-plugin-pwa/workflows/Run%20Tests/badge.svg)
[![codecov](https://codecov.io/gh/AllanChain/gridsome-plugin-pwa/branch/master/graph/badge.svg)](https://codecov.io/gh/AllanChain/gridsome-plugin-pwa)

:warning: **status: not so stable, contributions welcome**

This is the docs for master. For older releases, check out
[v0.3.0](https://github.com/AllanChain/gridsome-plugin-pwa/blob/v0.3.0/README.md),
[v0.2.5](https://github.com/AllanChain/gridsome-plugin-pwa/blob/v0.2.5/README.md)

---

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
  - [appShellPath](#appshellpath)
  - [name](#name)
  - [themeColor](#themecolor)
  - [appleMobileWebAppCapable](#applemobilewebappcapable)
  - [appleMobileWebAppStatusBarStyle](#applemobilewebappstatusbarstyle)
  - [manifestPath](#manifestpath)
  - [manifestOptions](#manifestoptions)
  - [icon](#icon)
  - [msTileColor](#mstilecolor)
  - [appleMaskIconColor](#applemaskiconcolor)
- [Developing and Testing](#developing-and-testing)
- [LICENSE](#license)

## Overview

This plugin is based on [gridsome-plugin-pwa](https://github.com/rishabh3112/gridsome-plugin-pwa) and `@vue/cli-plugin-pwa`, and it is created to be a better alternative. it serves manifest and no-op service worker in development, use similar config structure, just as `vue-cli` does

It tries to be more similar to `cli-plugin-pwa`, but makes use of gridsome's image processing power.

It uses jest, puppeteer and lighthouse for unit and e2e testing, to stabilize the plugin.

## Installation

### 1. Add to Dependencies

You need `register-service-worker` to register service worker yourself.

```bash
npm install @allanchain/gridsome-plugin-pwa register-service-worker
# or
yarn add @allanchain/gridsome-plugin-pwa register-service-worker
```

### 2. Register as Gridsome Plugin

This plugin should work with zero config (you still nead step 3) if your favicon source image is at least `512x512`

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
    globPatterns: ['assets/css/*', '*.js', 'index.html'],
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
    globPatterns: ['assets/css/*', '*.js', 'index.html']
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

Will be applied to compilation if set to an array of webpack plugins.

### workboxOptions

Default:

```js
{
  modifyURLPrefix: { '': config.publicPath },
  globDirectory: config.outputDir,
  globPatterns: ['assets/css/*', '*.js'],
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

### appShellPath

Default: `null`

:warning: This is a very experimental feature, or rather, a proof of concept.

The relative file path from `outputDir` to the html file for app shell. Only makes sense when using navigation fallback.

For example:

- Using `generateSW` mode and setting up `navigateFallback`:
  ```js
  {
    appShellPath: 'offline/index.html',
    workboxOptions: {
      globPatterns: ['assets/css/*', '*.js', 'offline/index.html'],
      navigateFallback: '/gridsome/offline/index.html',
      navigateFallbackAllowlist: [/\/$/]
    }
  }
  ```
- Using `injectManifest` mode and registering a `NavigationRoute` in `service-worker.js`.
  ```js
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(APP_SHELL), {
      allowlist: [/\/$/]
    })
  )
  ```

You may also want to check out [examples](examples).

Sourced from [gatsby-plugin-offline doc](https://www.gatsbyjs.com/plugins/gatsby-plugin-offline/#app-shell-and-server-logs):

> The app shell is a minimal amount of user interface that can be cached offline for reliable performance loading on repeat visits.

As for gridsome, it checks `window.__INITIAL_STATE__` for data (mostly page query results), falling back to fetch data from json files. All this plugin does are disabling [client side hydration](https://ssr.vuejs.org/guide/hydration.html) in `appShellPath` html, and deleting `window.__INITIAL_STATE__` in `appShellPath` html to tell gridsome to fetch data from json files. You should define app shell behavior in `service-worker.js`.

### name

Default: `config.siteName`

Used as the value for the `apple-mobile-web-app-title` and `application-name` meta tags in the generated HTML.

### themeColor

Default: `'#00a672'`

### appleMobileWebAppCapable

Default: `'no'`

This defaults to `'no'` because iOS before 11.3 does not have proper PWA support. See [this article](https://medium.com/@firt/dont-use-ios-web-app-meta-tag-irresponsibly-in-your-progressive-web-apps-85d70f4438cb) for more details.

### appleMobileWebAppStatusBarStyle

Default: `'default'`

### manifestPath

Default: `'manifest.json'`

The path of app’s manifest. It will be prefixed with `publicPath`(e.g. `'/'`, `'/gridsome/'`) to generate the final manifest url. Different to `vue-cli`, currently you can only use the generated manifest.

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

Default: your favicon, usually `./src/favicon.png`

Note: you need a **at least 512x512** image to generate every needed icon.

<details><summary>Or in detail</summary>

```js
{
  androidChrome: [{
    src, // your favicon, usually `./src/favicon.png`
    sizes: [512, 384, 192, 144, 96, 72, 48],
    purpose: 'any',
    urls: null
  }],
  msTileImage: {
    src,
    size: 144,
    url: null
  },
  appleMaskIcon: {
    url: null
  }
}
```
</details>

You can use another icon file to generate icons of all sizes:

```js
{
  icon: './src/my-icon.png'
}
```

It is a relative **file path**, not a relative URL.

Or you can configure Android Chrome (icons in `manifest.json`) icon file:

```js
{
  icon: {
    androidChrome: './src/android.png'
  }
}
```

Also configure output sizes and maskable:

```js
{
  icon: {
    androidChrome: {
      src: './src/maskable-icon.png',
      sizes: [512, 384, 192, 144, 96, 72, 48],
      purpose: 'maskable'
    }
  }
}
```

The above config will generate `android-chrome-512x512.png`, `android-chrome-384x364.png`... from `./src/my-icon.png`, and mark them as maskable.

And it is also possible to use different source for `'maskable'` and `'any'`:

```js
{
  icon: {
    androidChrome: [
      {
        src: './src/my-icon.png',
        sizes: [512, 384, 192, 144, 96, 72, 48],
        purpose: 'any'
      },
      {
        src: './src/maskable-icon.png',
        sizes: [512, 384, 192, 144, 96, 72, 48],
        purpose: 'maskable'
      }
    ]
  }
}
```

Although it is possible to set `purpose` to `'maskable any'`, it is not recommended, as explained in [Adaptive icon support in PWAs with maskable icons](https://web.dev/maskable-icon/):

> While you can specify multiple space-separated purposes like `"any maskable"`, in practice you shouldn't. Using `"maskable"` icons as `"any"` icons is suboptimal as the icon is going to be used as-is, resulting in excess padding and making the core icon content smaller. Ideally, icons for the `"any"` purpose should have transparent regions and no extra padding, like your site's favicons, since the browser isn't going to add that for them.

If you don't want icons to be generated, provide URLs:

```js
{
  icon: {
    androidChrome: {
      sizes: [512, 192],
      urls: ['/icons/512x512.png', '/icons/192x192.png']
    }
  }
}
```

`msTileImage` is similar to `androidChrome`, but only one icon. e.g.:

```js
{
  icon: {
    msTileImage: {
      url: 'assets/icons/android-chrome-144x144.png'
    }
  }
}
```

`appleMaskIcon` is a square SVG image, with a transparent (or simply: no) background, and all vectors 100% black. It is not auto generated, and you should provide URL if you want to include it:

```js
{
  icon: {
    appleMaskIcon: {
      url: '/safari-pinned-tab.svg'
    }
  }
}
```

### msTileColor

Default: `'#00a672'`

### appleMaskIconColor

Default: `themeColor`

Active color of `appleMaskIcon`

## Developing and Testing

Yarn 2 is used starting from `@allanchain/gridsome-plugin-pwa@0.4.0`, making commands much simpler.

```bash
# Install for both root and example
yarn
```

Now you can make modifications to this plugin and run `yarn develop` in example project to see the effect.

Or run `yarn test` in root dir of this project to see test results.

## LICENSE

[MIT](LICENSE)
