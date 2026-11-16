// Genera la web estática de soniqus.com a partir del diseño (web-diseno/unpacked/template.html).
// El marcado y los estilos salen tal cual del diseño; aquí se resuelven los textos por idioma,
// se sustituye el runtime del prototipo por HTML/CSS/JS planos y se adapta lo que es propio de producción.
// Uso: node web/build.mjs  →  web/dist/
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..');
const unp = path.join(root, 'web-diseno/unpacked'), dist = path.join(here, 'dist');
const tpl = fs.readFileSync(path.join(unp, 'template.html'), 'utf8');
const SITE = 'https://soniqus.com'; // Doku redirige www → dominio principal

// ---------- versión y descarga: el último DMG generado ----------
const dmgs = fs.readdirSync(path.join(root, 'release')).filter(f => /^Soniqus-[\d.]+\.dmg$/.test(f)).sort();
if (!dmgs.length) throw new Error('No hay ningún DMG en release/');
const DMG = dmgs[dmgs.length - 1], VERSION = DMG.replace(/^Soniqus-|\.dmg$/g, '');
const MB = Math.round(fs.statSync(path.join(root, 'release', DMG)).size / 1e6);
const DL = `/descargas/${DMG}`;

// ---------- datos del diseño (COPY, CARD, SKINS) ----------
const script = tpl.slice(tpl.indexOf('const COPY'), tpl.indexOf('</script>', tpl.indexOf('const COPY')));
const consts = script.slice(0, script.indexOf('class Component'));
const ctx = {}; vm.runInNewContext(consts + '\nthis.COPY = COPY; this.CARD = CARD; this.SKINS = SKINS;', ctx);
const { COPY, CARD, SKINS } = ctx;
// Adaptaciones de producción sobre los textos del diseño
for (const [lang, t] of Object.entries(COPY)) {
  t.dlNote = `v${VERSION} · ${MB} MB`;
  t.platforms = [['macOS', 'Apple Silicon']]; // la compilación actual es solo arm64
}

// ---------- plantilla → HTML ----------
const bodyTpl = tpl.slice(tpl.indexOf('<div style="min-height:100vh;overflow:hidden">'), tpl.indexOf('</x-dc>'));
const hov = new Map();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const get = (scope, expr) => expr.trim().split('.').reduce((o, k) => (o == null ? o : o[k]), scope);

function render(html, scope) {
  // bucles sc-for (no hay anidados en este diseño)
  html = html.replace(/<sc-for list="\{\{ (.*?) \}\}" as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, list, as, inner) =>
    get(scope, list).map(item => render(inner, { ...scope, [as]: item })).join(''));
  // estilos al pasar el ratón → clases
  html = html.replace(/ style-hover="([^"]*)"/g, (_, css) => { if (!hov.has(css)) hov.set(css, 'hv' + (hov.size + 1)); return ` class="${hov.get(css)}"`; });
  // valores
  return html.replace(/\{\{ (.*?) \}\}/g, (_, e) => { const v = get(scope, e); if (v == null) throw new Error('Sin valor: ' + e); return v && v.__html ? v.__html : esc(v); });
}

