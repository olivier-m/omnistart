<template>
  <div class="container">
    <h2>{{ _('preferences') }}</h2>
    <h3>{{ _('top_sites') }}</h3>
    <p>{{ _('pref_top_sites_help') }}</p>
    <div v-for="item in folders" :key="item.id">
      <label><input type="checkbox" v-model="prefered_folders"
        :value="item.id" @change="setFolders"
        > {{ item.path.map(x => x.title).join(" \u203A ") }}</label>
    </div>

    <h3>{{ _('night_mode') }}</h3>
    <div>
      <label><input type="checkbox" v-model="settings.night_mode" />
        {{ _('toogle_night_mode') }}</label></div>
  </div>
</template>

<script>
import * as bookmarks from '../../lib/bookmarks';
import * as settings from '../../lib/settings';
import Localized from '../mixins/Localized.js';
import {SettingsStore} from '../bus.js';

export default {
  name: 'bookmark-list',
  mixins: [Localized],
  data() {
    return {
      folders: [],
      prefered_folders: [],
      settings: SettingsStore
    };
  },

  mounted: async function() {
    let pf = settings.getFolders();
    let bf = bookmarks.getFolders();
    this.prefered_folders = await pf;
    this.folders = await bf;
  },

  methods: {
    setFolders() {
      settings.setFolders(this.prefered_folders);
    }
  }
};
</script>
