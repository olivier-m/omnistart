<template>
  <a :href="item.url" :title="item.title || item.url" @click.prevent="openTab">
    <span>
      <LoaderIcon v-if="item.loading" class="loader" />
      <BookmarkIcon v-if="!item.loading && !item.icon" />

      <img v-if="item.icon && !item.loading"
        :src="item.icon"
        @load="onIconLoaded" @error="onIconError" />
    </span>
    <span>{{ getTitle() }}</span>
  </a>
</template>

<script>
import BookmarkIcon from '../assets/bookmark.svg';
import LoaderIcon from '../assets/loader.svg';

import {EventBus} from '../bus.js';
import {rgbToHsl} from '../../lib/colors';
import {openTab} from '../../lib/tabs';
import ColorThief from '../../vendor/color-thief';

const COLOR_REG = /^rgba?\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)/;

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

  created() {
    EventBus.$on('night-mode', this.setLinkColor);
  },

  beforeDestroy() {
    EventBus.$off('night-mode', this.setLinkColor);
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

    onIconLoaded(event) {
      if (!this.item.icon) {
        return;
      }

      if (this.item.color === null) {
        let el = event.target;
        let color = (new ColorThief()).getColor(el);
        this.item.color = color;
        let s = {};
        s[this.item.storage_key] = {'href': this.item.icon, 'color': this.item.color};
        browser.storage.local.set(s);
      }

      this.setLinkColor();
    },

    onIconError() {
      this.item.color = null;
      this.item.icon = null;
    },

    setLinkColor() {
      if (this.item.color === null) {
        return;
      }

      let bgColor = window.getComputedStyle(this.$el).backgroundColor;
      let m = COLOR_REG.exec(bgColor);
      if (m) {
        bgColor = [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[2], 10)];
      }
      bgColor = rgbToHsl.apply(null, bgColor);

      let color = rgbToHsl.apply(null, this.item.color);
      let lum;
      if (bgColor[2] > 50) {
        lum = Math.min(30, color[2]);
      }
      else {
        lum = Math.max(80, color[2]);
      }
      this.$el.style.color = `hsla(${color[0]}, ${color[1]}%, ${lum}%, 1)`;
    }
  }
};
</script>
