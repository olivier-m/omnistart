'use strict';

export const getFolders = async function() {
  let setItem = function(item, result, previous) {
    previous = previous || [];

    if (item.type == 'folder') {
      previous.push({'title': item.title, 'id': item.id});
      result.push({
        id: item.id,
        title: item.title,
        path: previous.slice()
      });
    }

    if (item.children) {
      for (let child of item.children) {
        if (child.type == 'folder') {
          setItem(child, result, previous);
        }
      }
    }
    previous.pop();
  };

  let tree = await browser.bookmarks.getTree();
  let result = [];
  for (let item of tree[0].children) {
    setItem(item, result, []);
  }
  return result;
};

export const listTree = async function(root_id) {
  let result = await browser.bookmarks.getSubTree(root_id);
  return result[0];
};

export const getBookmarks = async function(id) {
  let result = await browser.bookmarks.getChildren(id);
  return result.filter(x => {
    if (x.type == 'folder') {
      return false;
    }
    if (x.type == 'bookmark' && x.url.match(/^(place|data):/)) {
      return false;
    }
    return true;
  });
};
