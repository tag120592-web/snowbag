/**
 * Пересборка «Снеговые мешки (офлайн).html» из standalone-src.html
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dsRoot = path.resolve(__dirname, '../..');
const offlinePath = path.join(dsRoot, 'Снеговые мешки (офлайн).html');
const standalonePath = path.join(__dirname, 'standalone-src.html');

function gzipB64(bytes) {
  const gz = zlib.gzipSync(bytes);
  return { data: gz.toString('base64'), compressed: true, mime: 'application/octet-stream' };
}

function addAsset(manifest, bytes, mime) {
  const uuid = randomUUID();
  manifest[uuid] = { mime, ...gzipB64(bytes) };
  return uuid;
}

async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function parseExtResources(html) {
  const re = /<meta name="ext-resource-dependency" content="([^"]+)" data-resource-id="([^"]+)"\s*\/?>/g;
  const items = [];
  let m;
  while ((m = re.exec(html))) items.push({ url: m[1], id: m[2] });
  return items;
}

function readShell() {
  const html = fs.readFileSync(offlinePath, 'utf8');
  const headEnd = html.indexOf('<script>\n    \ndocument.addEventListener');
  if (headEnd === -1) throw new Error('Offline shell not found');
  const loaderStart = headEnd;
  const loaderEnd = html.indexOf('</script>', loaderStart) + '</script>'.length;
  return { shell: html.slice(0, headEnd), loader: html.slice(loaderStart, loaderEnd) };
}

async function buildTemplate() {
  let html = fs.readFileSync(standalonePath, 'utf8');
  const docStart = html.indexOf('<!DOCTYPE');
  html = html.slice(docStart);
  const manifest = {};
  const extResources = [];

  // Local assets
  const cssUuid = addAsset(manifest, fs.readFileSync(path.join(dsRoot, 'styles.css')), 'text/css');
  html = html.replace('href="../../styles.css"', `href="${cssUuid}"`);

  const bundleUuid = addAsset(manifest, fs.readFileSync(path.join(dsRoot, '_ds_bundle.js')), 'text/javascript');
  html = html.replace('src="../../_ds_bundle.js"', `src="${bundleUuid}"`);

  // CDN scripts
  const scripts = [
    ['https://unpkg.com/react@18.3.1/umd/react.development.js', 'text/javascript'],
    ['https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js', 'text/javascript'],
    ['https://unpkg.com/@babel/standalone@7.29.0/babel.min.js', 'text/javascript'],
  ];
  for (const [url, mime] of scripts) {
    const uuid = addAsset(manifest, await fetchBytes(url), mime);
    html = html.replace(url, uuid);
  }

  // Font files referenced in styles.css / fonts.css
  const styles = fs.readFileSync(path.join(dsRoot, 'styles.css'), 'utf8');
  const fontUrls = [...styles.matchAll(/url\(([^)]+\.woff2[^)]*)\)/g)].map((x) => x[1].replace(/['"]/g, ''));
  for (const url of fontUrls) {
    if (!url.startsWith('http')) continue;
    const uuid = addAsset(manifest, await fetchBytes(url), 'font/woff2');
    html = html.split(url).join(uuid);
  }

  // Lucide icons
  for (const { url, id } of parseExtResources(html)) {
    const uuid = addAsset(manifest, await fetchBytes(url), 'image/svg+xml');
    extResources.push({ id, uuid });
  }

  return { template: html, manifest, extResources };
}

const { shell, loader } = readShell();
console.log('Fetching assets…');
const { template, manifest, extResources } = await buildTemplate();

const thumbnail = `<div id="__bundler_thumbnail">
  <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#e11b11"></rect>
    <g fill="none" stroke="#ffffff" stroke-width="34" stroke-linecap="round">
      <line x1="600" y1="250" x2="600" y2="550"></line>
      <line x1="470" y1="325" x2="730" y2="475"></line>
      <line x1="470" y1="475" x2="730" y2="325"></line>
      <line x1="600" y1="250" x2="560" y2="300"></line><line x1="600" y1="250" x2="640" y2="300"></line>
      <line x1="600" y1="550" x2="560" y2="500"></line><line x1="600" y1="550" x2="640" y2="500"></line>
    </g>
  </svg>
</div>`;

const result = [
  shell,
  thumbnail,
  '\n  <div id="__bundler_loading">Unpacking...</div>\n\n  ',
  loader,
  '\n\n  <script type="__bundler/manifest">\n',
  JSON.stringify(manifest),
  '\n</script>\n  <script type="__bundler/ext_resources">\n',
  JSON.stringify(extResources),
  '\n</script>\n  <script type="__bundler/template">\n',
  JSON.stringify(template),
  '\n</script>\n</body>\n</html>\n',
].join('');

fs.writeFileSync(offlinePath, result, 'utf8');
console.log('Wrote', offlinePath);
console.log('Assets:', Object.keys(manifest).length, '| icons:', extResources.length);
console.log('isNewProject:', template.includes('isNewProject'));
