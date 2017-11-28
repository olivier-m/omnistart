<template>
  <div class="container">
    <div class="cards" v-for="folder in folders" v-if="folder.items.length > 0"
      :key="folder.id">
      <h2>{{ folder.title }}</h2>

      <bookmark-card class="card" v-for="item in folder.items" v-if="item.type == 'bookmark'"
        :key="item.id" :item="item" shortTitle="25" />
      <hr v-else />
    </div>
    <div v-if="folders === null">
      <p>Nothing to show, <router-link :to="{name: 'settings'}" title="settings">add folders now</router-link></p>
    </div>
  </div>
</template>

<script>
import * as settings from '../../lib/settings';
import BookmarkCard from '../components/BookmarkCard.vue';
import BookmarkList from '../components/BookmarkList.js';

export default {
  name: 'bookmark-list',
  components: {BookmarkCard},
  mixins: [BookmarkList],
  data() {
    return {
      folders: [],
    };
  },

  mounted: async function() {
    let settings_folders = await settings.getFolders();
    let folders = await this.loadBookmarks(x => settings_folders.includes(x.id));
    if (folders.length > 0) {
      this.folders = folders;
      this.getAllFavicons(this.folders);
    }
    else {
      this.folders = null;
    }
  }
};
</script>
