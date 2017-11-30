'use strict';

import * as bookmarks from '../../lib/bookmarks';
import {fetchFavicon} from '../../lib/favicon';
import {SettingsStore} from '../bus.js';

export default {
  computed: {
    background() {
      return SettingsStore.night_mode ? 'dark' : 'bright';
    }
  },

  methods: {
    loadBookmarks: async function(filter) {
      filter = filter || (x => x);
      let folders = (await bookmarks.getFolders()).filter(filter);
      for (let folder of folders) {
        let items = await bookmarks.getBookmarks(folder.id);
        folder.items = items.filter(i => i.type == 'bookmark').map(i => {
          i.icon = null;
          i.loading = false;
          i.color = null;
          i.storage_key = `icon_${i.id}`;
          return i;
        });
      }
      return folders;
    },

    getFavicon: async function(item) {
      let stored = await browser.storage.local.get(item.storage_key);
      if (typeof stored[item.storage_key] !== 'undefined') {
        item.icon = stored[item.storage_key].href;
        item.color = stored[item.storage_key].color;
        return;
      }

      item.loading = true;
      try {
        let favicon = await fetchFavicon(item.url);
        item.icon = favicon;
      }
      catch (e) {
        // noop
      }
      finally {
        item.loading = false;
        let s = {};
        s[item.storage_key] = {'href': item.icon, 'color': null};
        browser.storage.local.set(s);
      }
    },

    getStoredFavicon: async function(item) {
      let stored = await browser.storage.local.get(item.storage_key);
      if (typeof stored[item.storage_key] !== 'undefined') {
        item.icon = stored[item.storage_key].href;
        item.color = stored[item.storage_key].color;
      }
      return item;
    },

    getAllFavicons: function(folders) {
      let items = [];
      let tasks = [];
      let fetch = this.getFavicon;
      items = items.concat.apply(items, folders.map(f => f.items));

      function fetchBatch(sliceSize) {
        tasks = tasks.filter(x => !x.done);  // Remove terminated tasks

        for (let x of items.splice(0, sliceSize - tasks.length)) {
          let task = {
            done: false,
            p: fetch(x).then(function() {
              task.done = true;
              fetchBatch(sliceSize);
            })
          };
          tasks.push(task);
        }
      }

      let p = items.map(x => {
        return this.getStoredFavicon(x).then(i => {
          if (i.icon) {
            items.splice(items.indexOf(i), 1);
          }
          return i;
        });
      });
      Promise.all(p).then(() => {
        fetchBatch(5);
      });
    }
  }
};
