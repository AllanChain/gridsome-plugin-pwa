/* global self, APP_SHELL */
// This is a simple app shell example
import(/* webpackChunkName: "sw-lib" */ './sw-lib.js').then(({
  registerRoute,
  NavigationRoute,
  precacheAndRoute,
  createHandlerBoundToURL
}) => {
  precacheAndRoute(self.__WB_MANIFEST)

  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(APP_SHELL), {
      allowlist: [/\/$/]
    })
  )
})
