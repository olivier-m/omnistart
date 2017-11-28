'use strict';

export const openTab = async function(url) {
  let tabs = await browser.tabs.query({});
  for (let tab of tabs) {
    if (tab.url == url) {
      await browser.tabs.update(tab.id, {active: true});
      return;
    }
  }
  await browser.tabs.create({
    url: url
  });
};
