// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const options = {
  default: {
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
    icon: { appleMaskIcon: { url: './safari-pinned-tab.svg' } },
    msTileColor: '#00a672',
    workboxOptions: {
      cacheId: 'awesome-pwa',
      globPatterns: ['assets/@(js|css)/*', 'index.html'],
      skipWaiting: true
    }
  },
  injectManifest: {
    workboxPluginMode: 'injectManifest',
    workboxOptions: {
      swSrc: './src/service-worker.js',
      globPatterns: ['assets/@(js|css)/*', 'index.html']
    }
  }
}

module.exports = {
  siteName: 'Awesome Gridsome',
  pathPrefix: '/gridsome',
  outputDir: 'gridsome',
  plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: options[process.env.PWA_OPTIONS || 'default']
    }
  ]
}
