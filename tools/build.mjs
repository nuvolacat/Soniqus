// Compila el renderer: plantilla de diseño → JSX, y empaqueta con esbuild en app/.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/renderer');
const out = path.join(root, 'app');

execFileSync(process.execPath, [path.join(root, 'tools/convert.mjs'),
  path.join(root, 'diseno/design_handoff_soniqus/Soniqus Player.dc.html'), src], { stdio: 'inherit' });

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });

await esbuild.build({
  entryPoints: [path.join(src, 'app.jsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'chrome130',
  outfile: path.join(out, 'app.js'),
  loader: { '.woff2': 'file', '.woff': 'file', '.jsx': 'jsx', '.js': 'jsx' },
  assetNames: 'assets/[name]',
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
});

fs.copyFileSync(path.join(src, 'index.html'), path.join(out, 'index.html'));
fs.copyFileSync(path.join(src, 'recorder.js'), path.join(out, 'recorder.js'));
for (const f of ['nuvola-logo.png', 'Soniqus - So Good to Be True.mp3']) fs.copyFileSync(path.join(root, 'assets', f), path.join(out, 'assets', f));
const d = new Date(), p2 = n => String(n).padStart(2, '0');
const version = `1.${p2(d.getFullYear() % 100)}.${p2(d.getMonth() + 1)}${p2(d.getDate())}.${p2(d.getHours())}${p2(d.getMinutes())}`;
fs.writeFileSync(path.join(out, 'version.json'), JSON.stringify({ version }));
console.log('app/ lista · versión', version);
