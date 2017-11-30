'use strict';
import Vue from 'vue';

import * as settings from '../lib/settings';


// Settings Store
export const SettingsStore = new Vue({
  data() {
    return {
      night_mode: false
    };
  },

  beforeCreate: async function() {
    let res = await settings.getSettings();
    Object.assign(this, res);
  },

  watch: {
    night_mode: function() {
      this.saveSettings();
    }
  },

  methods: {
    saveSettings() {
      settings.setSettings(this._data);
    }
  }
});
