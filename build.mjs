// Build: bundles src/ into js/app.js, and writes a single-file copy to dist/index.html.
// Usage: npm install && npm run build
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.dirname(fileURLToPath(import.meta.url));
const svg = {};
for (const f of fs.readdirSync(`${root}/assets/pieces`)) {
  svg[f.replace('.svg', '')] = 'data:image/svg+xml;base64,' + fs.readFileSync(`${root}/assets/pieces/${f}`).toString('base64');
}
await esbuild.build({
  entryPoints: [`${root}/src/main.js`], bundle: true, format: 'iife', minify: true,
  target: ['es2019'], outfile: `${root}/js/app.js`, define: { __PIECE_SVG__: JSON.stringify(svg), __TEST__: process.env.CHESS_TEST ? 'true' : 'false' }, legalComments: 'none',
});
let html = fs.readFileSync(`${root}/index.html`, 'utf8');
const css = fs.readFileSync(`${root}/css/style.css`, 'utf8');
const js = fs.readFileSync(`${root}/js/app.js`, 'utf8').replace(/<\/script/gi, '<\\/script');
html = html.replace('<link rel="stylesheet" href="css/style.css">', () => `<style>\n${css}</style>`);
html = html.replace('<script src="js/app.js"></script>', () => `<script>\n${js}</script>`);
fs.mkdirSync(`${root}/dist`, { recursive: true });
fs.writeFileSync(`${root}/dist/index.html`, html);
console.log(`Built js/app.js (${(fs.statSync(`${root}/js/app.js`).size / 1024).toFixed(0)} KB) and dist/index.html`);
