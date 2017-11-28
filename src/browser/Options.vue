<template>
  <div>
    <p><button @click="clearIcons">Clear all bookmark icons</button>
    <span class="msg" v-if="removed">bookmarks cleared!</span></p>
  </div>
</template>

<script>
export default {
  name: 'options',
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
