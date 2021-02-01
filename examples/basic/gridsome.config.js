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
      }
    }
  ]
}
