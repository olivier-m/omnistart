'use strict';

export const setFolders = function(idList) {
  chrome.storage.local.set({
    'folders': idList
  });
};

export const getFolders = async function() {
  let res = await browser.storage.local.get('folders');
  return res.folders || [];
};
