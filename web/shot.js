// Sirve web/dist en local y captura la página (comprobación visual) y la imagen OG. Uso: electron web/shot.js <carpeta-salida>
const { app, BrowserWindow } = require('electron');
const http = require('node:http'); const fs = require('node:fs'); const path = require('node:path');
const dist = path.join(__dirname, 'dist'), out = process.argv[2] || __dirname;
const MIME = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2', xml: 'text/xml', txt: 'text/plain' };
const srv = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(dist, p); if (!f.startsWith(dist) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': MIME[f.split('.').pop()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s); });
app.commandLine.appendSwitch('lang', 'en-US'); // sin esto, la portada redirige a /es/ en un sistema en castellano
app.on('window-all-closed', () => {}); // entre captura y captura no queda ninguna ventana
app.dock && app.dock.hide();
process.on('unhandledRejection', e => { console.error(e); app.exit(1); });
app.whenReady().then(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const errors = [];
  const shot = async (url, w, h, name, js) => {
    const win = new BrowserWindow({ width: w, height: h, show: false, useContentSize: true, webPreferences: { offscreen: true } });
    win.webContents.on('console-message', (e) => { if (e.level === 'error' || e.level === 3) errors.push(name + ': ' + e.message); });
    try { await win.loadURL(base + url); } catch (e) { errors.push(name + ': ' + e.message); } if (js) await win.webContents.executeJavaScript(js);
    await new Promise(r => setTimeout(r, 2500));
    fs.writeFileSync(path.join(out, name), (await win.webContents.capturePage()).toPNG()); win.destroy();
  };
  const at = id => `document.documentElement.style.scrollBehavior='auto'; document.querySelector('${id}').scrollIntoView(); 1`;
  await shot('/', 1440, 900, 'web-en-arriba.png');
  await shot('/es/', 1440, 900, 'web-es-arriba.png');
  await shot('/es/', 1440, 1000, 'web-es-captura.png', `document.documentElement.style.scrollBehavior='auto'; scrollTo(0, 760); 1`);
  await shot('/es/', 1440, 1100, 'web-es-funciones.png', at('#features'));
  await shot('/es/', 1440, 1100, 'web-es-visuales.png', at('#visuals'));
  await shot('/es/', 1440, 1200, 'web-es-descarga.png', at('#skins'));
  await shot('/es/', 390, 844, 'web-es-movil.png');
  // Imagen OG 1200×630: el titular del hero
  await shot('/', 1200, 630, 'og.png', `document.querySelector('header').style.display='none'; document.querySelector('#top').style.padding='70px 64px'; document.querySelector('#top h1').style.fontSize='150px'; document.querySelectorAll('#top a').forEach(a=>a.style.display='none'); document.body.style.overflow='hidden'; 1`);
  console.log('errores:', JSON.stringify(errors)); app.exit(0);
});
