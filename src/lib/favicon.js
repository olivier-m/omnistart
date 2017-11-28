'use strict';

import axios from 'axios';

const request = axios.create({
  'method': 'GET',
  'timeout': 8000,
});
request.interceptors.request.use(config => {
  // Prevent HTTP basic authentication popup
  config.headers['Authorization'] = '--ignore--';
  return config;
});

const linkTypes = [
  'link[rel="shortcut icon"]',
  'link[rel="icon"]',
  'link[rel="apple-touch-icon"]',
  'link[rel="apple-touch-icon-precomposed"]'
];

const imageEncode = function(arrayBuffer) {
  return btoa([].reduce.call(
    new Uint8Array(arrayBuffer), (p, c) => p + String.fromCharCode(c), '')
  );
};

const findFaviconInResponse = function(response) {
  let nodes = response.data.querySelectorAll(linkTypes.join(','));

  let result = [{
    'href': (new URL('/favicon.ico', response.request.responseURL)).href,
    'size': [32, 32]
  }];

  for (let node of nodes) {
    let href = node.getAttribute('href');
    if (!href) {
      continue;
    }

    let default_size = 32;
    let rel = node.getAttribute('rel');

    if (rel.match(/^apple-touch-icon/)) {
      default_size = 64;
    }

    href = (new URL(href, response.request.responseURL)).href;
    let sizes = (node.getAttribute('sizes') || `${default_size}x${default_size}`).split(' ');
    let size = sizes.map(x => x.split('x', 2)).map(x => {
      return x.map(x => parseInt(x, 10) || default_size);
    }).sort((a, b) => b[0] - a[0])[0];

    result.push({href, size});
  }

  return result.sort((a, b) => b.size[0] - a.size[0]);
};


const fetchIcon = function(href) {
  return request.get(href, {
    'responseType': 'arraybuffer'
  }).then(r => {
    let encoded = imageEncode(r.data);
    let mimetype = r.headers['content-type'];
    let href = r.request.responseURL;

    if (href.match(/\.ico$/)) {
      mimetype = 'image/vnd.microsoft.icon';
    }

    if (mimetype.indexOf('image/') !== 0) {
      throw new Error(`${href} is not an image`);
    }
    return `data:${mimetype};base64,${encoded}`;
  });
};

export const fetchFavicon = function(url) {
  return request.get(url, {
    'responseType': 'document'
  }).then(findFaviconInResponse)
    .catch(() => {
      throw new Error('No favicon found');
    }).then(icons => {
      let icon = icons.shift();

      function loop(i) {
        if (typeof i === 'undefined') {
          return Promise.reject('no icon');
        }
        return fetchIcon(i.href).catch(() => {
          icon = icons.shift();
          return loop(icon);
        });
      }

      return loop(icon);
    });
};
