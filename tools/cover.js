// Dibuja una carátula cuadrada con el logotipo de soniqus (build/cover-soniqus.jpg). Uso: electron tools/cover.js
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'); const path = require('node:path');
const font = fs.readFileSync(path.join(__dirname, '..', 'app/assets/unbounded-latin-900-normal.woff2')).toString('base64');
const html = `<!DOCTYPE html><html><head><style>@font-face{font-family:U;font-weight:900;src:url(data:font/woff2;base64,${font})}
body{margin:0;width:1000px;height:1000px;background:radial-gradient(120% 100% at 30% 0%, #1b2390, #0a0f5c 60%, #060a33);display:flex;align-items:center;justify-content:center;overflow:hidden}</style></head><body>
<div style="display:flex;align-items:baseline;font-family:U;font-weight:900;font-size:168px;letter-spacing:-.04em;color:#f4ff3a;line-height:1"><span>s</span><span style="width:.74em;height:.61em;border-radius:50%;border:.1em solid #f4ff3a;box-sizing:border-box;margin:0 .025em;transform:translateY(.018em);flex:none;position:relative"><span style="position:absolute;inset:0;margin:auto;width:.26em;height:.26em;border-radius:50%;background:#f4ff3a"></span></span><span>niqus</span></div></body></html>`;
app.dock && app.dock.hide();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1000, height: 1000, show: false, frame: false, useContentSize: true, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await win.webContents.executeJavaScript('document.fonts.ready.then(()=>1)');
  await new Promise(r => setTimeout(r, 700));
  const img = (await win.webContents.capturePage()).resize({ width: 1000, height: 1000, quality: 'best' });
  const out = path.join(__dirname, '..', 'build', 'cover-soniqus.jpg');
  fs.writeFileSync(out, img.toJPEG(92)); console.log(out, fs.statSync(out).size);
  app.exit(0);
});
