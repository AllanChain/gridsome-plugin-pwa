const fs = require('fs')

module.exports = (htmlFile) => {
  if (!fs.existsSync(htmlFile)) {
    throw new Error(`Unable to patch app shell mode: "${htmlFile}" not found.`)
  }
  const htmlContent = fs.readFileSync(htmlFile, { encoding: 'utf-8' })
    .replace(/<script>window\.__INITIAL_STATE__.*?<\/script>/, '')
    // disable hydration
    // `data-server-rendered` for vue client side hydration
    // `data-html-server-renderd` for vue meta (gridsome configured name)
    .replace(/ data-.*?server-rendered="true"/g, '')
  fs.writeFileSync(htmlFile, htmlContent, { encoding: 'utf-8' })
}
