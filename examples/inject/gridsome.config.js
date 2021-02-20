const webpack = require('webpack')

module.exports = {
  siteName: 'Awesome Gridsome',
  siteDescription: 'Awesome indeed!',
  plugins: [
    {
      use: '@allanchain/gridsome-plugin-pwa',
      options: {
        workboxPluginMode: 'injectManifest',
        workboxOptions: {
          swSrc: './src/service-worker.js',
          globPatterns: ['assets/@(js|css)/*', 'offline/index.html']
        },
        workboxCompileSrc: [
          new webpack.DefinePlugin({
            APP_SHELL: JSON.stringify('/offline/index.html')
          })
        ],
        appShellPath: 'offline/index.html',
        icon: {
          androidChrome: [
            {
              src: 'src/favicon-maskable.png',
              sizes: [512, 384, 192],
              purpose: 'maskable'
            }
          ]
        }
      }
    },
    {
      use: '@gridsome/source-filesystem',
      options: {
        typeName: 'BlogPost',
        baseDir: './content',
        path: '*.md'
      }
    }
  ],
  templates: {
    BlogPost: '/blog/:title'
  }
}
