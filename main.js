// Soniqus — proceso principal (Electron).
// © NUVOLACAT
const { app, BrowserWindow, ipcMain, dialog, protocol, screen, shell, Menu, net } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const fsp = fs.promises;
const { Readable } = require('node:stream');
const { execFile } = require('node:child_process');
const tags = require('./tags');

const TEST = process.env.SONIQUS_TEST || '';
if (TEST) app.setPath('userData', path.join(TEST, 'userData'));

if (process.argv.includes('--reset-data')) {
  try { fs.rmSync(app.getPath('userData'), { recursive: true, force: true }); } catch (e) { /* nada que borrar */ }
  if (app.isPackaged) {
    try { fs.rmSync(path.join(app.getPath('home'), 'Library/Preferences/cat.nuvola.soniqus.plist'), { force: true }); } catch (e) { /* nada */ }
    try { fs.rmSync(path.join(app.getPath('home'), 'Library/Saved Application State/cat.nuvola.soniqus.savedState'), { recursive: true, force: true }); } catch (e) { /* nada */ }
    try { require('node:child_process').execFileSync('/usr/bin/defaults', ['delete', 'cat.nuvola.soniqus'], { stdio: 'ignore' }); } catch (e) { /* sin preferencias */ }
  }
}

protocol.registerSchemesAsPrivileged([{ scheme: 'sq', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }]);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const APP_DIR = path.join(__dirname, 'app');
let VERSION = '1.0.0';
try { VERSION = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'version.json'), 'utf8')).version || VERSION; } catch (e) { /* sin compilar */ }
const WELCOME = 'Soniqus - So Good to Be True.mp3';
const AUDIO = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus'];
const LISTS = ['m3u', 'm3u8', 'pls', 'cue'];
const MIME = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', png: 'image/png', woff2: 'font/woff2', woff: 'font/woff',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', opus: 'audio/ogg', flac: 'audio/flac', m4a: 'audio/mp4', aac: 'audio/aac' };
const M = { t: 50, r: 80, b: 110, l: 80 }; // margen transparente para la sombra (igual que #root en styles.css)
const ext = p => path.extname(p).slice(1).toLowerCase();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- estado persistente ----------
let stateFile, store = {};
function loadStore() {
  stateFile = path.join(app.getPath('userData'), 'state.json');
  try { store = JSON.parse(fs.readFileSync(stateFile, 'utf8')) || {}; } catch (e) { store = {}; }
}
let resetting = false;
function saveStore() {
  if (resetting) return;
  try { fs.mkdirSync(path.dirname(stateFile), { recursive: true }); fs.writeFileSync(stateFile + '.tmp', JSON.stringify(store)); fs.renameSync(stateFile + '.tmp', stateFile); } catch (e) { /* sin permiso: se ignora */ }
}

