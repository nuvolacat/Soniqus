// Genera release/Soniqus-darwin-arm64/Soniqus.app (icono .icns incluido, firma ad-hoc).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packager } from '@electron/packager';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'build');
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit', cwd: root });

// Icono: PNG 1024 → iconset → .icns
run(path.join(root, 'node_modules/.bin/electron'), ['tools/icon.js']);
const set = path.join(build, 'icon.iconset');
fs.rmSync(set, { recursive: true, force: true }); fs.mkdirSync(set, { recursive: true });
for (const s of [16, 32, 128, 256, 512]) {
  run('/usr/bin/sips', ['-z', String(s), String(s), 'build/icon-1024.png', '--out', path.join(set, `icon_${s}x${s}.png`)]);
  run('/usr/bin/sips', ['-z', String(s * 2), String(s * 2), 'build/icon-1024.png', '--out', path.join(set, `icon_${s}x${s}@2x.png`)]);
}
run('/usr/bin/iconutil', ['-c', 'icns', set, '-o', path.join(build, 'icon.icns')]);
for (const s of [1024, 512, 256, 128, 64, 32, 16]) run('/usr/bin/sips', ['-z', String(s), String(s), 'build/icon-1024.png', '--out', path.join(build, `icon-${s}.png`)]);

const version = JSON.parse(fs.readFileSync(path.join(root, 'app/version.json'), 'utf8')).version;
const AUDIO = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus'], LISTS = ['m3u', 'm3u8', 'pls', 'cue'];
const [appPath] = await packager({
  dir: root, name: 'Soniqus', platform: 'darwin', arch: 'arm64', out: path.join(root, 'release'), overwrite: true, prune: true,
  icon: path.join(build, 'icon.icns'), appBundleId: 'cat.nuvola.soniqus', appVersion: version, buildVersion: version, appCopyright: '© 2026 NUVOLACAT', appCategoryType: 'public.app-category.music',
  ignore: [/^\/(src|diseno|release|build|assets|web|web-diseno|docs|capturas)($|\/)/, /^\/tools\/(?!selftest\.js$).+/, /^\/\.git/, /\.md$/],
  extendInfo: {
    CFBundleDocumentTypes: [
      { CFBundleTypeName: 'Audio', CFBundleTypeRole: 'Viewer', LSHandlerRank: 'Alternate', CFBundleTypeExtensions: AUDIO },
      { CFBundleTypeName: 'Lista de reproducción', CFBundleTypeRole: 'Viewer', LSHandlerRank: 'Alternate', CFBundleTypeExtensions: LISTS },
    ],
    NSHumanReadableCopyright: '© 2026 NUVOLACAT',
  },
});
const bundle = path.join(appPath, 'Soniqus.app');
run('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', bundle]);
console.log('App lista:', bundle);
// Instalador DMG (fondo «Amarillo señal»)
for (const f of fs.readdirSync(path.join(root, 'release'))) if (f.endsWith('.dmg')) fs.rmSync(path.join(root, 'release', f));
const dmg = path.join(root, 'release', `Soniqus-${version}.dmg`);
fs.mkdirSync(path.join(build, 'dmg'), { recursive: true });
run('/usr/bin/sips', ['-s', 'format', 'png', '-z', '256', '256', '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ApplicationsFolderIcon.icns', '--out', 'build/dmg/apps.png']);
run('/usr/bin/sips', ['-Z', '600', 'assets/nuvola-logo.png', '--out', 'build/dmg/nuvola.png']);
// El fondo lleva la versión impresa: se redibuja en cada compilación.
execFileSync(path.join(root, 'node_modules/.bin/electron'), ['tools/dmg-bg.js'], { stdio: 'inherit', cwd: root, env: { ...process.env, DMG_ONLY: '7' } });
fs.copyFileSync(path.join(build, 'dmg/fondo-7.png'), path.join(build, 'dmg/fondo@2x.png'));
run('/usr/bin/sips', ['-z', '420', '660', 'build/dmg/fondo-7.png', '--out', 'build/dmg/fondo.png']);
run('uvx', ['dmgbuild', '-s', 'tools/dmg-settings.py', 'Soniqus', dmg]);
console.log('DMG listo:', dmg);
