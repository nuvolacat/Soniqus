// Propuestas de imagen para Instagram (1080×1350) con el reproductor en grande.
// Necesita las capturas de tools/promo-shots.js en build/promo/. Uso: electron web/ig.js → web/ig-opciones/ig-N.png
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'); const path = require('node:path'); const { pathToFileURL } = require('node:url');
const root = path.join(__dirname, '..'), out = path.join(__dirname, 'ig-opciones');
const u = f => pathToFileURL(path.join(root, f)).href;
const F = 'web-diseno/unpacked/';
const css = `@font-face{font-family:'Unbounded';font-weight:900;src:url(${u(F + 'e4f4755c-e818-49da-b84f-6c2247198f5a.woff2')})}
@font-face{font-family:'JetBrains Mono';font-weight:700;src:url(${u(F + '1561d2e3-d78b-4d25-b547-a761abe8bd70.woff2')})}
body{margin:0;width:1080px;height:1350px;position:relative;overflow:hidden}
.h{font-family:'Unbounded';font-weight:900;letter-spacing:-.055em;line-height:.9;margin:0;position:absolute}
.m{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.16em;font-size:22px;position:absolute;white-space:nowrap}`;
const logo = (px, c) => `<div style="display:flex;align-items:baseline;font-family:'Unbounded';font-weight:900;font-size:${px}px;letter-spacing:-.04em;color:${c};line-height:1"><span>s</span><span style="width:.74em;height:.61em;border-radius:50%;border:.1em solid ${c};box-sizing:border-box;margin:0 .025em;transform:translateY(.018em);flex:none;position:relative"><span style="position:absolute;inset:0;margin:auto;width:.26em;height:.26em;border-radius:50%;background:${c}"></span></span><span>niqus</span></div>`;
// Capturas con margen transparente: se colocan por la posición y el ancho de la carcasa, no de la imagen.
const con = (file, bodyW, x, y, extra = '') => { const w = bodyW / 0.8298, h = w * 1892 / 1880; return `<img src="${u('build/promo/' + file)}" style="position:absolute;width:${w}px;left:${x - w * 0.0851}px;top:${y - h * 0.0529}px;${extra}">`; };
const cmp = (file, bodyW, x, y, extra = '') => { const w = bodyW / 0.68, h = w * 1.68; return `<img src="${u('build/promo/' + file)}" style="position:absolute;width:${w}px;left:${x - w * 0.16}px;top:${y - h * 0.0595}px;${extra}">`; };
const nuv = (css, mode) => `<img src="${u('assets/nuvola-logo.png')}" style="position:absolute;height:40px;${css};${mode === 'dark' ? 'filter:brightness(0);opacity:.85' : ''}">`;
const rings = (x, y, cols) => cols.map((c, i) => `<span style="position:absolute;left:${x}px;top:${y}px;width:${420 + i * 300}px;height:${420 + i * 300}px;transform:translate(-50%,-50%);border-radius:50%;border:3px solid ${c};opacity:${0.85 - i * 0.12}"></span>`).join('');
const TAG = 'FREE · OPEN SOURCE · macOS';
const V = {
  // 1 · Amarillo señal: titular arriba, consola grande, pie con web y nuvola
  1: `<div style="position:absolute;inset:0;background:#f4ff3a"></div>
    <div style="position:absolute;left:0;right:0;top:64px;display:flex;justify-content:center">${logo(58, '#0a0f5c')}</div>
    <h1 class="h" style="left:0;right:0;top:166px;text-align:center;font-size:104px;color:#0a0f5c">So good<br>to be <span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${con('consola-vumetro.png', 850, 115, 400)}
    <span class="m" style="left:64px;bottom:52px;color:#0a0f5c">SONIQUS.COM</span>${nuv('right:64px;bottom:44px', 'dark')}`,
  // 2 · Azul con anillos: el hero de la web con la consola debajo
  2: `<div style="position:absolute;inset:0;background:#0a0f5c"></div>${rings(540, 820, ['#f4ff3a', '#2b3bff', '#ff5fa2', '#3cf2c8'])}
    <div style="position:absolute;left:64px;top:60px">${logo(46, '#f4ff3a')}</div>${nuv('right:64px;top:58px')}
    <h1 class="h" style="left:60px;top:156px;font-size:118px"><span style="color:#f4ff3a">So good</span><br><span style="color:#eef0ff">to be </span><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${con('consola-vuelo.png', 800, 140, 424)}
    <span class="m" style="left:0;right:0;bottom:44px;text-align:center;color:#c9cdff;font-size:19px">${TAG} · SONIQUS.COM</span>`,
  // 3 · Rosa: tarjeta rosa sobre azul, la consola inclinada y el titular debajo
  3: `<div style="position:absolute;inset:0;background:#0a0f5c"></div><div style="position:absolute;inset:36px;border-radius:56px;background:#ff5fa2"></div>
    <div style="position:absolute;left:96px;top:92px">${logo(48, '#0a0f5c')}</div>${nuv('right:96px;top:92px', 'dark')}
    ${con('consola-halo.png', 800, 140, 196, 'transform:rotate(-3deg)')}
    <h1 class="h" style="left:0;right:0;top:1046px;text-align:center;font-size:96px;color:#0a0f5c">So good<br>to be true.</h1>
    <span class="m" style="left:0;right:0;bottom:78px;text-align:center;color:#0a0f5c;font-size:19px">${TAG}</span>`,
  // 4 · Escritorio retro: cielo, prado y barra de tareas, con la consola enorme
  4: `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#1f5fd1 0%,#3b86ea 40%,#8fc9ff 66%,#cfeaff 74%)"></div>
    <div style="position:absolute;left:4%;top:5%;width:46%;height:10%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,0));filter:blur(8px)"></div>
    <div style="position:absolute;right:2%;top:11%;width:40%;height:8%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.85),rgba(255,255,255,0));filter:blur(9px)"></div>
    <div style="position:absolute;left:-40%;right:10%;top:70%;height:60%;border-radius:50%;background:radial-gradient(120% 60% at 45% 8%,#9be05a 0%,#5fbf2e 22%,#3d9a1f 55%,#2a7a14 100%)"></div>
    <div style="position:absolute;left:20%;right:-50%;top:74%;height:60%;border-radius:50%;background:radial-gradient(100% 55% at 40% 6%,#a8ea66 0%,#6cc93a 20%,#45a524 55%,#2f8318 100%)"></div>
    <h1 class="h" style="left:60px;top:70px;font-size:78px;color:#fff;text-shadow:0 4px 0 rgba(10,15,92,.35)">So good to be <span style="color:#f4ff3a;font-style:italic">true.</span></h1>
    ${con('consola-vumetro.png', 900, 90, 306)}
    <span style="position:absolute;top:176px;right:48px;background:#ff5fa2;color:#0a0f5c;font-family:'Unbounded';font-weight:900;font-size:40px;padding:18px 28px;border-radius:50px;transform:rotate(-7deg);box-shadow:0 8px 0 rgba(10,15,92,.35)">it’s back!</span>
    <div style="position:absolute;left:0;right:0;bottom:0;height:104px;background:linear-gradient(180deg,#5a68ff 0%,#2b3bff 12%,#1f2bd8 60%,#1a24b8 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.45)">
      <div style="position:absolute;left:0;top:0;bottom:0;display:flex;align-items:center;padding:0 44px 0 30px;background:linear-gradient(180deg,#fbff8a 0%,#f4ff3a 45%,#c9d400 100%);border-radius:0 40px 40px 0;box-shadow:3px 0 8px rgba(0,0,0,.3)">${logo(44, '#0a0f5c')}</div>${nuv('right:44px;top:32px')}</div>`,
  // 5 · Primer plano: la consola tan grande que se sale del encuadre
  5: `<div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 30% 0%, #1b2390, #0a0f5c 55%, #060a33)"></div>
    <div style="position:absolute;left:64px;top:64px">${logo(54, '#f4ff3a')}</div>${nuv('right:64px;top:66px')}
    <h1 class="h" style="left:60px;top:176px;font-size:82px"><span style="color:#f4ff3a">So good </span><span style="color:#eef0ff">to be </span><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${con('consola-vumetro.png', 1240, 70, 330, 'transform:rotate(-5deg);transform-origin:20% 20%')}
    <span class="m" style="left:64px;bottom:56px;color:#0a0f5c;background:#f4ff3a;padding:12px 20px;border-radius:30px;font-size:20px">${TAG}</span>`,
  // 6 · Modo compacto: el reproductor compacto de arriba abajo, con el titular al lado
  6: `<div style="position:absolute;inset:0;background:#0a0f5c"></div><div style="position:absolute;left:0;top:0;bottom:0;width:470px;background:#f4ff3a"></div>
    ${cmp('compacto-ondas.png', 560, 100, 116)}
    <div style="position:absolute;left:700px;top:96px">${logo(48, '#f4ff3a')}</div>
    <h1 class="h" style="left:694px;top:330px;font-size:96px;line-height:.92"><span style="color:#f4ff3a">So<br>good</span><br><span style="color:#eef0ff">to be</span><br><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    <span class="m" style="left:700px;top:800px;color:#c9cdff;font-size:19px;line-height:1.9;white-space:normal;width:330px">FREE<br>OPEN SOURCE<br>macOS<br>SONIQUS.COM</span>
    ${nuv('left:700px;bottom:80px')}`,
};
// ---- Formato historia (1080×1920): lo importante queda entre y=250 y y=1620, fuera de la interfaz de Instagram ----
const VS = {
  1: `<div style="position:absolute;inset:0;background:#f4ff3a"></div>
    <div style="position:absolute;left:0;right:0;top:270px;display:flex;justify-content:center">${logo(64, '#0a0f5c')}</div>
    <h1 class="h" style="left:0;right:0;top:384px;text-align:center;font-size:126px;color:#0a0f5c">So good<br>to be <span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${con('consola-vumetro.png', 900, 90, 690)}
    <span class="m" style="left:90px;top:1650px;color:#0a0f5c">SONIQUS.COM</span>${nuv('right:90px;top:1640px', 'dark')}`,
  2: `<div style="position:absolute;inset:0;background:#0a0f5c"></div>${rings(540, 1130, ['#f4ff3a', '#2b3bff', '#ff5fa2', '#3cf2c8', '#2b3bff'])}
    <div style="position:absolute;left:80px;top:266px">${logo(50, '#f4ff3a')}</div>${nuv('right:80px;top:266px')}
    <h1 class="h" style="left:76px;top:376px;font-size:132px"><span style="color:#f4ff3a">So good</span><br><span style="color:#eef0ff">to be </span><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${con('consola-vuelo.png', 880, 100, 690)}
    <span class="m" style="left:0;right:0;top:1640px;text-align:center;color:#c9cdff;font-size:20px">${TAG} · SONIQUS.COM</span>`,
  3: `<div style="position:absolute;inset:0;background:#0a0f5c"></div><div style="position:absolute;inset:36px;border-radius:64px;background:#ff5fa2"></div>
    <div style="position:absolute;left:110px;top:276px">${logo(52, '#0a0f5c')}</div>${nuv('right:110px;top:278px', 'dark')}
    ${con('consola-halo.png', 820, 130, 410, 'transform:rotate(-3deg)')}
    <h1 class="h" style="left:0;right:0;top:1326px;text-align:center;font-size:112px;color:#0a0f5c">So good<br>to be true.</h1>
    <span class="m" style="left:0;right:0;top:1580px;text-align:center;color:#0a0f5c;font-size:20px">${TAG}</span>`,
  4: `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#1f5fd1 0%,#3b86ea 40%,#8fc9ff 68%,#cfeaff 76%)"></div>
    <div style="position:absolute;left:2%;top:4%;width:52%;height:8%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,0));filter:blur(9px)"></div>
    <div style="position:absolute;right:0;top:10%;width:44%;height:7%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.85),rgba(255,255,255,0));filter:blur(10px)"></div>
    <div style="position:absolute;left:-45%;right:8%;top:72%;height:50%;border-radius:50%;background:radial-gradient(120% 60% at 45% 8%,#9be05a 0%,#5fbf2e 22%,#3d9a1f 55%,#2a7a14 100%)"></div>
    <div style="position:absolute;left:18%;right:-55%;top:75%;height:50%;border-radius:50%;background:radial-gradient(100% 55% at 40% 6%,#a8ea66 0%,#6cc93a 20%,#45a524 55%,#2f8318 100%)"></div>
    <h1 class="h" style="left:76px;top:270px;font-size:112px;color:#fff;text-shadow:0 5px 0 rgba(10,15,92,.35)">So good<br>to be <span style="color:#f4ff3a;font-style:italic">true.</span></h1>
    <span style="position:absolute;top:286px;right:56px;background:#ff5fa2;color:#0a0f5c;font-family:'Unbounded';font-weight:900;font-size:44px;padding:20px 30px;border-radius:54px;transform:rotate(-7deg);box-shadow:0 8px 0 rgba(10,15,92,.35)">it’s back!</span>
    ${con('consola-vumetro.png', 920, 80, 600)}
    <div style="position:absolute;left:0;right:0;bottom:0;height:330px;background:linear-gradient(180deg,#5a68ff 0%,#2b3bff 5%,#1f2bd8 40%,#1a24b8 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,.45)">
      <div style="position:absolute;left:0;top:0;height:110px;display:flex;align-items:center;padding:0 46px 0 32px;background:linear-gradient(180deg,#fbff8a 0%,#f4ff3a 45%,#c9d400 100%);border-radius:0 0 44px 0;box-shadow:3px 0 8px rgba(0,0,0,.3)">${logo(46, '#0a0f5c')}</div>${nuv('right:60px;top:36px')}</div>`,
  5: `<div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 30% 0%, #1b2390, #0a0f5c 55%, #060a33)"></div>
    <div style="position:absolute;left:80px;top:266px">${logo(56, '#f4ff3a')}</div>${nuv('right:80px;top:270px')}
    <h1 class="h" style="left:76px;top:380px;font-size:124px"><span style="color:#f4ff3a">So good</span><br><span style="color:#eef0ff">to be </span><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${con('consola-vumetro.png', 1480, 80, 700, 'transform:rotate(-5deg);transform-origin:20% 20%')}
    <span class="m" style="left:80px;top:1600px;color:#0a0f5c;background:#f4ff3a;padding:14px 22px;border-radius:32px;font-size:21px">${TAG}</span>`,
  6: `<div style="position:absolute;inset:0;background:#f4ff3a"></div><div style="position:absolute;left:0;right:0;top:0;height:800px;background:#0a0f5c"></div>
    <div style="position:absolute;left:80px;top:266px">${logo(50, '#f4ff3a')}</div>${nuv('right:80px;top:266px')}
    <h1 class="h" style="left:0;right:0;top:366px;text-align:center;font-size:80px"><span style="color:#f4ff3a">So good </span><span style="color:#eef0ff">to be </span><span style="color:#ff5fa2;font-style:italic">true.</span></h1>
    ${cmp('compacto-ondas.png', 560, 260, 500)}
    <span class="m" style="left:0;right:0;top:1660px;text-align:center;color:#0a0f5c;font-size:20px">${TAG} · SONIQUS.COM</span>`,
};
const STORY = process.env.IG === 'story', HH = STORY ? 1920 : 1350, SET = STORY ? VS : V, PRE = STORY ? 'story' : 'ig';
app.on('window-all-closed', () => {}); app.dock && app.dock.hide();
app.whenReady().then(async () => {
  fs.mkdirSync(out, { recursive: true });
  const win = new BrowserWindow({ width: 1080, height: HH, show: false, useContentSize: true, webPreferences: { offscreen: true } });
  for (const n of Object.keys(SET)) {
    const file = path.join(out, `_ig-${n}.html`);
    fs.writeFileSync(file, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="height:${HH}px">${SET[n]}</body></html>`);
    await win.loadFile(file);
    await win.webContents.executeJavaScript('Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => 0))]).then(() => 1)'); await new Promise(r => setTimeout(r, 700));
    fs.writeFileSync(path.join(out, `${PRE}-${n}.png`), (await win.webContents.capturePage()).resize({ width: 1080, height: HH, quality: 'best' }).toPNG());
    fs.rmSync(file);
  }
  console.log('propuestas en', out); app.exit(0);
});