// ---------- protocolo sq:// (app + audio con peticiones por rango) ----------
async function serveFile(file, req) {
  let st;
  try { st = await fsp.stat(file); } catch (e) { return new Response('no encontrado', { status: 404 }); }
  if (!st.isFile()) return new Response('no encontrado', { status: 404 });
  const size = st.size, range = req.headers.get('range');
  let start = 0, end = size - 1, status = 200;
  const h = { 'Content-Type': MIME[ext(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m && (m[1] !== '' || m[2] !== '')) {
      if (m[1] === '') start = Math.max(0, size - Number(m[2]));
      else { start = Number(m[1]); if (m[2] !== '') end = Math.min(size - 1, Number(m[2])); }
      if (start > end || start >= size) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      status = 206; h['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }
  }
  h['Content-Length'] = String(size ? end - start + 1 : 0);
  if (!size) return new Response('', { status: 200, headers: h });
  return new Response(Readable.toWeb(fs.createReadStream(file, { start, end })), { status, headers: h });
}
function handleSq(req) {
  const u = new URL(req.url);
  if (u.pathname === '/media') {
    const p = u.searchParams.get('p') || '';
    if (!path.isAbsolute(p) || !AUDIO.includes(ext(p))) return new Response('no permitido', { status: 403 });
    return serveFile(p, req);
  }
  if (u.pathname === '/stream') {
    const t = u.searchParams.get('u') || '';
    if (!/^https?:\/\//i.test(t)) return new Response('no permitido', { status: 403 });
    return net.fetch(t, { headers: { 'Icy-MetaData': '0' } });
  }
  const file = path.normalize(path.join(APP_DIR, decodeURIComponent(u.pathname)));
  if (!file.startsWith(APP_DIR + path.sep)) return new Response('no permitido', { status: 403 });
  return serveFile(file, req);
}

// ---------- ficheros, carpetas y listas ----------
function parseList(file, text) {
  const dir = path.dirname(file), e = ext(file), items = [];
  const abs = s => (/^https?:\/\//i.test(s) ? { url: s } : { path: path.isAbsolute(s) ? s : path.resolve(dir, s.replace(/\\/g, '/')) });
  if (e === 'pls') {
    const files = {}, titles = {};
    for (const line of text.split(/\r?\n/)) {
      let m = /^File(\d+)=(.+)$/i.exec(line.trim()); if (m) files[m[1]] = m[2].trim();
      m = /^Title(\d+)=(.+)$/i.exec(line.trim()); if (m) titles[m[1]] = m[2].trim();
    }
    for (const k of Object.keys(files).sort((a, b) => a - b)) items.push({ ...abs(files[k]), title: titles[k] });
  } else if (e === 'cue') {
    for (const m of text.matchAll(/^\s*FILE\s+"([^"]+)"/gim)) items.push(abs(m[1]));
  } else {
    let title;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('#')) { const m = /^#EXTINF:[^,]*,(.*)$/.exec(line); if (m) title = m[1].trim(); continue; }
      items.push({ ...abs(line), title }); title = undefined;
    }
  }
  return items;
}
async function expand(paths, formats) {
  const fm = Array.isArray(formats) && formats.length ? formats : [...AUDIO, ...LISTS];
  const audio = new Set(AUDIO.filter(x => fm.includes(x)));
  const lists = new Set(LISTS.filter(x => fm.includes(x) || (x === 'm3u8' && fm.includes('m3u'))));
  const items = []; let folder = false;
  const coll = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const addList = async p => {
    let text; try { text = (await fsp.readFile(p, 'utf8')).replace(/^﻿/, ''); } catch (e) { return; }
    for (const it of parseList(p, text)) {
      if (it.url) items.push(it);
      else if (audio.has(ext(it.path))) items.push(it);
    }
  };
  const walk = async d => {
    let ents; try { ents = await fsp.readdir(d, { withFileTypes: true }); } catch (e) { return; }
    ents.sort((a, b) => coll.compare(a.name, b.name));
    for (const en of ents) {
      if (en.name.startsWith('.')) continue;
      const p = path.join(d, en.name);
      if (en.isDirectory()) await walk(p);
      else if (audio.has(ext(p))) items.push({ path: p });
    }
  };
  for (const p of paths) {
    let st; try { st = await fsp.stat(p); } catch (e) { continue; }
    if (st.isDirectory()) { folder = true; await walk(p); }
    else if (audio.has(ext(p))) items.push({ path: p });
    else if (lists.has(ext(p))) await addList(p);
  }
  return { items, folder };
}

// ---------- ventana ----------
let win = null, mode = 'full', lang = 'Español', wprefs = {}, dragT = null, rendererReady = false;
const pending = [];

function clampToScreen(b) {
  const wa = screen.getDisplayMatching(b).workArea;
  const x = Math.max(wa.x - M.l, Math.min(b.x, wa.x + wa.width - b.width + M.r));
  const y = Math.max(wa.y - M.t, Math.min(b.y, wa.y + wa.height - M.t - 60));
  return { ...b, x: Math.round(x), y: Math.round(y) };
}
function rememberPos() {
  if (!win || win.isDestroyed()) return;
  const b = win.getBounds();
  store.pos = { mode, x: b.x, y: b.y };
}
function createWin() {
  win = new BrowserWindow({
    width: 780 + M.l + M.r, height: 800 + M.t + M.b, show: false,
    frame: false, transparent: true, hasShadow: false, resizable: false, maximizable: false, fullscreenable: false,
    backgroundColor: '#00000000', title: 'Soniqus',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false },
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.on('close', () => { rememberPos(); saveStore(); });
  win.on('closed', () => { win = null; });
  win.loadURL('sq://app/index.html');
  if (TEST) win.webContents.setAudioMuted(true);
}
function send(ch, ...a) { if (win && !win.isDestroyed()) win.webContents.send('sq:' + ch, ...a); }
function openPaths(paths) {
  if (!rendererReady) { pending.push(...paths); return; }
  if (win) { win.show(); send('open', paths); }
}

// ---------- menú ----------
const ML = {
  'Español': { file: 'Archivo', open: 'Abrir…', saveList: 'Guardar lista…', edit: 'Edición', play: 'Reproducción', toggle: 'Reproducir / Pausa', next: 'Siguiente', prev: 'Anterior', stop: 'Detener', view: 'Ver', compact: 'Modo compacto', full: 'Consola de navegación', min: 'Barra mini', close: 'Cerrar ventana', about: 'Acerca de Soniqus', hide: 'Ocultar Soniqus', quit: 'Salir de Soniqus', win: 'Ventana', help: 'Ayuda', keys: 'Atajos de teclado',
    helpText: 'Espacio — reproducir / pausa\n← / → — retroceder / avanzar 5 s\n↑ / ↓ — cambiar el efecto visual (o moverse por la lista)\nEnter — reproducir la canción seleccionada\nSupr — borrar de la lista · ⌥↑ / ⌥↓ — mover\nEsc — atrás\n⌘1 / ⌘2 / ⌘3 — modo compacto / consola / barra mini\nDoble clic en la carcasa — alternar compacto y consola\nArrastra archivos o carpetas a la ventana para añadirlos.' },
  'Català': { file: 'Fitxer', open: 'Obre…', saveList: 'Desa la llista…', edit: 'Edició', play: 'Reproducció', toggle: 'Reprodueix / Pausa', next: 'Següent', prev: 'Anterior', stop: 'Atura', view: 'Visualització', compact: 'Mode compacte', full: 'Consola de navegació', min: 'Barra mini', close: 'Tanca la finestra', about: 'Quant a Soniqus', hide: 'Amaga Soniqus', quit: 'Surt de Soniqus', win: 'Finestra', help: 'Ajuda', keys: 'Dreceres de teclat',
    helpText: 'Espai — reprodueix / pausa\n← / → — enrere / endavant 5 s\n↑ / ↓ — canvia l’efecte visual (o mou-te per la llista)\nRetorn — reprodueix la cançó seleccionada\nSupr — esborra de la llista · ⌥↑ / ⌥↓ — mou\nEsc — enrere\n⌘1 / ⌘2 / ⌘3 — mode compacte / consola / barra mini\nDoble clic a la carcassa — alterna compacte i consola\nArrossega fitxers o carpetes a la finestra per afegir-los.' },
  'English': { file: 'File', open: 'Open…', saveList: 'Save Playlist…', edit: 'Edit', play: 'Playback', toggle: 'Play / Pause', next: 'Next', prev: 'Previous', stop: 'Stop', view: 'View', compact: 'Compact Mode', full: 'Navigation Console', min: 'Mini Bar', close: 'Close Window', about: 'About Soniqus', hide: 'Hide Soniqus', quit: 'Quit Soniqus', win: 'Window', help: 'Help', keys: 'Keyboard Shortcuts',
    helpText: 'Space — play / pause\n← / → — back / forward 5 s\n↑ / ↓ — change the visual effect (or move in the playlist)\nEnter — play the selected song\nDelete — remove from the playlist · ⌥↑ / ⌥↓ — move\nEsc — back\n⌘1 / ⌘2 / ⌘3 — compact mode / console / mini bar\nDouble-click the body — toggle compact and console\nDrop files or folders on the window to add them.' },
};
function showHelp() {
  const L = ML[lang] || ML['Español'];
  dialog.showMessageBox(win, { type: 'info', message: 'Soniqus — ' + L.keys, detail: L.helpText, buttons: ['OK'] });
}
function showAbout() { if (win) { win.show(); send('menu', 'about'); } }
function buildMenu() {
  const L = ML[lang] || ML['Español'];
  const cmd = c => () => { if (win) { if (c !== 'close') win.show(); send('menu', c); } };
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Soniqus', submenu: [{ label: L.about, click: showAbout }, { type: 'separator' }, { label: L.hide, role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { label: L.quit, role: 'quit' }] },
    { label: L.file, submenu: [{ label: L.open, accelerator: 'Cmd+O', click: cmd('open') }, { label: L.saveList, accelerator: 'Cmd+S', click: cmd('saveList') }, { type: 'separator' }, { label: L.close, accelerator: 'Cmd+W', click: cmd('close') }] },
    { label: L.edit, submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: L.play, submenu: [{ label: L.toggle, accelerator: 'Cmd+P', click: cmd('toggle') }, { label: L.next, accelerator: 'Cmd+Right', click: cmd('next') }, { label: L.prev, accelerator: 'Cmd+Left', click: cmd('prev') }, { label: L.stop, accelerator: 'Cmd+.', click: cmd('stop') }] },
    { label: L.view, submenu: [{ label: L.compact, accelerator: 'Cmd+1', click: cmd('compact') }, { label: L.full, accelerator: 'Cmd+2', click: cmd('full') }, { label: L.min, accelerator: 'Cmd+3', click: cmd('min') }] },
    { label: L.help, submenu: [{ label: L.keys, click: showHelp }] },
  ]));
}

// ---------- MusicBrainz (1 petición/s, con User-Agent) ----------
let mbLast = 0, mbChain = Promise.resolve();
function mbFetch(url) {
  const run = async () => {
    const wait = mbLast + 1100 - Date.now();
    if (wait > 0) await sleep(wait);
    mbLast = Date.now();
    const r = await net.fetch(url, { headers: { 'User-Agent': `Soniqus/${VERSION} ( https://nuvola.cat )`, Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  };
  const p = mbChain.then(run, run);
  mbChain = p.catch(() => {});
  return p;
}

// ---------- grabación a WAV ----------
let rec = null;
function recStop() {
  if (!rec) return;
  const h = Buffer.alloc(44), n = rec.bytes, sr = rec.sampleRate;
  h.write('RIFF', 0); h.writeUInt32LE(36 + n, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(n, 40);
  try { fs.writeSync(rec.fd, h, 0, 44, 0); fs.closeSync(rec.fd); } catch (e) { /* nada */ }
  rec = null;
}

// ---------- IPC ----------
function ipc() {
  ipcMain.on('state:load', e => { e.returnValue = store.r || null; });
  ipcMain.on('state:save', (e, r) => { if (!resetting) { store.r = r; saveStore(); } e.returnValue = true; });

  ipcMain.on('ready', () => {
    rendererReady = true;
    if (win) { if (TEST) win.showInactive(); else win.show(); }
    if (pending.length) { send('open', pending.splice(0)); }
    else if (!store.welcomed) {
      // Primer arranque: copia la canción de bienvenida a los datos de la app y la reproduce.
      try {
        const dst = path.join(app.getPath('userData'), WELCOME);
        fs.writeFileSync(dst, fs.readFileSync(path.join(APP_DIR, 'assets', WELCOME)));
        store.welcomed = true; saveStore();
        send('welcome', dst);
      } catch (err) { /* sin canción de bienvenida */ }
    }
  });
  ipcMain.on('win:mode', (e, m, w, h, first) => {
    if (!win) return;
    const W = Math.round(w + M.l + M.r), H = Math.round(h + M.t + M.b);
    let b = win.getBounds(), x, y;
    if (first) {
      const p = store.pos;
      if (wprefs.rememberPos !== false && p && p.mode === m) { x = p.x; y = p.y; }
      else { const wa = screen.getPrimaryDisplay().workArea; x = wa.x + (wa.width - W) / 2; y = wa.y + Math.max(0, (wa.height - H) / 3); }
    } else { x = b.x + b.width / 2 - W / 2; y = b.y; }
    mode = m;
    win.setBounds(clampToScreen({ x: Math.round(x), y: Math.round(y), width: W, height: H }));
  });
  ipcMain.on('win:ignore', (e, on) => { if (win) win.setIgnoreMouseEvents(!!on, { forward: true }); });
  ipcMain.on('win:drag', (e, on) => {
    clearInterval(dragT); dragT = null;
    if (!win) return;
    if (!on) { rememberPos(); return; }
    const c0 = screen.getCursorScreenPoint(), b0 = win.getBounds();
    dragT = setInterval(() => {
      if (!win || win.isDestroyed()) { clearInterval(dragT); return; }
      const c = screen.getCursorScreenPoint();
      win.setBounds({ x: b0.x + c.x - c0.x, y: b0.y + c.y - c0.y, width: b0.width, height: b0.height });
    }, 8);
  });
  ipcMain.on('win:hide', () => { if (win) win.hide(); });
  ipcMain.on('win:prefs', (e, p) => {
    wprefs = p || {};
    if (!win) return;
    win.setAlwaysOnTop(!!wprefs.onTop, 'floating');
    win.setOpacity(wprefs.translucent ? 0.82 : 1);
    if (app.isPackaged) { try { app.setLoginItemSettings({ openAtLogin: !!wprefs.startup }); } catch (err) { /* nada */ } }
    if (wprefs.lang && wprefs.lang !== lang) { lang = wprefs.lang; buildMenu(); }
  });

  ipcMain.handle('dlg:open', async (e, formats) => {
    const fm = Array.isArray(formats) && formats.length ? formats : [...AUDIO, ...LISTS];
    const r = await dialog.showOpenDialog(win, { properties: ['openFile', 'openDirectory', 'multiSelections'], filters: [{ name: 'Audio', extensions: fm.includes('m3u') ? [...fm, 'm3u8'] : fm }] });
    if (r.canceled || !r.filePaths.length) return null;
    return expand(r.filePaths, formats);
  });
  ipcMain.handle('files:expand', (e, paths, formats) => expand(paths, formats));
  ipcMain.handle('tags:read', async (e, file, wantCover) => {
    try { return await tags.readTags(file, !!wantCover); } catch (err) { return { missing: true, tags: {}, cover: null, tech: null }; }
  });
  ipcMain.handle('tags:write', (e, file, t, cover, dest) => tags.writeTags(file, t || {}, cover, dest));
  ipcMain.handle('dlg:save', async (e, name, extension) => {
    const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath('music'), name), filters: [{ name: extension.toUpperCase(), extensions: [extension] }] });
    return r.canceled ? null : r.filePath;
  });
  ipcMain.handle('list:save', async (e, items) => {
    const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath('music'), 'soniqus.m3u'), filters: [{ name: 'M3U', extensions: ['m3u'] }] });
    if (r.canceled || !r.filePath) return false;
    const out = ['#EXTM3U'];
    for (const it of items) { out.push(`#EXTINF:${Math.round(it.d || -1)},${it.artist ? it.artist + ' - ' : ''}${it.title || ''}`); out.push(it.path || it.url); }
    await fsp.writeFile(r.filePath, out.join('\n') + '\n', 'utf8');
    return true;
  });
  ipcMain.handle('mb:search', async (e, q) => {
    try { return await mbFetch('https://musicbrainz.org/ws/2/recording/?fmt=json&limit=5&query=' + encodeURIComponent(q)); } catch (err) { return { error: err.message }; }
  });
  ipcMain.handle('mb:cover', async (e, id) => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    try {
      const r = await net.fetch(`https://coverartarchive.org/release/${id}/front-250`);
      if (!r.ok) return null;
      return { mime: r.headers.get('content-type') || 'image/jpeg', data: new Uint8Array(await r.arrayBuffer()) };
    } catch (err) { return null; }
  });
  ipcMain.on('sys:volume', (e, v) => { execFile('/usr/bin/osascript', ['-e', `set volume output volume ${Math.round(Math.max(0, Math.min(1, v)) * 100)}`], () => {}); });
  ipcMain.handle('sys:getVolume', () => new Promise(res => {
    execFile('/usr/bin/osascript', ['-e', 'output volume of (get volume settings)'], (err, out) => { const n = parseInt(out, 10); res(err || !(n >= 0) ? null : n / 100); });
  }));
  ipcMain.handle('rec:start', async (e, sampleRate) => {
    recStop();
    const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath('music'), 'soniqus.wav'), filters: [{ name: 'WAV', extensions: ['wav'] }] });
    if (r.canceled || !r.filePath) return null;
    try { const fd = fs.openSync(r.filePath, 'w'); fs.writeSync(fd, Buffer.alloc(44)); rec = { fd, bytes: 0, sampleRate: Math.round(sampleRate) || 44100 }; } catch (err) { return null; }
    return r.filePath;
  });
  ipcMain.on('rec:chunk', (e, buf) => { if (!rec) return; const b = Buffer.from(buf); try { fs.writeSync(rec.fd, b); rec.bytes += b.length; } catch (err) { /* disco lleno */ } });
  ipcMain.on('rec:stop', recStop);
  ipcMain.on('open:external', (e, url) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); });
  ipcMain.on('open:music', () => shell.openPath(app.getPath('music')));
  ipcMain.on('app:reset', () => {
    // Borrar caché: deja Soniqus como recién instalado (ajustes, lista, cachés y arranque al iniciar) y lo reabre.
    resetting = true; recStop();
    if (app.isPackaged) { try { app.setLoginItemSettings({ openAtLogin: false }); } catch (err) { /* nada */ } }
    app.relaunch({ args: process.argv.slice(1).filter(a => a !== '--reset-data').concat('--reset-data') });
    app.exit(0);
  });
  ipcMain.on('app:version', e => { e.returnValue = VERSION; });
  ipcMain.on('help', showHelp);
}

