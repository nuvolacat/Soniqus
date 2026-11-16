// Dibuja el icono de la app (opción 5a del diseño) a 1024 px y lo guarda en build/icon-1024.png.
// Uso: electron tools/icon.js
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

// Squircle de 824 px centrado en un lienzo de 1024 (rejilla de iconos de macOS).
const S = 824;
const html = `<!DOCTYPE html><html><body style="margin:0;background:transparent;width:1024px;height:1024px;display:flex;align-items:center;justify-content:center">
<div style="width:${S}px;height:${S}px;border-radius:22.5%;background:radial-gradient(120% 100% at 30% 0%, #1b2390, #0a0f5c 60%, #060a33);box-shadow:inset 0 ${S * 0.014}px 0 rgba(255,255,255,.25), 0 ${S * 0.02}px ${S * 0.05}px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center">
<div style="width:56%;height:56%;border-radius:50%;border:${S * 0.085}px solid #f4ff3a;box-sizing:border-box;display:flex;align-items:center;justify-content:center">
<div style="width:${S * 0.17}px;height:${S * 0.17}px;border-radius:50%;background:#f4ff3a"></div></div></div></body></html>`;

app.dock && app.dock.hide();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1024, height: 1024, show: false, frame: false, transparent: true, useContentSize: true, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise(r => setTimeout(r, 600));
  const img = await win.webContents.capturePage();
  const out = path.join(__dirname, '..', 'build', 'icon-1024.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, img.resize({ width: 1024, height: 1024, quality: 'best' }).toPNG());
  console.log('icono:', out, img.getSize());
  app.exit(0);
});
