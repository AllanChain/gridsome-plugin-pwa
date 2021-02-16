const SplitChunksPlugin = require('webpack/lib/optimize/SplitChunksPlugin')

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
          new SplitChunksPlugin({
            chunks: 'initial',
            maxInitialRequests: Infinity,
            cacheGroups: {
              workbox: {
                test: /[\\/]node_modules[\\/]/,
                chunks: 'initial'
              }
            }
          })
        ]
      }
    }
  ]
}
