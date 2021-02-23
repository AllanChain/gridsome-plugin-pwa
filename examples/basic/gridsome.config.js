module.exports = {
  siteName: 'Awesome Gridsome',
  pathPrefix: '/gridsome',
  outputDir: 'gridsome',
  plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: {
        manifestOptions: {
          short_name: 'Gridsome',
          description: 'Gridsome is awesome!',
          display: 'standalone',
          gcm_sender_id: undefined,
          categories: ['education'],
          lang: 'en-GB',
          dir: 'auto'
        },
        appleMobileWebAppStatusBarStyle: 'default',
        manifestPath: 'manifest.json',
        icon: {
          androidChrome: [
            {
              src: './src/favicon-maskable.png',
              sizes: [512, 384, 192],
              purpose: 'maskable'
            },
            {
              sizes: [144],
              purpose: 'any'
            },
            {
              urls: [
                '/gridsome/assets/static/favicon.7b22250.9bb7ffafafc09ac851d81afb65b8ef59.png'
              ],
              sizes: [180]
            }
          ],
          appleMaskIcon: { url: './safari-pinned-tab.svg' }
        },
        msTileColor: '#00a672',
        appShellPath: 'offline/index.html',
        workboxOptions: {
          cacheId: 'awesome-pwa',
          globPatterns: ['assets/@(js|css)/*', 'offline/index.html'],
          navigateFallback: '/gridsome/offline/index.html',
          navigateFallbackAllowlist: [/\/$/],
          skipWaiting: true
        }
      }
    }
  ]
}
