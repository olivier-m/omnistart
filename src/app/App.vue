<template>
  <body id="app" :class="settings.night_mode ? 'nightmode' : ''">
    <nav id="nav">
      <ul>
        <li><router-link :to="{name: 'settings'}" :title="_('preferences')">
          <settings-icon fill="currentColor" />
        </router-link></li>
        <li><router-link :to="{name: 'main'}">
          <top-sites-icon fill="currentColor" /><span>{{ _('top_sites') }}</span>
        </router-link></li>
        <li><router-link :to="{name: 'bookmarks'}">
          <bookmarks-icon fill="currentColor" /><span>{{ _('all_bookmarks') }}</span>
        </router-link></li>
        <li class="spacer"></li>
        <li>
          <span @click="toggleNightMode"
           :title="_('toogle_night_mode')"><lightbulb-icon fill="currentColor" class="night-mode" /></span>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
  </body>
</template>

<script>
import BookmarksIcon from './assets/tags.svg';
import LightbulbIcon from './assets/lightbulb.svg';
import SettingsIcon from './assets/cog.svg';
import TopSitesIcon from './assets/star-full-outline.svg';

import {SettingsStore} from './bus.js';
import Localized from './mixins/Localized.js';

export default {
  name: 'App',
  components: {BookmarksIcon, LightbulbIcon, SettingsIcon, TopSitesIcon},
  mixins: [Localized],
  data() {
    return {
      settings: SettingsStore
    };
  },

  methods: {
    toggleNightMode() {
      this.settings.night_mode = !this.settings.night_mode;
    }
  }
};
</script>
