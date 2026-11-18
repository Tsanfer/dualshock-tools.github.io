import fs from 'node:fs/promises';

const outputPath = new URL('../dist/index.html', import.meta.url);
const html = await fs.readFile(outputPath, 'utf8');

const cdnRewrites = new Map([
  [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.3/css/bootstrap.min.css',
  ],
  [
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/fontawesome.min.css',
    'https://cdn.bootcdn.net/ajax/libs/font-awesome/6.6.0/css/fontawesome.min.css',
  ],
  [
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/css/all.min.css',
    'https://cdn.bootcdn.net/ajax/libs/font-awesome/6.6.0/css/all.min.css',
  ],
  [
    'https://code.jquery.com/jquery-3.7.1.min.js',
    'https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js',
  ],
  [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
    'https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.3.3/js/bootstrap.bundle.min.js',
  ],
]);

let patchedHtml = html;
for (const [sourceUrl, mirrorUrl] of cdnRewrites) {
  patchedHtml = patchedHtml.replaceAll(sourceUrl, mirrorUrl);
}

// SRI hashes are specific to the original CDN response and may not match the
// mirror's files. Remove SRI only from tags now served by BootCDN.
patchedHtml = patchedHtml.replace(
  /<(?:link|script)\b[^>]*cdn\.bootcdn\.net\/[^>]*>/gi,
  tag => tag
    .replace(/\s+integrity=(['"]).*?\1/gi, '')
    .replace(/\s+crossorigin=(['"]).*?\1/gi, ''),
);

await fs.writeFile(outputPath, patchedHtml);
console.log('Rewrote external CSS and JavaScript URLs to BootCDN in dist/index.html');
