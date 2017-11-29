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


const bufferToCanvas = function(data, mimetype) {
  let blob = new Blob([data], {type: mimetype});
  let imgURL = URL.createObjectURL(blob);
  let img = new Image();

  return new Promise((resolve, reject) => {
    img.addEventListener('load', function() {
      URL.revokeObjectURL(imgURL);
      let canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    });

    img.addEventListener('error', function(event) {
      reject(event);
    });

    img.src = imgURL;
  });
};


const resizeCanvas = function(original, maxSize) {
  let w = original.width;
  let h = original.height;
  let ratio = h/w;

  if (ratio >= 1) {
    h = Math.min(maxSize, h);
    w = Math.round(h / ratio);
  }
  else {
    w = Math.min(maxSize, w);
    h = Math.round(w * ratio);
  }

  let canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(original,
    0, 0, original.width, original.height,
    0, 0, canvas.width, canvas.height
  );
  return canvas;
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


const fetchIconCanvas = async function(href) {
  let r = await request.get(href, {
    'responseType': 'arraybuffer'
  });

  let mimetype = r.headers['content-type'];
  href = r.request.responseURL;

  if (href.match(/\.ico$/)) {
    mimetype = 'image/vnd.microsoft.icon';
  }

  if (mimetype.indexOf('image/') !== 0) {
    throw new Error(`${href} is not an image`);
  }

  return await bufferToCanvas(r.data, mimetype);
};


export const fetchFavicon = async function(url) {
  try {
    let r = await request.get(url, {
      'responseType': 'document'
    });
    let icons = findFaviconInResponse(r);
    let icon = icons.shift();

    let loop = async function(i) {
      if (typeof i === 'undefined') {
        throw new Error('no icon');
      }

      try {
        let canvas = await fetchIconCanvas(i.href);
        return resizeCanvas(canvas, 64).toDataURL('image/png');
      }
      catch(e) {
        icon = icons.shift();
        return await loop(icon);
      }
    };

    return await loop(icon);
  }
  catch(e) {
    throw new Error('No favicon found');
  }
};
