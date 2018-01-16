'use strict';

const GET = function(url) {
  return fetch(url, {
    method: 'GET',
    cache: 'no-store',
    redirect: 'follow',
    referrerPolicy: 'origin'
  });
};

const fetchPage = async function(url) {
  let response = await GET(url);

  if (parseInt(response.status / 100) != 2) {
    throw new Error(`Invalid status for ${url} (${response.status})`);
  }

  let mime = response.headers.get('content-type');
  if (!mime || !mime.includes('text/html')) {
    throw new Error(`Invalid content-type for ${url} (${mime})`);
  }

  let doc = await response.text();
  let parser = new DOMParser();
  return {
    response: response,
    doc: parser.parseFromString(doc, 'text/html')
  };
};


const linkTypes = [
  'link[rel="shortcut icon"]',
  'link[rel="icon"]',
  'link[rel="apple-touch-icon"]',
  'link[rel="apple-touch-icon-precomposed"]'
];


const blobToCanvas = function(blob) {
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


const findFaviconInResponse = function(doc, url) {
  let nodes = doc.querySelectorAll(linkTypes.join(','));

  let result = [{
    'href': (new URL('/favicon.ico', url)).href,
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

    href = (new URL(href, url)).href;
    let sizes = (node.getAttribute('sizes') || `${default_size}x${default_size}`).split(' ');
    let size = sizes.map(x => x.split('x', 2)).map(x => {
      return x.map(x => parseInt(x, 10) || default_size);
    }).sort((a, b) => b[0] - a[0])[0];

    result.push({href, size});
  }

  return result.sort((a, b) => b.size[0] - a.size[0]);
};


const fetchIconCanvas = async function(href) {
  let response = await GET(href);
  if (parseInt(response.status / 100) != 2) {
    throw new Error('Invalid status code');
  }

  let mime = response.headers.get('content-type');
  href = response.url;

  if (href.match(/\.ico$/)) {
    mime = 'image/vnd.microsoft.icon';
  }

  if (mime.indexOf('image/') !== 0) {
    throw new Error(`${href} is not an image`);
  }

  let blob = await response.blob();
  return await blobToCanvas(blob);
};


export const fetchFavicon = async function(url) {
  try {
    let r = await fetchPage(url);

    let icons = findFaviconInResponse(r.doc, r.response.url);
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
