<template>
  <a :href="item.url" :title="item.title || item.url" @click.prevent="openTab">
    <span>
      <LoaderIcon v-if="item.loading" class="loader" />
      <BookmarkIcon v-if="!item.loading && !item.icon" />

      <img v-if="item.icon && !item.loading"
        :src="item.icon"
        @load="(evt) => {onIconLoaded(evt, item);}" @error="(evt) => {onIconError(evt, item);}" />
    </span>
    <span>{{ getTitle() }}</span>
  </a>
</template>

<script>
import BookmarkIcon from '../assets/bookmark.svg';
import LoaderIcon from '../assets/loader.svg';

import {rgbToHsl} from '../../lib/colors';
import {openTab} from '../../lib/tabs';
import ColorThief from '../../vendor/color-thief';

export default {
  name: 'bookmark-card',
  components: {BookmarkIcon, LoaderIcon},

  props: {
    item: {
      type: Object,
      required: true
    },
    shortTitle: {
      type: Number,
      required: false,
      default: 0
    }
  },

  methods: {
    openTab() {
      openTab(this.item.url);
    },

    getTitle() {
      let title = this.item.title;

      if (!title || !title.trim()) {
        let url = new URL(this.item.url);
        title = `${url.host} ${url.pathname}`;
      }

      if (!this.shortTitle) {
        return title;
      }

      let cut = title.indexOf(' ', this.shortTitle);
      if(cut === -1) {
        cut = this.shortTitle;
      }
      title = title.substring(0, cut);
      if (title.length < this.item.title.length) {
        return title + '…';
      }
      return title;
    },

    onIconLoaded(event, item) {
      if (!item.icon) {
        return;
      }

      if (item.color === null) {
        let el = event.target;
        let color = (new ColorThief()).getColor(el);
        item.color = color;
        let s = {};
        s[item.storage_key] = {'href': item.icon, 'color': item.color};
        browser.storage.local.set(s);
      }

      let color = rgbToHsl(item.color[0], item.color[1], item.color[2]);
      this.$el.style.color = `hsla(${color[0]}, ${color[1]}%, ${Math.min(30, color[2])}%, 1)`;
    },

    onIconError() {
      this.item.color = null;
      this.item.icon = null;
    }
  }
};
</script>
