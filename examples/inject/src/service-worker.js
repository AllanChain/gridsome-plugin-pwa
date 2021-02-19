// https://github.com/AllanChain/gridsome-plugin-pwa/issues/9
import(/* webpackChunkName: "sw-lib" */ './sw-lib.js').then(({
    registerRoute,
    NavigationRoute,
    precacheAndRoute,
    createHandlerBoundToURL
  }) => {
    precacheAndRoute(self.__WB_MANIFEST);

    registerRoute(
      new NavigationRoute(createHandlerBoundToURL(APP_SHELL))
    )
  }
)