// ---------- arranque ----------
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', (e, argv) => {
    if (win) win.show();
    const files = argv.slice(1).filter(a => !a.startsWith('-') && path.isAbsolute(a));
    if (files.length) openPaths(files);
  });
  app.on('open-file', (e, p) => { e.preventDefault(); openPaths([p]); });
  app.whenReady().then(() => {
    loadStore();
    lang = (store.r && store.r.prefs && store.r.prefs.lang) || 'Español';
    // Si una actualización trae otra canción de bienvenida, renueva la copia que ya había en los datos de la app.
    try {
      const dst = path.join(app.getPath('userData'), WELCOME), src = fs.readFileSync(path.join(APP_DIR, 'assets', WELCOME));
      if (fs.existsSync(dst) && !fs.readFileSync(dst).equals(src)) fs.writeFileSync(dst, src);
    } catch (err) { /* sin canción de bienvenida */ }
    protocol.handle('sq', handleSq);
    ipc();
    buildMenu();
    createWin();
    if (TEST) { try { require(process.env.SONIQUS_TEST_SCRIPT || './tools/selftest')({ app, win, dir: TEST }); } catch (e) { console.error(e); app.exit(1); } }
  });
  app.on('activate', () => { if (win) win.show(); else if (app.isReady()) createWin(); });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', () => { recStop(); rememberPos(); saveStore(); });
}
