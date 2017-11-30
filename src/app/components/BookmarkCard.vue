<template>
  <a :href="item.url" :title="item.title || item.url"
    :style="style"
    @click.prevent="openTab">
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

import {rgbToHsl} from '../../lib/colors';
import {openTab} from '../../lib/tabs';
import ColorThief from '../../vendor/color-thief';

export default {
  name: 'bookmark-card',
  components: {BookmarkIcon, LoaderIcon},

  data() {
    return {
      hsl: null,
      hsl_bright: null,
      hsl_dark: null,
      style: ''
    };
  },

  props: {
    item: {
      type: Object,
      required: true
    },
    shortTitle: {
      type: Number,
      required: false,
      default: 0
    },
    background: {
      type: String,
      required: false,
      default: 'bright'
    }
  },

  watch: {
    background: function() {
      this.setLinkColor();
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

      if (this.hsl === null) {
        this.hsl = rgbToHsl.apply(null, this.item.color);
        this.hsl_bright = `hsla(${this.hsl[0]}, ${this.hsl[1]}%, ${Math.min(30, this.hsl[2])}%, 1)`;
        this.hsl_dark = `hsla(${this.hsl[0]}, ${this.hsl[1]}%, ${Math.max(80, this.hsl[2])}%, 1)`;
      }

      let color = this.background == 'bright' ? this.hsl_bright : this.hsl_dark;
      this.style = `color: ${color};`;
    }
  }
};
</script>
