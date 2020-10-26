// https://github.com/AllanChain/gridsome-plugin-pwa/issues/9
import('./sw-lib.js').then(({
    registerRoute,
    NavigationRoute,
    precacheAndRoute,
    createHandlerBoundToURL
  }) => {
    precacheAndRoute(self.__WB_MANIFEST);

    registerRoute(
      new NavigationRoute(createHandlerBoundToURL('/gridsome/index.html'))
    )
  }
)
