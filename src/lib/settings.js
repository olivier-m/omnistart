'use strict';

export const setSettings = function(settings) {
  chrome.storage.local.set({
    'settings': settings
  });
};

export const getSettings = async function() {
  let res = await browser.storage.local.get('settings');
  return res.settings || {};
};

export const setFolders = function(idList) {
  chrome.storage.local.set({
    'folders': idList
  });
};

export const getFolders = async function() {
  let res = await browser.storage.local.get('folders');
  return res.folders || [];
};
