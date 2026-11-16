// Autoprueba (solo con SONIQUS_TEST=<carpeta>): recorre las pantallas en silencio,
// guarda una captura de cada una y vuelca medidas a report.json. No forma parte de la app.
const fs = require('node:fs');
const path = require('node:path');
const { ipcMain } = require('electron');

module.exports = ({ app, win, dir }) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const js = code => win.webContents.executeJavaScript(code, true);
  const report = { errors: [] };
  win.webContents.on('console-message', (e, level, message) => { if (level >= 2) report.errors.push(message); });
  const shot = async name => { const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(dir, name + '.png'), img.toPNG()); };

  // WAV de prueba: bombo a 126 bpm + platillo + bajo, 12 s, estéreo.
  const sr = 44100, secs = 12, n = sr * secs, pcm = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const t = i / sr, bt = (t * 2.1) % 1;
    const kick = Math.sin(2 * Math.PI * 55 * t) * Math.exp(-bt * 9) * 0.9;
    const hat = (Math.random() * 2 - 1) * Math.exp(-(((t * 8.4) % 1)) * 30) * 0.25;
    const bass = Math.sin(2 * Math.PI * 110 * t) * 0.18, lead = Math.sin(2 * Math.PI * (440 + 220 * Math.sin(t * 2)) * t) * 0.12;
    pcm.writeInt16LE(Math.max(-1, Math.min(1, kick + hat + bass)) * 32000, i * 4);
    pcm.writeInt16LE(Math.max(-1, Math.min(1, kick + hat + lead)) * 32000, i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  const wav = path.join(dir, 'Prueba de ritmo.wav'), wav2 = path.join(dir, 'Segunda pista.wav');
  fs.writeFileSync(wav, Buffer.concat([h, pcm])); fs.writeFileSync(wav2, Buffer.concat([h, pcm]));

  ipcMain.once('ready', async () => {
    try {
      await sleep(2500); await shot('00-arranque'); await sleep(800);
      report.fonts = await js(`document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight))`);
      report.welcome = await js(`(() => { const a = window.__app; return { tracks: a.tracks.map(t => [t.title, t.artist, Math.round(t.d)]), playing: a.state.playing }; })()`);
      report.fullHeight = await js(`document.querySelector('#root > div').offsetHeight`);
      await shot('01-inicio');
      win.webContents.send('sq:open', [wav, wav2]);
      await sleep(3500);
      report.afterOpen = await js(`(() => { const a = window.__app; return { tracks: a.tracks.map(t => [t.title, t.d, t.tech]), playing: a.state.playing, view: a.state.view, time: a.audio && a.audio.currentTime, paused: a.audio && a.audio.paused, ctx: a.ac && a.ac.state, energy: a.hist[0] && a.hist[0].reduce((x, y) => x + y, 0) }; })()`);
      await shot('02-vumetro3d');
      await js(`window.__app.setState({ modeCon: 2, modeMid: 2 })`); await sleep(1500); await shot('03-halo');
      await js(`window.__app.setState({ modeCon: 3, modeMid: 3 })`); await sleep(1500); await shot('04-vuelo');
      await js(`window.__app.setState({ modeCon: 0, modeMid: 0 })`); await sleep(1500); await shot('05-ondas');
      await js(`window.__app.vals.goList()`); await sleep(2200); await shot('06-lista');
      await js(`window.__app.vals.goSettings()`); await sleep(2200); await shot('07-ajustes');
      await js(`window.__app.setState({ setTab: 'Visuales', view: '_' }); requestAnimationFrame(() => window.__app.setState({ view: 'settings' }))`); await sleep(1800); await shot('08-ajustes-visuales');
      await js(`window.__app.vals.goInfo()`); await sleep(2200); await shot('09-info');
      await js(`window.__app.setState({ amp: 0.75, bal: -0.4, pitch: 0.1 }); window.__app.vals.links.acerca()`); await sleep(2200); await shot('09b-acerca'); report.version = await js(`window.sq.version`);
      await js(`window.__app.vals.home()`); await sleep(2200); await shot('10-panel');
      await js(`window.__app.setState({ eqOpen: false, eq: [3, 4, 5, 4, 2, 1, 0, -1, -1, 0, 1, 2, 2, 3, 3, 2, 1, 0, -1, -2] })`); await sleep(900);
      report.closedHeight = await js(`document.querySelector('#root > div').offsetHeight`);
      await shot('11-eq-cerrado');
      await js(`window.__app.setState({ eqOpen: true, view: 'viz', modeCon: 1, modeMid: 1, skin: 'azul' })`); await sleep(1500); await shot('12-azul');
      await js(`window.__app.setState({ win: 'compact', skin: 'hielo' })`); await sleep(1500); await shot('13-compacto');
      await js(`window.__app.setState({ modeMid: 0 })`); await sleep(1200); await shot('14-compacto-ondas');
      await js(`window.__app.setState({ win: 'min' })`); await sleep(1000);
      report.miniHeight = await js(`document.querySelector('#root > div').offsetHeight`);
      await shot('15-mini');
      report.end = await js(`(() => { const a = window.__app; return { time: a.audio.currentTime, idx: a.state.idx, t: a.state.t, bounds: [innerWidth, innerHeight] }; })()`);
      // Orden de reproducción con pistas de 2 s: fin de lista, repetir y aleatorio.
      const short = [1, 2, 3].map(k => { const f = path.join(dir, `corta${k}.wav`); const d = pcm.subarray(0, sr * 2 * 4); const hh = Buffer.from(h); hh.writeUInt32LE(36 + d.length, 4); hh.writeUInt32LE(d.length, 40); fs.writeFileSync(f, Buffer.concat([hh, d])); return f; });
      const load = (list, rep, shuf) => js(`(() => { const a = window.__app; a.clearList(); a.setState({ repeat: ${rep}, shuffle: ${shuf} }); window.__seq = []; a.addItems(${JSON.stringify(list.map(p => ({ path: p })))}, false, true); clearInterval(window.__iv); window.__iv = setInterval(() => { const i = a.state.playing ? a.state.idx : 'stop'; if (window.__seq[window.__seq.length - 1] !== i) window.__seq.push(i); }, 50); })()`);
      const seq = () => js(`window.__seq`);
      report.order = {};
      await load(short.slice(0, 1), false, false); await sleep(5000); report.order.unaSinRepetir = await seq();
      await load(short.slice(0, 1), true, false); await sleep(5000); report.order.unaConRepetir = [await seq(), await js(`window.__app.audio.currentTime < 2.1 && !window.__app.audio.paused`)];
      await load(short, false, false); await sleep(8500); report.order.tresSinRepetir = await seq();
      await load(short, true, false); await sleep(5000); report.order.tresConRepetir = await seq();
      await load(short, false, true); await sleep(9000); report.order.tresAleatorio = await seq();
      const mp3 = path.join(__dirname, '..', 'assets', 'Soniqus - So Good to Be True.mp3');
      if (fs.existsSync(mp3)) {
        await load([mp3], false, false); await sleep(13000); report.order.mp3SinRepetir = [await seq(), await js(`(() => { const a = window.__app.audio; return { paused: a.paused, ended: a.ended, t: a.currentTime, d: a.duration }; })()`)];
        await load([mp3, mp3], false, false); await sleep(23000); report.order.dosMp3SinRepetir = await seq();
      }
      await js(`clearInterval(window.__iv)`);
    } catch (e) { report.errors.push(String(e && e.stack || e)); }
    fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
    app.exit(0);
  });
};
