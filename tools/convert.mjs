// Convierte la plantilla del prototipo de diseño (.dc.html) en JSX de React.
// El marcado y los estilos se toman tal cual del handoff para que la app sea fiel al píxel.
import fs from 'node:fs';
import path from 'node:path';

const [, , srcPath, outDir] = process.argv;
const lines = fs.readFileSync(srcPath, 'utf8').split('\n');

function frag(a, b, startsWith) {
  if (!lines[a - 1].trim().startsWith(startsWith)) throw new Error(`La línea ${a} del diseño no es la esperada (${startsWith})`);
  return lines.slice(a - 1, b).join('\n');
}
function patch(s, from, to, count = 1) {
  const n = s.split(from).length - 1;
  if (n !== count) throw new Error(`Parche «${from.slice(0, 60)}»: ${n} coincidencias, esperaba ${count}`);
  return s.split(from).join(to);
}

const VOID = new Set(['br', 'img', 'input']);
const hov = new Map(), foc = new Map();
const cls = (map, prefix, css) => { if (!map.has(css)) map.set(css, prefix + (map.size + 1)); return map.get(css); };
let loopN = 0;

function conv(html) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)\s*\/?>/g;
  let out = '', last = 0, m;
  const scope = [], stack = [];
  const expr = e => { e = e.trim(); const root = e.split(/[.[]/)[0]; return scope.includes(root) ? e : 'v.' + e; };
  const unwrap = s => s.replace(/^\{\{/, '').replace(/\}\}$/, '');
  const text = t => {
    t = t.replace(/\s+/g, ' ');
    if (!t.trim()) return '';
    return t.split(/(\{\{.*?\}\})/).filter(x => x !== '').map(p => {
      const mm = p.match(/^\{\{(.*)\}\}$/);
      if (mm) return `{${expr(mm[1])}}`;
      return /\p{L}/u.test(p) ? `{T(${JSON.stringify(p)})}` : `{${JSON.stringify(p)}}`;
    }).join('');
  };
  while ((m = re.exec(html))) {
    out += text(html.slice(last, m.index)); last = re.lastIndex;
    const [, close, tag, attrStr] = m;
    if (close) {
      const top = stack.pop();
      if (!top || top.tag !== tag) throw new Error(`Cierre inesperado </${tag}>`);
      out += top.close; if (top.scoped) scope.pop();
      continue;
    }
    const attrs = {};
    for (const a of attrStr.matchAll(/([a-zA-Z-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ?? true;
    if (tag === 'sc-for') {
      const i = 'i' + (loopN++);
      out += `{(${expr(unwrap(attrs.list))}).map((${attrs.as}, ${i}) => (<React.Fragment key={${i}}>`;
      scope.push(attrs.as); stack.push({ tag, close: '</React.Fragment>))}', scoped: true });
      continue;
    }
    if (tag === 'sc-if') {
      out += `{(${expr(unwrap(attrs.value))}) ? (<>`;
      stack.push({ tag, close: '</>) : null}' });
      continue;
    }
    let s = '<' + tag; const classes = [];
    for (const [k, val] of Object.entries(attrs)) {
      if (k.startsWith('hint-') || k === 'id' || k === 'data-screen-label') continue;
      if (k === 'style') s += ' style={S(`' + val.replace(/\{\{(.*?)\}\}/g, (_, e) => '${' + expr(e) + '}') + '`)}';
      else if (k === 'style-hover') classes.push(cls(hov, 'hv', val));
      else if (k === 'style-focus') classes.push(cls(foc, 'fc', val));
      else if (/^on[A-Z]/.test(k) || k === 'value') s += ` ${k}={${expr(unwrap(val))}}`;
      else if (k === 'title' || k === 'alt') s += ` ${k}={T(${JSON.stringify(val)})}`;
      else if (k === 'tabIndex') s += ` tabIndex={${val}}`;
      else if (k === 'draggable') s += ' draggable';
      else if (val === true) s += ` ${k}=""`;
      else s += ` ${k}=${JSON.stringify(val)}`;
    }
    if (classes.length) s += ` className="${classes.join(' ')}"`;
    if (VOID.has(tag)) out += s + ' />';
    else { out += s + '>'; stack.push({ tag, close: `</${tag}>` }); }
  }
  out += text(html.slice(last));
  if (stack.length) throw new Error('Plantilla sin cerrar: ' + stack.map(x => x.tag).join(','));
  return out;
}

// ---- Fragmentos del prototipo ----
let compact = frag(66, 132, '<div style="width:340px;height:680px;position:relative">');
compact = patch(compact, '<div style="width:340px;height:680px;position:relative">', '<div data-ghost style="width:340px;height:680px;position:relative">');
compact = patch(compact, '<div style="position:absolute;inset:0;filter:drop-shadow(0 30px 40px rgba(0,0,0,.35))">', '<div data-ghost style="position:absolute;inset:0;filter:drop-shadow(0 30px 40px rgba(0,0,0,.35))">');

let mini = frag(139, 154, '<div style="background:{{ sk.body }}');
// El logo de la barra mini usa el color de logo del aspecto (igual que la cabecera de la consola).
{
  const ml = mini.split('\n');
  if (!ml[1].includes("font-size:20px")) throw new Error('Logo de la barra mini no encontrado');
  ml[1] = ml[1].split('#f4ff3a').join('{{ sk.logo }}');
  mini = ml.join('\n');
}

let con = frag(165, 374, '<div style="background:{{ sk.body }}');
con = patch(con, 'https://nuvola.cat/assets/img/nuvola-logo.png', 'assets/nuvola-logo.png');
con = patch(con, '>DESCARGAR MP3<', '>GUARDAR COMO…<');
con = patch(con, `<div style="display:flex;align-items:baseline;font-family:'Unbounded',sans-serif;font-weight:900;font-size:24px;`,
  `<div onClick="{{ toCompact }}" title="Modo compacto" style="cursor:pointer;display:flex;align-items:baseline;font-family:'Unbounded',sans-serif;font-weight:900;font-size:24px;`);
for (const [label, key] of [['Inicio soniqus', 'inicio'], ['Música', 'musica'], ['Noticias', 'noticias'], ['Aspectos', 'aspectos'], ['Complementos', 'complementos'], ['Ayuda', 'ayuda'], ['Acerca de', 'acerca']]) {
  con = patch(con, `style-hover="color:#f4ff3a">${label}</span>`, `style-hover="color:#f4ff3a" onClick="{{ links.${key} }}">${label}</span>`);
}

// Perillas AMPLI/BAL/TONO: doble clic = volver a 0, y valor aplicado bajo el rótulo.
con = patch(con, `<div onPointerDown="{{ k.down }}"`, `<div onPointerDown="{{ k.down }}" onDoubleClick="{{ k.reset }}" title="Doble clic: volver a 0"`);
con = patch(con, `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;color:{{ sk.label }};width:38px">{{ k.label }}</span>`,
  `<span style="display:flex;flex-direction:column;gap:3px;width:38px"><span style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;color:{{ sk.label }}">{{ k.label }}</span><span style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;color:{{ sk.label }};opacity:.75;white-space:nowrap">{{ k.val }}</span></span>`);
// Vista «Acerca de» dentro de la pantalla (mismo lenguaje visual que el Panel de control).
const ABOUT = `<sc-if value="{{ isAbout }}">
<div style="animation:{{ viewAnim }};position:absolute;inset:0;padding:22px 96px 18px 28px;display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:24px;background:radial-gradient(90% 120% at 100% 100%, rgba(43,59,255,.28), transparent 60%), rgba(6,10,51,.94)">
  <div style="display:flex;flex-direction:column;gap:9px;min-width:0">
    <div style="display:flex;flex-direction:column;gap:6px"><div style="animation:{{ b.l0 }};display:flex;align-items:baseline;font-family:'Unbounded',sans-serif;font-weight:900;font-size:30px;letter-spacing:-.04em;color:#f4ff3a;line-height:1"><span>s</span><span style="width:.74em;height:.61em;border-radius:50%;border:.1em solid #f4ff3a;box-sizing:border-box;margin:0 .025em;transform:translateY(.018em);flex:none;position:relative"><span style="position:absolute;inset:0;margin:auto;width:.26em;height:.26em;border-radius:50%;background:#f4ff3a"></span></span><span>niqus</span></div><span style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.3em;color:#8f96d6">ACERCA DE</span></div>
    <div style="animation:{{ b.r1 }};display:flex;flex-direction:column;gap:4px"><span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:#f4ff3a">{{ about.version }}</span><span style="font-size:13px;font-weight:700;color:#eef0ff;line-height:1.25">Reproductor de música de escritorio para macOS.</span></div>
    <div style="animation:{{ b.r2 }};display:flex;flex-direction:column;gap:5px;font-size:10.5px;line-height:1.3;color:#aab0e8">
      <span>Soniqus es un proyecto independiente, sin relación con Sonique ni con sus propietarios. Las marcas citadas pertenecen a sus respectivos titulares.</span>
      <span>El programa se ofrece «tal cual», sin garantías de ningún tipo.</span>
      <span>Incluye software libre: Electron y Chromium (MIT / BSD) y React (MIT). Tipografías Unbounded, Space Grotesk y JetBrains Mono (SIL Open Font License 1.1). Datos de MusicBrainz y Cover Art Archive.</span>
    </div>
    <span style="animation:{{ b.u5 }};margin-top:auto;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.02em;white-space:nowrap;color:#8f96d6">{{ about.copy }}</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:22px;padding-top:4px;border-left:1px solid rgba(143,150,214,.2);padding-left:20px">
    <div style="display:flex;flex-direction:column;gap:4px"><span style="animation:{{ b.r4 }};font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.22em;color:#f4ff3a;margin-bottom:4px">ENLACES</span><span onClick="{{ links.web }}" style="font-size:13px;color:#eef0ff;cursor:pointer;padding:2px 0" style-hover="color:#f4ff3a">soniqus.com</span><span onClick="{{ links.github }}" style="font-size:13px;color:#eef0ff;cursor:pointer;padding:2px 0" style-hover="color:#f4ff3a">GitHub</span><span onClick="{{ links.nuvola }}" style="font-size:13px;color:#eef0ff;cursor:pointer;padding:2px 0" style-hover="color:#f4ff3a">nuvola.cat</span><span onClick="{{ links.ayuda }}" style="font-size:13px;color:#eef0ff;cursor:pointer;padding:2px 0" style-hover="color:#f4ff3a">Atajos de teclado</span></div>
    <a href="https://nuvola.cat" target="_blank" rel="noopener" title="nuvola.cat" style="animation:{{ b.u6 }};margin-top:auto;display:block;opacity:.9" style-hover="opacity:1"><img src="assets/nuvola-logo.png" alt="nuvola" style="display:block;max-width:110px;max-height:40px;object-fit:contain"></a>
  </div>
</div>
</sc-if>
`;
con = patch(con, `<sc-if value="{{ isList }}"`, ABOUT + `<sc-if value="{{ isList }}"`);

const jsx = `// GENERADO por tools/convert.mjs a partir del prototipo de diseño. No editar a mano.
import React from 'react';
import { S, T } from './util.js';

export function Compact(v) { return (<>${conv(compact)}</>); }

export function Mini(v) { return (<>${conv(mini)}</>); }

export function Console(v) { return (<>${conv(con)}</>); }
`;

const imp = d => d.split(';').map(x => x.trim()).filter(Boolean).map(x => x + ' !important').join(';');
let css = '/* GENERADO por tools/convert.mjs */\n';
css += lines.filter(l => l.startsWith('@keyframes')).join('\n') + '\n';
for (const [d, c] of hov) css += `.${c}:hover{${imp(d)}}\n`;
for (const [d, c] of foc) css += `.${c}:focus{${imp(d)}}\n`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'views.gen.jsx'), jsx);
fs.writeFileSync(path.join(outDir, 'views.gen.css'), css);
console.log(`vistas generadas: ${hov.size} hover, ${foc.size} focus`);
