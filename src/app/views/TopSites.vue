<template>
  <div class="container">
    <div class="cards" v-for="folder in folders" v-if="folder.items.length > 0"
      :key="folder.id">
      <h2>{{ folder.title }}</h2>

      <bookmark-card class="card" v-for="item in folder.items" v-if="item.type == 'bookmark'"
        :key="item.id" :item="item" :background="background" shortTitle="25" />
      <hr v-else />
    </div>
    <div v-if="folders === null">
      <p v-html="_('empty_list_message', $router.resolve({'name': 'settings'}).href)"></p>
    </div>
  </div>
</template>

<script>
import * as settings from '../../lib/settings';
import BookmarkCard from '../components/BookmarkCard.vue';
import BookmarkList from '../mixins/BookmarkList.js';
import Localized from '../mixins/Localized.js';

export default {
  name: 'bookmark-list',
  components: {BookmarkCard},
  mixins: [Localized, BookmarkList],
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
