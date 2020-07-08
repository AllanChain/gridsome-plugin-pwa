// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'Gridsome',
  plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: {
        name: 'Awesome Gridsome',
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
          skipWaiting: true,
          exclude: [
            /manifest\.json/
          ]
        }
      }
    }
  ]
}