function page(lang) {
  const t = COPY[lang], other = lang === 'en' ? 'es' : 'en';
  const url = l => (l === 'en' ? '/' : '/es/');
  const items = [...t.marquee, ...t.marquee];
  const scope = {
    t,
    marquee: { __html: `<div style="display:flex;width:max-content;animation:sqMarq 28s linear infinite">${items.map(s => `<span style="display:flex;align-items:center;gap:28px;padding-right:28px;font-family:'Unbounded',sans-serif;font-weight:900;font-size:clamp(20px,2.6vw,34px);letter-spacing:-.02em;white-space:nowrap">${esc(s)}<span style="width:18px;height:18px;border-radius:50%;border:4px solid #0a0f5c;box-sizing:border-box;flex:none"></span></span>`).join('')}</div>` },
    ripples: { __html: `<div style="position:absolute;inset:0">${[0, 1, 2, 3, 4, 5].map(i => `<span style="position:absolute;left:50%;top:50%;width:100%;height:100%;border-radius:50%;border:2px solid ${['#f4ff3a', '#2b3bff', '#ff5fa2', '#3cf2c8', '#2b3bff', '#f4ff3a'][i]};opacity:0;animation:sqPulse 7.2s cubic-bezier(.2,.6,.3,1) ${-i * 1.2}s infinite"></span>`).join('')}</div>` },
    clock: { __html: `<span data-clock="${lang}">${lang === 'es' ? '12:00' : '12:00 PM'}</span>` },
    langs: ['en', 'es'].map(c => ({ code: c.toUpperCase(), url: url(c), lang: c, bg: c === lang ? '#eef0ff' : 'transparent', fg: c === lang ? '#0a0f5c' : '#eef0ff' })),
    features: t.features.map(([title, body], i) => ({ n: String(i + 1).padStart(2, '0'), title, body, bg: CARD[i][0], fg: CARD[i][1] })),
    visuals: t.visuals.map(([name, body], i) => ({ n: String(i + 1).padStart(2, '0'), name, body, canvas: { __html: `<canvas data-viz="${i}" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;display:block"></canvas>` } })),
    skins: SKINS.map(([es, en, body]) => ({ name: lang === 'es' ? es : en, body })),
    platforms: t.platforms.map(([name, sub]) => ({ name, sub })),
  };
  let b = bodyTpl;
  const sub = (a, c, n = 1) => { if (b.split(a).length - 1 !== n) throw new Error(`Adaptación «${a.slice(0, 50)}»: ${b.split(a).length - 1} ≠ ${n}`); b = b.split(a).join(c); };
  // selector de idioma: enlaces a la otra versión (en el prototipo era estado de React)
  sub(`<div sc-camel-on-click="{{ l.on }}" style="padding:5px 11px;border-radius:16px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.08em;cursor:pointer;background:{{ l.bg }};color:{{ l.fg }}">{{ l.code }}</div>`,
    `<a href="{{ l.url }}" hreflang="{{ l.lang }}" data-lang="{{ l.lang }}" style="padding:5px 11px;border-radius:16px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.08em;cursor:pointer;background:{{ l.bg }};color:{{ l.fg }}">{{ l.code }}</a>`);
  // botón de plataforma: descarga real del DMG
  sub(`<a href="#download" style="background:#0a0f5c;color:#f4ff3a;`, `<a href="${DL}" download style="background:#0a0f5c;color:#f4ff3a;`);
  // recursos locales y pie legal
  sub('url(&quot;dc31b206-e47b-462f-a975-e7db4563ec9a&quot;)', `url(&quot;/assets/soniqus-app.png?v=${VERSION}&quot;)`);
  sub('https://nuvola.cat/assets/img/nuvola-logo.png', '/assets/nuvola-logo.png');
  sub('<span>© 2026 NUVOLACAT S.L.U. · {{ t.footer }}</span>', '<a href="https://github.com/nuvolacat/Soniqus" target="_blank" rel="noopener" style="color:#8f96d6;font-family:\'JetBrains Mono\',monospace;font-size:13px;letter-spacing:.04em" style-hover="color:#eef0ff">github.com/nuvolacat/Soniqus</a>');
  // overflow:hidden en el contenedor anulaba la cabecera fija (position:sticky); clip recorta igual sin romperla
  sub('<div style="min-height:100vh;overflow:hidden">', '<div style="min-height:100vh;overflow:clip">');
  const body = render(b, scope);
  const desc = lang === 'es' ? 'soniqus — el reproductor de música que tu escritorio echa de menos desde 1999. So good to be true.' : 'soniqus — the music player your desktop has been missing since 1999. So good to be true.';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>soniqus — So good to be true.</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE}${url(lang)}">
<link rel="alternate" hreflang="en" href="${SITE}/">
<link rel="alternate" hreflang="es" href="${SITE}/es/">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="soniqus">
<meta property="og:title" content="soniqus — So good to be true.">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}${url(lang)}">
<meta property="og:image" content="${SITE}/assets/og.png?v=${VERSION}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0a0f5c">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/e4f4755c-e818-49da-b84f-6c2247198f5a.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${VERSION}">
${lang === 'en' ? `<script>try{if(!localStorage.getItem('soniqus-lang')&&(navigator.language||'').toLowerCase().indexOf('es')===0)location.replace('/es/'+location.hash)}catch(e){}</script>` : ''}
</head>
<body>
${body}
<script src="/assets/site.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

// ---------- salida ----------
fs.rmSync(dist, { recursive: true, force: true });
for (const d of ['assets/fonts', 'es', 'descargas']) fs.mkdirSync(path.join(dist, d), { recursive: true });
const en = page('en'), es = page('es');
fs.writeFileSync(path.join(dist, 'index.html'), en);
fs.writeFileSync(path.join(dist, 'es/index.html'), es);

