<template>
  <div class="container">
    <h2>{{ _('all_bookmarks') }}</h2>
    <div class="folders">
      <div class="folder" v-for="folder in folders" :key="folder.id">
        <h3>
          <span v-for="p in folder.path" :key="p.id"
           v-if="(p.id != 'menu________' || folder.path.length == 1)">{{ p.title }}</span>
        </h3>
        <bookmark-card class="card" v-for="item in folder.items" v-if="item.type == 'bookmark'"
        :key="item.id" :item="item" shortTitle="25" />
      </div>
    </div>
  </div>
</template>

<script>
import BookmarkCard from '../components/BookmarkCard.vue';
import BookmarkList from '../mixins/BookmarkList.js';
import Localized from '../mixins/Localized.js';


export default {
  name: 'bookmarks',
  components: {BookmarkCard},
  mixins: [Localized, BookmarkList],
  data() {
    return {
      'folders': []
    };
  },

  mounted: async function() {
    let folders = await this.loadBookmarks();
    this.folders = folders.filter(x => x.items.length > 0);
    this.getAllFavicons(this.folders);
  }
};
</script>
