'use strict';

// import 'normalize.css';
import '../style/main.styl';

import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';

//
// Router
//
Vue.use(VueRouter);

import Bookmarks from './views/Bookmarks.vue';
import TopSites from './views/TopSites.vue';
import Settings from './views/Settings.vue';

const routes = [
  {
    'path': '/',
    'name': 'main',
    'component': TopSites
  },
  {
    'path': '/bookmarks',
    'name': 'bookmarks',
    'component': Bookmarks
  },
  {
    'path': '/settings',
    'name': 'settings',
    'component': Settings
  }
];

const router = new VueRouter({
  routes,
  'linkExactActiveClass': 'active'
});

//
// Load app
//
new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});