// CSS: tipografías del diseño (ficheros locales) + estilos globales + clases :hover
const styles = [...tpl.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);
let css = styles.join('\n').replace(/url\("([0-9a-f-]{36})"\)/g, 'url("/assets/fonts/$1.woff2")');
const imp = d => d.split(';').map(x => x.trim()).filter(Boolean).map(x => x + ' !important').join(';');
for (const [d, c] of hov) css += `.${c}{transition:transform .2s, box-shadow .2s, background .2s, color .2s}\n.${c}:hover{${imp(d)}}\n`;
css += 'a[data-lang]{text-decoration:none}\n@media (prefers-reduced-motion:reduce){*{animation-duration:.01s !important;animation-iteration-count:1 !important}}\n';
fs.writeFileSync(path.join(dist, 'assets/site.css'), css);
for (const f of fs.readdirSync(unp)) if (f.endsWith('.woff2')) fs.copyFileSync(path.join(unp, f), path.join(dist, 'assets/fonts', f));

// JS: los visualizadores del diseño tal cual (clase Component) con un arranque mínimo, sin React
const cls = script.slice(script.indexOf('class Component'));
fs.writeFileSync(path.join(dist, 'assets/site.js'), `// soniqus.com — visualizadores (del diseño) y reloj. © NUVOLACAT
(function () {
  'use strict';
  class DCLogic { constructor() { this.props = {}; } setState(s) { Object.assign(this.state, typeof s === 'function' ? s(this.state) : s); } }
  ${cls}
  document.querySelectorAll('a[data-lang]').forEach(function (a) { a.addEventListener('click', function () { try { localStorage.setItem('soniqus-lang', a.dataset.lang); } catch (e) {} }); });
  var clock = document.querySelector('[data-clock]');
  function tick() { if (!clock) return; var d = new Date(); clock.textContent = clock.dataset.clock === 'es' ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  tick(); setInterval(tick, 15000);
  var c = new Component();
  document.querySelectorAll('canvas[data-viz]').forEach(function (el) { c.cv[el.dataset.viz] = el; });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) c.raf = requestAnimationFrame(c.loop);
  else { c.data(); c.hist.unshift(c.data().spec); c.loop(); cancelAnimationFrame(c.raf); }
})();
`);

// recursos
// La imagen del reproductor es una captura real de la app (web/appshot.js); si falta, se usa la del diseño.
fs.copyFileSync(fs.existsSync(path.join(here, 'soniqus-app.png')) ? path.join(here, 'soniqus-app.png') : path.join(unp, 'dc31b206-e47b-462f-a975-e7db4563ec9a.png'), path.join(dist, 'assets/soniqus-app.png'));
fs.copyFileSync(path.join(root, 'assets/nuvola-logo.png'), path.join(dist, 'assets/nuvola-logo.png'));
fs.writeFileSync(path.join(dist, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0a0f5c"/><circle cx="50" cy="50" r="23.5" fill="none" stroke="#f4ff3a" stroke-width="9"/><circle cx="50" cy="50" r="8.5" fill="#f4ff3a"/></svg>\n`);
fs.copyFileSync(path.join(root, 'build/icon-32.png'), path.join(dist, 'favicon-32.png'));
fs.copyFileSync(path.join(root, 'build/icon-256.png'), path.join(dist, 'apple-touch-icon.png'));
if (fs.existsSync(path.join(here, 'og.png'))) fs.copyFileSync(path.join(here, 'og.png'), path.join(dist, 'assets/og.png'));
fs.copyFileSync(path.join(root, 'release', DMG), path.join(dist, 'descargas', DMG));
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${['/', '/es/'].map(u => `  <url><loc>${SITE}${u}</loc><xhtml:link rel="alternate" hreflang="en" href="${SITE}/"/><xhtml:link rel="alternate" hreflang="es" href="${SITE}/es/"/></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, '404.html'), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 — soniqus</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/site.css?v=${VERSION}"></head><body><main style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;text-align:center;padding:24px"><h1 style="margin:0;font-family:'Unbounded',sans-serif;font-weight:900;font-size:clamp(72px,18vw,220px);line-height:.88;letter-spacing:-.055em;color:#f4ff3a">404</h1><p style="margin:0;font-size:20px;color:#c9cdff">Track not found · Pista no encontrada</p><a href="/" style="background:#f4ff3a;color:#0a0f5c;font-family:'Unbounded',sans-serif;font-weight:700;font-size:18px;padding:16px 26px;border-radius:40px;box-shadow:0 6px 0 #b9c400">soniqus.com</a></main></body></html>\n`);
fs.writeFileSync(path.join(dist, '.htaccess'), `ErrorDocument 404 /404.html\n<IfModule mod_headers.c>\n  <FilesMatch "\\.dmg$">\n    Header set Content-Disposition attachment\n    Header set Cache-Control "public, max-age=31536000, immutable"\n  </FilesMatch>\n</IfModule>\nAddType application/x-apple-diskimage .dmg\n`);
console.log(`web/dist lista · ${DMG} (${MB} MB) · ${hov.size} estilos hover`);
