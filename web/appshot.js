// Compone la imagen del reproductor que usa la web (modo compacto + consola, fondo transparente)
// a partir de las capturas de tools/promo-shots.js en build/promo/. Uso: electron web/appshot.js → web/soniqus-app.png
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'); const path = require('node:path'); const { pathToFileURL } = require('node:url');
const root = path.join(__dirname, '..'); const u = f => pathToFileURL(path.join(root, f)).href;
const W = 1410, H = 980; // mismas proporciones que la imagen del diseño (705×490), al doble de resolución
const con = (file, bodyW, x, y) => { const w = bodyW / 0.8298, h = w * 1892 / 1880; return `<img src="${u('build/promo/' + file)}" style="position:absolute;width:${w}px;left:${x - w * 0.0851}px;top:${y - h * 0.0529}px">`; };
const cmp = (file, bodyW, x, y) => { const w = bodyW / 0.68, h = w * 1.68; return `<img src="${u('build/promo/' + file)}" style="position:absolute;width:${w}px;left:${x - w * 0.16}px;top:${y - h * 0.0595}px">`; };
app.on('window-all-closed', () => {}); app.dock && app.dock.hide();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: W, height: H, show: false, frame: false, transparent: true, useContentSize: true, webPreferences: { offscreen: true } });
  const file = path.join(__dirname, '_appshot.html');
  fs.writeFileSync(file, `<!DOCTYPE html><html><body style="margin:0;width:${W}px;height:${H}px;position:relative;overflow:hidden;background:transparent">${con('console-vu3d.png', 860, 510, 46)}${cmp('compact.png', 430, 40, 60)}</body></html>`);
  await win.loadFile(file);
  await win.webContents.executeJavaScript('Promise.all([...document.images].map(i => i.decode().catch(() => 0))).then(() => 1)'); await new Promise(r => setTimeout(r, 600));
  fs.writeFileSync(path.join(__dirname, 'soniqus-app.png'), (await win.webContents.capturePage()).resize({ width: W, height: H, quality: 'best' }).toPNG()); fs.rmSync(file);
  console.log('web/soniqus-app.png'); app.exit(0);
});
