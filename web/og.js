// Propuestas de imagen para redes (Open Graph, 1200×630). Uso: electron web/og.js → web/og-opciones/og-N.png
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'); const path = require('node:path');
const root = path.join(__dirname, '..'), out = path.join(__dirname, 'og-opciones');
const b64 = f => fs.readFileSync(path.join(root, f)).toString('base64');
const F = 'web-diseno/unpacked/';
const css = `@font-face{font-family:'Unbounded';font-weight:900;src:url(data:font/woff2;base64,${b64(F + 'e4f4755c-e818-49da-b84f-6c2247198f5a.woff2')})}
@font-face{font-family:'Unbounded';font-weight:700;src:url(data:font/woff2;base64,${b64(F + 'e4f4755c-e818-49da-b84f-6c2247198f5a.woff2')})}
@font-face{font-family:'Space Grotesk';font-weight:500;src:url(data:font/woff2;base64,${b64(F + '78852696-3bfb-405a-b329-82a801c3818c.woff2')})}
@font-face{font-family:'JetBrains Mono';font-weight:700;src:url(data:font/woff2;base64,${b64(F + '1561d2e3-d78b-4d25-b547-a761abe8bd70.woff2')})}
body{margin:0;width:1200px;height:630px;position:relative;overflow:hidden;font-family:'Space Grotesk',sans-serif}
.h{font-family:'Unbounded';font-weight:900;letter-spacing:-.055em;line-height:.88;margin:0}
.m{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.14em;font-size:15px}`;
const APP = `data:image/png;base64,${b64(fs.existsSync(path.join(root, 'web/soniqus-app.png')) ? 'web/soniqus-app.png' : F + 'dc31b206-e47b-462f-a975-e7db4563ec9a.png')}`;
const logo = (px, c) => `<div style="display:flex;align-items:baseline;font-family:'Unbounded';font-weight:900;font-size:${px}px;letter-spacing:-.04em;color:${c};line-height:1"><span>s</span><span style="width:.74em;height:.61em;border-radius:50%;border:.1em solid ${c};box-sizing:border-box;margin:0 .025em;transform:translateY(.018em);flex:none;position:relative"><span style="position:absolute;inset:0;margin:auto;width:.26em;height:.26em;border-radius:50%;background:${c}"></span></span><span>niqus</span></div>`;
const icon = px => `<div style="width:${px}px;height:${px}px;border-radius:22.5%;background:radial-gradient(120% 100% at 30% 0%, #1b2390, #0a0f5c 60%, #060a33);box-shadow:0 18px 30px rgba(10,15,92,.4);display:flex;align-items:center;justify-content:center;flex:none"><span style="width:56%;aspect-ratio:1;border-radius:50%;border:${px * 0.085}px solid #f4ff3a;box-sizing:border-box;display:flex;align-items:center;justify-content:center"><span style="width:30%;aspect-ratio:1;border-radius:50%;background:#f4ff3a"></span></span></div>`;
const rings = (x, y, cols) => cols.map((c, i) => `<span style="position:absolute;left:${x}px;top:${y}px;width:${260 + i * 190}px;height:${260 + i * 190}px;transform:translate(-50%,-50%);border-radius:50%;border:2.5px solid ${c};opacity:${0.9 - i * 0.13}"></span>`).join('');
const badges = `<div style="display:flex;gap:10px"><span class="m" style="background:#ff5fa2;color:#0a0f5c;padding:8px 14px;border-radius:20px;transform:rotate(-3deg)">FREE · NO ADS</span><span class="m" style="background:#3cf2c8;color:#0a0f5c;padding:8px 14px;border-radius:20px;transform:rotate(2deg)">FOR macOS</span></div>`;
const shot = (css) => `<img src="${APP}" style="position:absolute;${css};filter:drop-shadow(0 26px 34px rgba(0,0,20,.45))">`;
const V = {
  // 1 · Titular: el hero de la web
  1: `<div style="position:absolute;inset:0;background:#0a0f5c"></div>${rings(900, 300, ['#f4ff3a', '#2b3bff', '#ff5fa2', '#3cf2c8', '#2b3bff'])}
    <div style="position:absolute;left:64px;top:60px">${badges}</div>
    <h1 class="h" style="position:absolute;left:60px;top:140px;font-size:158px"><span style="color:#f4ff3a">So good</span><br><span style="color:#eef0ff">to be </span><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    <div style="position:absolute;left:64px;bottom:54px">${logo(40, '#f4ff3a')}</div><span class="m" style="position:absolute;right:64px;bottom:62px;color:#c9cdff">SONIQUS.COM</span>`,
  // 2 · Producto: titular a la izquierda y la app a la derecha, sobre azul
  2: `<div style="position:absolute;inset:0;background:#0a0f5c"></div>${rings(880, 330, ['#2b3bff', '#f4ff3a', '#2b3bff', '#ff5fa2'])}
    <div style="position:absolute;left:60px;top:56px">${logo(44, '#f4ff3a')}</div>
    <h1 class="h" style="position:absolute;left:56px;top:184px;font-size:78px"><span style="color:#f4ff3a">So good</span><br><span style="color:#eef0ff">to be </span><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    <p style="position:absolute;left:60px;top:360px;width:420px;margin:0;font-size:24px;line-height:1.35;color:#c9cdff">The music player your desktop has been missing since 1999.</p>
    <div style="position:absolute;left:60px;bottom:52px">${badges}</div>${shot('right:-30px;top:104px;width:660px')}`,
  // 3 · Amarillo señal: color de marca, app centrada debajo
  3: `<div style="position:absolute;inset:0;background:#f4ff3a"></div>
    <div style="position:absolute;left:0;right:0;top:44px;display:flex;justify-content:center">${logo(46, '#0a0f5c')}</div>
    <h1 class="h" style="position:absolute;left:0;right:0;top:118px;text-align:center;font-size:84px;color:#0a0f5c">So good to be <span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${shot('left:50%;transform:translateX(-50%);top:218px;width:640px')}
    <span class="m" style="position:absolute;left:56px;bottom:40px;color:#0a0f5c">FREE · macOS</span><span class="m" style="position:absolute;right:56px;bottom:40px;color:#0a0f5c">SONIQUS.COM</span>`,
  // 4 · Rosa: el bloque de descarga, con el icono
  4: `<div style="position:absolute;inset:0;background:#0a0f5c"></div><div style="position:absolute;inset:34px;border-radius:44px;background:#ff5fa2"></div>
    <div style="position:absolute;left:0;right:0;top:86px;display:flex;justify-content:center">${icon(120)}</div>
    <h1 class="h" style="position:absolute;left:0;right:0;top:238px;text-align:center;font-size:124px;color:#0a0f5c">So good<br>to be true.</h1>
    <div style="position:absolute;left:0;right:0;bottom:78px;display:flex;justify-content:center;gap:26px;align-items:center;color:#0a0f5c">${logo(34, '#0a0f5c')}<span class="m">FREE MUSIC PLAYER FOR macOS</span></div>`,
  // 5 · Escritorio retro: la escena «it's back!» de la web
  5: `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#1f5fd1 0%,#3b86ea 38%,#8fc9ff 62%,#cfeaff 70%)"></div>
    <div style="position:absolute;left:6%;top:9%;width:34%;height:16%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,0));filter:blur(6px)"></div>
    <div style="position:absolute;right:4%;top:14%;width:30%;height:13%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.85),rgba(255,255,255,0));filter:blur(7px)"></div>
    <div style="position:absolute;left:-30%;right:20%;top:56%;height:110%;border-radius:50%;background:radial-gradient(120% 60% at 45% 8%,#9be05a 0%,#5fbf2e 22%,#3d9a1f 55%,#2a7a14 100%)"></div>
    <div style="position:absolute;left:30%;right:-40%;top:62%;height:110%;border-radius:50%;background:radial-gradient(100% 55% at 40% 6%,#a8ea66 0%,#6cc93a 20%,#45a524 55%,#2f8318 100%)"></div>
    ${shot('left:50%;transform:translateX(-50%);top:70px;width:690px')}
    <div style="position:absolute;left:0;right:0;bottom:0;height:64px;background:linear-gradient(180deg,#5a68ff 0%,#2b3bff 12%,#1f2bd8 60%,#1a24b8 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.45);display:flex;align-items:stretch;justify-content:space-between">
      <div style="display:flex;align-items:center;padding:0 30px 0 20px;background:linear-gradient(180deg,#fbff8a 0%,#f4ff3a 45%,#c9d400 100%);border-radius:0 26px 26px 0;box-shadow:2px 0 6px rgba(0,0,0,.3)">${logo(30, '#0a0f5c')}</div>
      <div style="display:flex;align-items:center;padding:0 26px;color:#fff;font-family:'Unbounded';font-weight:700;font-size:20px">So good to be true.</div></div>
    <span style="position:absolute;top:40px;right:48px;background:#ff5fa2;color:#0a0f5c;font-family:'Unbounded';font-weight:900;font-size:30px;padding:14px 22px;border-radius:40px;transform:rotate(-6deg)">it’s back!</span>`,
};
app.on('window-all-closed', () => {}); app.dock && app.dock.hide();
app.whenReady().then(async () => {
  fs.mkdirSync(out, { recursive: true });
  const win = new BrowserWindow({ width: 1200, height: 630, show: false, useContentSize: true, webPreferences: { offscreen: true } });
  for (const n of Object.keys(V)) {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`<!DOCTYPE html><html><head><style>${css}</style></head><body>${V[n]}</body></html>`));
    await win.webContents.executeJavaScript('document.fonts.ready.then(()=>1)'); await new Promise(r => setTimeout(r, 600));
    fs.writeFileSync(path.join(out, `og-${n}.png`), (await win.webContents.capturePage()).resize({ width: 1200, height: 630, quality: 'best' }).toPNG());
  }
  console.log('propuestas en', out); app.exit(0);
});
