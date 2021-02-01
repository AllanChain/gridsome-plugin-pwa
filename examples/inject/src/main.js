// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import DefaultLayout from '~/layouts/Default.vue'

export default function (Vue, { isClient }) {
  // Register on dev too for demo
  if (isClient) require('./registerServiceWorker')
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
}
