// https://github.com/AllanChain/gridsome-plugin-pwa/issues/9

import { registerRoute, NavigationRoute } from 'workbox-routing';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'))
);
