// Capturas limpias del reproductor (fondo transparente) para el README, la web y el material promocional.
// Uso: SONIQUS_TEST=<carpeta> SONIQUS_TEST_SCRIPT=$PWD/tools/promo-shots.js npx electron .
// Crea una lista de demostración: la canción de bienvenida y copias suyas con otras etiquetas (títulos ficticios).
const fs = require('node:fs'); const path = require('node:path'); const { ipcMain } = require('electron');
const tags = require('../tags');
const DEMO = [['Marea Baja', 'Lumen Drift'], ['Hilo de Cobre', 'Las Antenas'], ['Night Bus 41', 'Kōri'], ['Satélite', 'Vera Sol'], ['Fósforo', 'Delta Blanco'], ['Órbita Lenta', 'Lumen Drift'], ['Cassette Azul', 'Paloma Ruido']];
module.exports = ({ app, win, dir }) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const js = code => win.webContents.executeJavaScript(code, true);
  const shot = async name => fs.writeFileSync(path.join(dir, name + '.png'), (await win.webContents.capturePage()).toPNG());
  ipcMain.once('ready', async () => {
    try {
      const src = path.join(__dirname, '..', 'assets', 'Soniqus - So Good to Be True.mp3'), files = [];
      for (const [i, [title, artist]] of DEMO.entries()) {
        const f = path.join(dir, `demo-${i + 1}.mp3`); fs.copyFileSync(src, f);
        await tags.writeTags(f, { title, artist, album: 'Demo', year: '2026', track: String(i + 2) }, null, null); files.push(f);
      }
      await sleep(2500); // suena la canción de bienvenida (silenciada)
      await js(`(async () => { const a = window.__app; const r = await window.sq.expand(${JSON.stringify(files)}, null); a.addItems(r.items, false, false); a.setState({ sel: 0, repeat: true, shuffle: true, eq: [5, 5, 4, 4, 3, 2, 0, -1, -2, -2, -1, 0, 1, 2, 3, 4, 4, 5, 5, 5], preset: 'Rock', amp: 0.6, modeCon: 1, modeMid: 0, view: 'viz' }); })()`);
      await sleep(3500); await shot('console-vu3d');
      await js(`window.__app.setState({ vizClean: true })`); await sleep(1500); await shot('console-clean'); await js(`window.__app.setState({ vizClean: false })`);
      await js(`window.__app.setState({ modeCon: 3 })`); await sleep(2500); await shot('console-flight');
      await js(`window.__app.setState({ modeCon: 2 })`); await sleep(2500); await shot('console-halo');
      await js(`window.__app.setState({ modeCon: 1 }); window.__app.vals.presetToggle()`); await sleep(1500); await shot('console-presets'); await js(`window.__app.setState({ presetOpen: false })`);
      await js(`window.__app.vals.goList()`); await sleep(2600); await shot('console-playlist');
      await js(`window.__app.vals.goSettings()`); await sleep(2600); await shot('console-settings');
      await js(`window.__app.vals.goInfo()`); await sleep(2600); await shot('console-id3');
      await js(`window.__app.vals.links.acerca()`); await sleep(2600); await shot('console-about');
      await js(`window.__app.setState({ view: 'viz', win: 'compact', modeMid: 0 })`); await sleep(2500); await shot('compact');
      await js(`window.__app.setState({ modeMid: 1 })`); await sleep(2500); await shot('compact-vu3d');
      await js(`window.__app.setState({ win: 'min' })`); await sleep(1500); await shot('mini-bar');
    } catch (e) { console.error(e); }
    app.exit(0);
  });
};
