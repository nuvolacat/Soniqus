// Dibuja las propuestas de fondo para la ventana del DMG (660×420 pt, a @2x).
// Uso: electron tools/dmg-bg.js  → build/dmg/fondo-N.png (fondo real) y build/dmg/propuesta-N.png (maqueta con iconos)
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'); const path = require('node:path');
const root = path.join(__dirname, '..'), out = path.join(root, 'build/dmg');
const b64 = f => fs.readFileSync(path.join(root, f)).toString('base64');
const font = (fam, w, f) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${b64('app/assets/' + f)})}`;
const NUVOLA = `data:image/png;base64,${b64('build/dmg/nuvola.png')}`;
const ICON = `data:image/png;base64,${b64('build/icon-256.png')}`, APPS = `data:image/png;base64,${b64('build/dmg/apps.png')}`;
let VERSION = ''; try { VERSION = 'v' + JSON.parse(fs.readFileSync(path.join(root, 'app/version.json'), 'utf8')).version; } catch (e) { /* sin compilar */ }
const ONLY = process.env.DMG_ONLY; // p. ej. DMG_ONLY=7 dibuja solo el fondo elegido
const W = 660, H = 420, AX = 180, BX = 480, IY = 200; // centros de los iconos (los usa también el DMG)

const ALU = 'linear-gradient(118deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.55) 34%, rgba(255,255,255,0) 48%), radial-gradient(130% 90% at 25% 0%, #f1f2f6 0%, #d4d6de 50%, #a9acb8 100%)';
const SCREEN = 'radial-gradient(120% 120% at 50% 35%, #0e1566 0%, #060a33 55%, #02041a 100%)';
const GLASS = 'linear-gradient(155deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,.03) 30%, transparent 42%), repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px)';
const logo = (px, c) => `<div style="display:flex;align-items:baseline;font-family:'Unbounded';font-weight:900;font-size:${px}px;letter-spacing:-.04em;color:${c};line-height:1"><span>s</span><span style="width:.74em;height:.61em;border-radius:50%;border:.1em solid ${c};box-sizing:border-box;margin:0 .025em;transform:translateY(.018em);flex:none;position:relative"><span style="position:absolute;inset:0;margin:auto;width:.26em;height:.26em;border-radius:50%;background:${c}"></span></span><span>niqus</span></div>`;
const screw = (css) => `<span style="position:absolute;${css};width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #e0e1e6, #6a6c72);box-shadow:inset 0 0 0 1px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center"><span style="width:7px;height:1.5px;background:#2a2b30;transform:rotate(35deg)"></span></span>`;
const screws = screw('left:12px;top:12px') + screw('right:12px;top:12px') + screw('left:12px;bottom:12px') + screw('right:12px;bottom:12px');
const mono = (t, c, extra = '') => `<span style="font-family:'JetBrains Mono';font-weight:500;font-size:10px;letter-spacing:.3em;color:${c};${extra}">${t}</span>`;
// Flecha de puntos tipo LED entre los dos iconos
const dots = (y, on = '#f4ff3a', n = 9) => Array.from({ length: n }, (_, i) => `<span style="position:absolute;left:${AX + 78 + i * ((BX - AX - 156) / (n - 1)) - 3.5}px;top:${y - 3.5}px;width:7px;height:7px;border-radius:50%;background:${on};box-shadow:0 0 0 2px #0a0e45, 0 0 8px rgba(244,255,58,.7)"></span>`).join('')
  + `<span style="position:absolute;left:${BX - 74}px;top:${y - 9}px;width:0;height:0;border-top:9px solid transparent;border-bottom:9px solid transparent;border-left:13px solid ${on};filter:drop-shadow(0 0 4px rgba(244,255,58,.7))"></span>`;
// Flecha fina y lisa
const arrow = c => `<span style="position:absolute;left:${AX + 84}px;top:${IY - 1.5}px;width:${BX - AX - 172}px;height:3px;border-radius:2px;background:${c}"></span><span style="position:absolute;left:${BX - 96}px;top:${IY - 7.5}px;width:12px;height:12px;border-top:3px solid ${c};border-right:3px solid ${c};border-radius:2px;transform:rotate(45deg)"></span>`;
const nuv =(css, dark) => `<img src="${NUVOLA}" style="position:absolute;${css};height:26px;${dark ? 'filter:invert(1);opacity:.85' : ''}">`;

const V = {
  // 1 · Consola: carcasa de aluminio, logo y rótulo de cabecera, banda de LEDs, pie con nuvola
  1: `<div style="position:absolute;inset:0;background:${ALU}"></div>${screws}
    <div style="position:absolute;left:38px;top:30px">${logo(24, '#1b1f4a')}</div>
    <div style="position:absolute;right:40px;top:38px">${mono('INSTALLATION CONSOLE', '#1b1f4a')}</div>
    <div style="position:absolute;left:${AX + 70}px;top:${IY - 13}px;width:${BX - AX - 140}px;height:26px;border-radius:13px;background:linear-gradient(180deg,#0a0e45,#1c237f);box-shadow:inset 0 2px 3px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.5)"></div>${dots(IY)}
    <div style="position:absolute;left:0;right:0;top:${IY + 108}px;text-align:center">${mono('ARRASTRA SONIQUS A APLICACIONES', '#1b1f4a')}</div>
    <div style="position:absolute;left:30px;right:30px;bottom:26px;height:46px;border-radius:23px;background:${SCREEN};box-shadow:0 0 0 4px #1c1d21, 0 0 0 5px rgba(255,255,255,.3), inset 0 6px 16px rgba(0,0,0,.7)"><div style="position:absolute;inset:0;border-radius:inherit;background:${GLASS}"></div>
      <span style="position:absolute;left:22px;top:17px">${mono('UN PRODUCTO DE', '#8f96d6')}</span>${nuv('right:22px;top:10px')}</div>`,
  // 2 · Pantalla: todo el fondo es la pantalla azul; los iconos van en dos «ventanas» de aluminio
  2: `<div style="position:absolute;inset:0;background:${SCREEN}"></div><div style="position:absolute;inset:0;background:radial-gradient(90% 120% at 100% 100%, rgba(43,59,255,.28), transparent 60%)"></div>
    ${[AX, BX].map(x => `<div style="position:absolute;left:${x - 92}px;top:${IY - 92}px;width:184px;height:200px;border-radius:32px;background:${ALU};box-shadow:inset 0 2px 0 rgba(255,255,255,.5), inset 0 -3px 0 rgba(0,0,0,.25), 0 0 0 4px #0a0e45, 0 14px 30px rgba(0,0,0,.55)"></div>`).join('')}
    ${dots(IY)}
    <div style="position:absolute;left:36px;top:26px">${logo(26, '#f4ff3a')}</div>
    <div style="position:absolute;right:38px;top:36px;display:flex;align-items:center;gap:6px"><span style="width:5px;height:5px;border-radius:50%;background:#f4ff3a;box-shadow:0 0 6px #f4ff3a"></span>${mono('INSTALAR', '#8f96d6')}</div>
    <div style="position:absolute;left:36px;bottom:30px">${mono('ARRASTRA SONIQUS A APLICACIONES', '#8f96d6')}</div>${nuv('right:36px;bottom:24px')}
    <div style="position:absolute;inset:0;background:${GLASS}"></div>`,
  // 3 · Ondas: aluminio con los anillos del visualizador saliendo del icono de la app
  3: `<div style="position:absolute;inset:0;background:${ALU}"></div>
    ${Array.from({ length: 9 }, (_, i) => { const d = 150 + i * 105; return `<span style="position:absolute;left:${AX - d / 2}px;top:${IY - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:${i % 3 === 2 ? 2.5 : 1.5}px solid ${i % 3 === 2 ? 'rgba(43,59,255,.55)' : 'rgba(27,31,74,.28)'};box-sizing:border-box;opacity:${1 - i * 0.09}"></span>`; }).join('')}
    <div style="position:absolute;left:0;right:0;top:28px;display:flex;justify-content:center">${logo(30, '#1b1f4a')}</div>
    ${dots(IY)}
    <div style="position:absolute;left:0;right:0;top:${IY + 108}px;text-align:center">${mono('ARRASTRA SONIQUS A APLICACIONES', '#1b1f4a')}</div>
    <div style="position:absolute;left:50%;bottom:22px;transform:translateX(-50%);height:44px;padding:0 26px;border-radius:22px;background:#0a0f5c;box-shadow:inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 3px rgba(10,14,69,.25), 0 6px 14px rgba(0,0,0,.3);display:flex;align-items:center"><img src="${NUVOLA}" style="height:24px"></div>`,
  // 4 · Compacto: la silueta del modo compacto tumbada (dos círculos unidos por una píldora) sobre azul
  4: `<div style="position:absolute;inset:0;background:radial-gradient(120% 100% at 30% 0%, #1b2390, #0a0f5c 60%, #060a33)"></div>
    <div style="position:absolute;inset:0;filter:drop-shadow(0 22px 26px rgba(0,0,0,.5))">
      <div style="position:absolute;left:${AX - 104}px;top:${IY - 98}px;width:208px;height:208px;border-radius:50%;background:${ALU};background-size:${W}px ${H}px;background-position:${-(AX - 104)}px ${-(IY - 98)}px"></div>
      <div style="position:absolute;left:${BX - 104}px;top:${IY - 98}px;width:208px;height:208px;border-radius:50%;background:${ALU};background-size:${W}px ${H}px;background-position:${-(BX - 104)}px ${-(IY - 98)}px"></div>
      <div style="position:absolute;left:${AX + 40}px;top:${IY - 44}px;width:${BX - AX - 80}px;height:100px;border-radius:40px;background:${ALU};background-size:${W}px ${H}px;background-position:${-(AX + 40)}px ${-(IY - 44)}px"></div>
    </div>
    <div style="position:absolute;left:${AX + 70}px;top:${IY - 13}px;width:${BX - AX - 140}px;height:26px;border-radius:13px;background:linear-gradient(180deg,#0a0e45,#1c237f);box-shadow:inset 0 2px 3px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.5)"></div>${dots(IY)}
    <div style="position:absolute;left:0;right:0;top:26px;display:flex;justify-content:center">${logo(28, '#f4ff3a')}</div>
    <div style="position:absolute;left:36px;bottom:30px">${mono('ARRASTRA SONIQUS A APLICACIONES', '#aab0e8')}</div>${nuv('right:36px;bottom:24px')}`,
  // ---- Segunda ronda: limpias, sin relieve ----
  // 5 · Claro mínimo: fondo casi blanco, flecha fina, logos pequeños
  5: `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#fbfbfd,#eef0f5)"></div>
    <div style="position:absolute;left:0;right:0;top:34px;display:flex;justify-content:center">${logo(26, '#0a0f5c')}</div>
    ${arrow('#0a0f5c')}
    <div style="position:absolute;left:0;right:0;bottom:30px;display:flex;justify-content:center"><img src="${NUVOLA}" style="height:22px;filter:invert(1);opacity:.75"></div>`,
  // 6 · Azul con anillo: azul de marca liso con el anillo del icono enorme y recortado; rótulos sobre píldoras claras
  6: `<div style="position:absolute;inset:0;background:#0a0f5c"></div>
    <span style="position:absolute;left:-190px;top:-150px;width:560px;height:560px;border-radius:50%;border:86px solid rgba(244,255,58,.10);box-sizing:border-box"></span>
    <span style="position:absolute;left:5px;top:45px;width:170px;height:170px;border-radius:50%;background:rgba(244,255,58,.10)"></span>
    ${[AX, BX].map(x => `<span style="position:absolute;left:${x - 62}px;top:${IY + 58}px;width:124px;height:24px;border-radius:12px;background:#eef0ff"></span>`).join('')}
    ${arrow('#f4ff3a')}
    <div style="position:absolute;right:36px;top:30px">${logo(24, '#f4ff3a')}</div>${nuv('right:36px;bottom:26px')}`,
  // 7 · Amarillo señal: color de marca a toda la ventana, todo en azul marino
  7: `<div style="position:absolute;inset:0;background:#f4ff3a"></div>
    <div style="position:absolute;left:36px;top:30px">${logo(30, '#0a0f5c')}</div>
    ${arrow('#0a0f5c')}
    <div style="position:absolute;left:36px;bottom:26px;display:flex;flex-direction:column;gap:7px">${mono('ARRASTRA A APLICACIONES', '#0a0f5c')}${mono('DRAG TO APPLICATIONS', '#0a0f5c')}</div>
    <img src="${NUVOLA}" style="position:absolute;right:36px;top:33px;height:24px;filter:brightness(0);opacity:.85">
    <span style="position:absolute;right:36px;bottom:26px;font-family:'JetBrains Mono';font-weight:500;font-size:11px;letter-spacing:.12em;color:#0a0f5c">${VERSION}</span>`,
  // 8 · Tipográfica: el logotipo gigante como marca de agua detrás de los iconos
  8: `<div style="position:absolute;inset:0;background:#f4f5f9"></div>
    <div style="position:absolute;left:-28px;top:118px;opacity:.07">${logo(182, '#0a0f5c')}</div>
    ${arrow('#0a0f5c')}
    <div style="position:absolute;left:36px;top:32px">${logo(20, '#0a0f5c')}</div>
    <img src="${NUVOLA}" style="position:absolute;right:36px;top:30px;height:20px;filter:invert(1);opacity:.75">
    <div style="position:absolute;left:0;right:0;bottom:32px;text-align:center">${mono('ARRASTRA SONIQUS A APLICACIONES', 'rgba(10,15,92,.6)')}</div>`,
};
const mock =`<img src="${ICON}" style="position:absolute;left:${AX - 60}px;top:${IY - 62}px;width:120px;height:120px"><img src="${APPS}" style="position:absolute;left:${BX - 56}px;top:${IY - 58}px;width:112px;height:112px">
  <span style="position:absolute;left:${AX - 80}px;width:160px;top:${IY + 62}px;text-align:center;font:13px 'Helvetica Neue',Helvetica,sans-serif;color:#111">Soniqus</span><span style="position:absolute;left:${BX - 80}px;width:160px;top:${IY + 62}px;text-align:center;font:13px 'Helvetica Neue',Helvetica,sans-serif;color:#111">Aplicaciones</span>`;
const page = (n, withMock) => `<!DOCTYPE html><html><head><style>${font('Unbounded', 900, 'unbounded-latin-900-normal.woff2')}${font('JetBrains Mono', 500, 'jetbrains-mono-latin-500-normal.woff2')}
  body{margin:0;width:${W}px;height:${H}px;zoom:2;position:relative;overflow:hidden}</style></head><body>${V[n]}${withMock ? mock : ''}</body></html>`;

app.dock && app.dock.hide();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: W * 2, height: H * 2, show: false, frame: false, useContentSize: true, webPreferences: { offscreen: true } });
  for (const n of Object.keys(V).filter(k => !ONLY || k === ONLY)) for (const m of [false, true]) {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page(n, m)));
    await win.webContents.executeJavaScript('document.fonts.ready.then(()=>1)');
    await new Promise(r => setTimeout(r, 500));
    const img = (await win.webContents.capturePage()).resize({ width: W * 2, height: H * 2, quality: 'best' });
    fs.writeFileSync(path.join(out, `${m ? 'propuesta' : 'fondo'}-${n}.png`), img.toPNG());
  }
  console.log('fondos en', out);
  app.exit(0);
});
