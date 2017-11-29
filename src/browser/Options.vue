<template>
  <div>
    <p><button @click="clearIcons">{{ _('pref_clear_icons') }}</button>
    <span class="msg" v-if="removed">{{ _('pref_clear_icons_message') }}</span></p>
  </div>
</template>

<script>
import Localized from '../app/mixins/Localized.js';

export default {
  name: 'options',
  mixins: [Localized],
  data() {
    return {
      removed: false
    };
  },

  methods: {
    clearIcons() {
      this.removed = false;
      browser.storage.local.get().then(r => {
        let icons = Object.keys(r).filter(x => x.indexOf('icon_') === 0);
        browser.storage.local.remove(icons).then(() => {
          this.removed = true;
        });
      });
    }
  }
};
</script>
