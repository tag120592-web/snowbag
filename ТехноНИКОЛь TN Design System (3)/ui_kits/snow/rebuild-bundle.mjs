/**
 * Пересборка секций ui_kits/snow/build/* в _ds_bundle.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from '../../../web/node_modules/esbuild/lib/main.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dsRoot = path.resolve(__dirname, '../..');
const bundlePath = path.join(dsRoot, '_ds_bundle.js');
const buildDir = path.join(__dirname, 'build');

const files = [
  'Projects.jsx',
  'Result.jsx',
  'RoofCanvas.jsx',
  'Shell.jsx',
  'StepsA.jsx',
  'StepsB.jsx',
  'app.jsx',
  'data.js',
];

function transpile(relPath, source) {
  if (relPath.endsWith('.jsx')) {
    return esbuild.transformSync(source, {
      loader: 'jsx',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'es2020',
    }).code;
  }
  return source;
}

function replaceSection(bundle, relPath, code) {
  const marker = `// ui_kits/snow/build/${relPath}`;
  const start = bundle.indexOf(marker);
  if (start === -1) throw new Error(`Marker not found: ${marker}`);
  const tryStart = bundle.indexOf('try { (() => {', start);
  const end = bundle.indexOf('})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/snow/build/', start);
  if (tryStart === -1 || end === -1) throw new Error(`Section bounds not found for ${relPath}`);
  const pathEnd = bundle.indexOf('", error:', end);
  const sectionEnd = bundle.indexOf('}); }', pathEnd);
  if (sectionEnd === -1) throw new Error(`Section end not found for ${relPath}`);
  const before = bundle.slice(0, tryStart + 'try { (() => {'.length);
  const after = bundle.slice(sectionEnd);
  return before + '\n' + code + '\n' + after;
}

let bundle = fs.readFileSync(bundlePath, 'utf8');
for (const rel of files) {
  const src = fs.readFileSync(path.join(buildDir, rel), 'utf8');
  const code = transpile(rel, src);
  bundle = replaceSection(bundle, rel, code);
  console.log('Updated', rel);
}
fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('Wrote', bundlePath);
