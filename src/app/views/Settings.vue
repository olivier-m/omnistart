<template>
  <div class="container">
    <h2>Settings</h2>
    <h3>Top Sites</h3>
    <p>Select bookmark folders to display in Top Sites section</p>
    <div v-for="item in folders" :key="item.id">
      <label><input type="checkbox" v-model="prefered_folders"
        :value="item.id" @change="setFolders"
        > {{ item.path.map(x => x.title).join(" \u203A ") }}</label>
    </div>

    <h3>Night mode</h3>
    <div>
      <label><input type="checkbox" v-model="$parent.settings.night_mode" />
        Toggle night mode</label></div>
  </div>
</template>

<script>
import * as bookmarks from '../../lib/bookmarks';
import * as settings from '../../lib/settings';

export default {
  name: 'bookmark-list',
  data() {
    return {
      folders: [],
      prefered_folders: []
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
