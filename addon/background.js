'use strict';

const mainURL = '/resources/index.html';

const openTab = async function() {
  let tabs = await browser.tabs.query({});
  for (let tab of tabs) {
    if (tab.url.indexOf(browser.extension.getURL(mainURL)) === 0) {
      browser.tabs.update(tab.id, {active: true});
      return;
    }
  }
  browser.tabs.create({
    url: mainURL
  });
};

chrome.browserAction.onClicked.addListener(openTab);
