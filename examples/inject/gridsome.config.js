const webpack = require('webpack')

module.exports = {
  siteName: 'Awesome Gridsome',
  plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: {
        workboxPluginMode: 'injectManifest',
        workboxOptions: {
          swSrc: './src/service-worker.js',
          globPatterns: ['assets/@(js|css)/*', 'index.html']
        },
        workboxCompileSrc: [
          new webpack.DefinePlugin({
            APP_SHELL: JSON.stringify('/index.html')
          })
        ],
        icon: {
          androidChrome: [
            {
              src: 'src/favicon-maskable.png',
              sizes: [512, 384, 192],
              purpose: 'maskable'
            },
          ]
        }
      }
    }
  ]
}
