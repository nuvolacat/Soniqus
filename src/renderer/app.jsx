// Soniqus — interfaz. La lógica parte de la clase `Component` del prototipo de diseño
// (especificación ejecutable) y la conecta con audio, ficheros y ventana reales.
// © NUVOLACAT
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/unbounded/900.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './styles.css';
import './views.gen.css';
import { Compact, Mini, Console } from './views.gen.jsx';
import { S, T, setLang } from './util.js';

const sq = window.sq;

const SKINS = [
  { key: 'metal', name: 'Metal cepillado', label: '#e2e3e8', logo: '#f4ff3a',
    body: "repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, rgba(0,0,0,.05) 1px 2px, transparent 2px 5px), linear-gradient(118deg, rgba(255,255,255,0) 14%, rgba(235,237,245,.34) 30%, rgba(255,255,255,0) 44%, rgba(255,255,255,0) 58%, rgba(220,222,230,.2) 70%, rgba(255,255,255,0) 84%), radial-gradient(80% 60% at 70% 80%, rgba(0,0,0,.25), transparent 70%), radial-gradient(130% 90% at 25% 0%, #8a8c92 0%, #55575d 40%, #2c2d31 100%)" },
  { key: 'grafito', name: 'Grafito mate', label: '#b9bbc4', logo: '#f4ff3a',
    body: "radial-gradient(140% 100% at 30% 0%, #3a3b41 0%, #26272c 45%, #18191c 100%)" },
  { key: 'hielo', name: 'Aluminio claro', label: '#1b1f4a', logo: '#1b1f4a',
    body: "linear-gradient(118deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.55) 34%, rgba(255,255,255,0) 48%), radial-gradient(130% 90% at 25% 0%, #f1f2f6 0%, #d4d6de 50%, #a9acb8 100%)" },
  { key: 'azul', name: 'Azul anodizado', label: '#dfe2ff', logo: '#f4ff3a',
    body: "repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, rgba(0,0,0,.05) 1px 2px, transparent 2px 5px), linear-gradient(118deg, rgba(255,255,255,0) 14%, rgba(200,210,255,.32) 30%, rgba(255,255,255,0) 44%, rgba(255,255,255,0) 58%, rgba(170,180,255,.2) 70%, rgba(255,255,255,0) 84%), radial-gradient(130% 90% at 25% 0%, #4452d0 0%, #1f2896 45%, #0b1152 100%)" },
  { key: 'humo', name: 'Plástico humo', label: '#e6e8ff', logo: '#f4ff3a',
    body: "linear-gradient(180deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,.06) 22%, rgba(255,255,255,0) 40%), radial-gradient(120% 90% at 50% 110%, rgba(90,110,255,.45), transparent 60%), linear-gradient(160deg, rgba(40,46,110,.82), rgba(12,14,40,.9))" },
  { key: 'amarillo', name: 'Amarillo señal', label: '#0a0f5c', logo: '#0a0f5c',
    body: "linear-gradient(118deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.35) 34%, rgba(255,255,255,0) 48%), radial-gradient(130% 90% at 25% 0%, #f8ff86 0%, #e9f520 50%, #b9c400 100%)" },
];
const PRESETS = {
  Plano: Array(20).fill(0),
  Graves: [8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Voz: [-3, -2, -1, 0, 1, 3, 5, 6, 6, 5, 4, 3, 1, 0, -1, -2, -2, -3, -3, -3],
  Brillo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 6, 7, 7, 8, 8],
  Personal: [3, 4, 5, 4, 2, 1, 0, -1, -1, 0, 1, 2, 2, 3, 3, 2, 1, 0, -1, -2],
};
const TRANS = [['iris', 'Iris'], ['crt', 'Barrido CRT'], ['vortex', 'Vórtice'], ['glitch', 'Glitch'], ['flip', 'Volteo 3D'], ['slide', 'Deslizar'], ['none', 'Ninguna']];
const TABS = ['Sistema', 'Lista', 'Audio', 'Menú', 'Archivos', 'Visuales', 'Internet', 'Aspecto'];
const FREQS = Array.from({ length: 20 }, (_, i) => 30 * Math.pow(600, i / 19)); // 30 Hz … 18 kHz
const SIZES = { compact: [340, 680], full: [780, 786], min: [780, 72] };
const DEF_PREFS = { onTop: false, startup: false, rememberPos: true, lockWin: false, translucent: false, lang: 'Español', append: true, showFile: false, saveInfo: true, clearOnLoad: false, out: 'Salida del sistema', dsp: 'Ninguno', masterVol: false, menuSmooth: 0.8, menuSpeed: 0.6, fullscreen: 'Acelerada', formats: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'm3u', 'pls', 'cue'], blocks: true, blur: false, smoke: true, zoom: true, fxLevel: 0.6, zoomSpeed: 0.5, covers: true, songInfo: true, updates: false, stream: true };
const UI_KEYS = ['skin', 'trans', 'vizKind', 'modeMid', 'modeCon', 'vol', 'repeat', 'shuffle', 'autoAdd', 'showRemain', 'eqOpen', 'win', 'setTab', 'preset', 'eq', 'amp', 'bal', 'pitch'];
const VOLATILE = new Set(['resetArm', 't', 'exiting', 'tabExit', 'tabSwitch', 'infoVis', 'infoLeaving', 'dragFrom', 'dragOver', 'id3Status', 'navHist', 'view', 'playing', 'sel']);
const TAG_KEYS = ['title', 'artist', 'album', 'year', 'genre', 'track', 'comment'];

let UID = 0;
const baseName = p => p.split('/').pop();
const noExt = n => n.replace(/\.[^.]+$/, '');
const srcOf = tr => (tr.path ? 'sq://app/media?p=' + encodeURIComponent(tr.path) : 'sq://app/stream?u=' + encodeURIComponent(tr.url));

function impulse(ac) {
  const len = Math.floor(ac.sampleRate * 2.4), buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  return buf;
}

class App extends React.Component {
  tracks = [];
  cv = {}; hist = []; sm = new Array(32).fill(0); frame = 0;

  constructor(props) {
    super(props);
    const sv = sq.loadState() || {};
    const prefs = { ...DEF_PREFS, ...(sv.prefs || {}), out: 'Salida del sistema' };
    this.tracks = (sv.playlist || []).filter(x => x && (x.path || x.url)).map(x => this.mkTrack(x));
    const ui = {}; for (const k of UI_KEYS) if (sv.ui && sv.ui[k] !== undefined) ui[k] = sv.ui[k];
    const idx = Math.max(0, Math.min(this.tracks.length - 1, sv.idx || 0));
    this.state = {
      exiting: false, tabExit: false, infoVis: false, infoLeaving: false,
      playing: false, idx, sel: idx, t: 0, modeMid: 0, modeCon: 1, navHist: [], win: 'full', setTab: 'Sistema', prefs,
      showRemain: false, autoAdd: true, preset: 'Plano', dragFrom: null, dragOver: null, vol: 0.7, view: this.tracks.length ? 'viz' : 'home', repeat: false, shuffle: false,
      eqOpen: true, eq: Array(20).fill(0), amp: 0.5, bal: 0, pitch: 0, skin: 'hielo', trans: 'iris', vizKind: 'ondas',
      ...ui,
    };
    if (!['compact', 'full', 'min'].includes(this.state.win)) this.state.win = 'full';
    if (!Array.isArray(this.state.eq) || this.state.eq.length !== 20) this.state.eq = Array(20).fill(0);
    setLang(prefs.lang);
  }

  mkTrack(it) {
    const name = it.path ? noExt(baseName(it.path)) : (it.title || it.url);
    return { id: ++UID, path: it.path, url: it.url, title: it.title || name, artist: it.artist || (it.url ? 'Radio' : 'Archivo local'), d: it.d || 0, tags: { title: it.title || name, ...(it.tags || {}) } };
  }

  // ---------- ciclo de vida ----------
  componentDidMount() {
    this.raf = requestAnimationFrame(this.loop);
    this.applyWin(true);
    sq.winPrefs(this.winPrefs());
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('blur', () => this.setGhost(false));
    window.addEventListener('focus', () => this.setGhost(false));
    document.addEventListener('mouseleave', () => { this.mx = null; this.setGhost(false); });
    window.addEventListener('dblclick', this.onDblClick);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
    window.addEventListener('drop', this.onDrop);
    window.addEventListener('beforeunload', () => sq.saveStateSync(this.snapshot()));
    sq.on('open', async paths => { const r = await sq.expand(paths, null); if (r) this.addItems(r.items, r.folder); });
    sq.on('menu', c => this.menuCmd(c));
    sq.on('welcome', file => { if (!this.tracks.some(t => t.path === file)) this.addItems([{ path: file }], false, true); });
    if ('mediaSession' in navigator) {
      const ms = navigator.mediaSession;
      ms.setActionHandler('play', () => this.vals.toggle());
      ms.setActionHandler('pause', () => this.vals.toggle());
      ms.setActionHandler('nexttrack', () => this.vals.next());
      ms.setActionHandler('previoustrack', () => this.vals.prev());
    }
    this.scan();
    requestAnimationFrame(() => sq.ready());
    window.__app = this;
  }

  componentDidUpdate(prevProps, prev) {
    const s = this.state;
    { const want = s.playing && s.win !== 'min';
      if (want && (!s.infoVis || s.infoLeaving)) { clearTimeout(this.infoT); this.setState({ infoVis: true, infoLeaving: false }); }
      else if (!want && s.infoVis && !s.infoLeaving) { this.setState({ infoLeaving: true }); clearTimeout(this.infoT); this.infoT = setTimeout(() => this.setState({ infoVis: false, infoLeaving: false }), 430); } }
    if (prev.win !== s.win) this.applyWin(false);
    if (prev.win !== s.win || prev.eqOpen !== s.eqOpen) { this.setGhost(false); clearTimeout(this.ghT); this.ghT = setTimeout(this.recheckGhost, 750); }
    const P = s.prefs, Q = prev.prefs;
    if (P !== Q) {
      if (P.onTop !== Q.onTop || P.translucent !== Q.translucent || P.startup !== Q.startup || P.rememberPos !== Q.rememberPos || P.lang !== Q.lang) sq.winPrefs(this.winPrefs());
      if (P.masterVol !== Q.masterVol && P.masterVol) sq.getSysVolume().then(v => { if (v != null) this.setState({ vol: v }); });
    }
    if (P.masterVol && prev.vol !== s.vol) { clearTimeout(this.svT); this.svT = setTimeout(() => sq.sysVolume(this.state.vol), 60); }
    this.syncAudio();
    let dirty = this.listDirty || prev.idx !== s.idx;
    if (!dirty) for (const k in s) if (!VOLATILE.has(k) && s[k] !== prev[k]) { dirty = true; break; }
    if (dirty) { this.listDirty = false; if (!this.saveT) this.saveT = setTimeout(() => { this.saveT = null; sq.saveState(this.snapshot()); }, 800); }
  }

  snapshot() {
    const s = this.state, ui = {};
    for (const k of UI_KEYS) ui[k] = s[k];
    const keep = s.prefs.saveInfo;
    return {
      prefs: s.prefs, ui, idx: s.idx,
      playlist: this.tracks.map(tr => {
        const o = { path: tr.path, url: tr.url };
        if (keep || tr.url) { o.title = tr.title; o.artist = tr.artist; o.d = tr.d; }
        return o;
      }),
    };
  }
  winPrefs() { const P = this.state.prefs; return { onTop: P.onTop, translucent: P.translucent, startup: P.startup, rememberPos: P.rememberPos, lang: P.lang }; }
  applyWin(first) { const [w, h] = SIZES[this.state.win]; sq.setMode(this.state.win, w, h, first); }

  // ---------- ventana: zonas transparentes, arrastre, teclado ----------
  onMouseMove = e => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    this.mx = e.clientX; this.my = e.clientY;
    this.setGhost(!el || el === document.documentElement || el === document.body || el.id === 'root' || el.hasAttribute('data-ghost'));
  };
  // Las zonas transparentes solo dejan pasar el clic con la ventana activa: si no lo está,
  // cualquier clic sobre Soniqus la trae al frente (evita que un clic «atraviese» la carcasa).
  setGhost = ghost => {
    const ig = !!ghost && document.hasFocus();
    if (ig !== this.ignoring) { this.ignoring = ig; sq.ignoreMouse(ig); }
  };
  recheckGhost = () => {
    if (this.mx == null) return this.setGhost(false);
    const el = document.elementFromPoint(this.mx, this.my);
    this.setGhost(!el || el === document.documentElement || el === document.body || el.id === 'root' || el.hasAttribute('data-ghost'));
  };
  onPointerDown = e => {
    if (e.button !== 0 || this.state.prefs.lockWin) return;
    const el = e.target;
    if (!(el instanceof Element) || el.closest('input')) return;
    const cur = getComputedStyle(el).cursor;
    if (cur !== 'auto' && cur !== 'default') return;
    sq.drag(true);
    const up = () => { sq.drag(false); window.removeEventListener('pointerup', up); window.removeEventListener('blur', up); };
    window.addEventListener('pointerup', up); window.addEventListener('blur', up);
  };
  onDblClick = e => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    const cur = getComputedStyle(el).cursor;
    if (cur !== 'auto' && cur !== 'default') return;
    for (let n = el; n && n.style; n = n.parentElement) if (n.style.backgroundImage && n.style.backgroundImage.includes('rgb(14, 21, 102) 0%')) return; // dentro de una pantalla
    if (this.state.win === 'compact') this.setState({ win: 'full' });
    else if (this.state.win === 'full') this.setState({ win: 'compact' });
  };
  onKey = e => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
    const s = this.state, v = this.vals, T_ = this.tracks;
    if (e.key === ' ') { e.preventDefault(); v.toggle(); return; }
    if (e.key === 'Escape') { v.back(); return; }
    if (s.win === 'full' && s.view === 'list') {
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); this.removeTrack(s.sel); }
      else if (e.key === 'ArrowUp' && e.altKey) { e.preventDefault(); this.moveTrack(s.sel, s.sel - 1); }
      else if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); this.moveTrack(s.sel, s.sel + 2); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.setState({ sel: Math.max(0, s.sel - 1) }); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); this.setState({ sel: Math.min(T_.length - 1, s.sel + 1) }); }
      else if (e.key === 'Enter' && T_.length) this.setState(st => ({ idx: st.sel, t: 0, playing: true }));
      return;
    }
    if (e.key === 'ArrowUp') { e.preventDefault(); v.up(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); v.down(); }
    else if (e.key === 'ArrowLeft') this.seekBy(-5);
    else if (e.key === 'ArrowRight') this.seekBy(5);
  };
  onDrop = async e => {
    const files = e.dataTransfer && e.dataTransfer.files;
    if (!files || !files.length) return;
    e.preventDefault();
    const paths = [...files].map(f => sq.pathFor(f)).filter(Boolean);
    const r = await sq.expand(paths, this.state.prefs.formats);
    if (r) this.addItems(r.items, r.folder);
  };
  menuCmd(c) {
    const v = this.vals;
    if (c === 'open') this.openFiles();
    else if (c === 'saveList') sq.saveList(this.tracks.map(tr => ({ path: tr.path, url: tr.url, title: tr.title, artist: tr.artist, d: tr.d })));
    else if (c === 'toggle') v.toggle();
    else if (c === 'next') v.next();
    else if (c === 'prev') v.prev();
    else if (c === 'stop') v.stop();
    else if (c === 'close') v.closeWin();
    else if (c === 'about') { if (this.state.view !== 'about' || this.state.win !== 'full') this.setState(st => ({ win: 'full', view: 'about', exiting: false, navHist: st.view === 'about' ? st.navHist : [...st.navHist, st.view].slice(-20) })); }
    else if (c === 'compact' || c === 'full' || c === 'min') this.setState({ win: c });
  }

  // ---------- transiciones (del prototipo) ----------
  exitMs() {
    const P = this.state.prefs, bsp = 0.6 + (1 - P.menuSpeed) * 0.8, BK = P.blocks !== false;
    const tr = this.state.trans || 'iris';
    const blocks = BK ? (0.32 + 0.18) * bsp : 0;
    const view = tr === 'none' ? 0 : ((tr === 'glitch' ? 0.45 : 0.3) + (1 - P.menuSpeed) * 0.7) * 0.6 + (BK ? 0.12 * bsp : 0);
    return Math.max(blocks, view) * 1000;
  }
  navSet(u) {
    const cur = this.state;
    if (cur.exiting) return;
    const part = typeof u === 'function' ? u(cur) : u;
    if (!part) return;
    const ms = this.exitMs();
    if (part.view && part.view !== cur.view && cur.view !== '_' && ms > 0 && cur.win === 'full') {
      this.setState({ exiting: true });
      clearTimeout(this.exT);
      this.exT = setTimeout(() => this.setState({ ...part, exiting: false }), ms);
    } else this.setState(part);
  }

  // ---------- ajustes ----------
  settingsRows(tab, { opt, sk, kind, MODES }) {
    const s = this.state, P = s.prefs;
    const setP = (k, v) => this.setState(st => ({ prefs: { ...st.prefs, [k]: v } }));
    const head = label => ({ isHead: true, isRow: false, label: T(label) });
    const chk = (label, sub, v, fn) => ({ isRow: true, isCheck: true, label: T(label), sub: T(sub), on: fn, bg: v ? '#f4ff3a' : 'rgba(43,59,255,.25)', x: v ? 21 : 3, knob: v ? '#0a0f5c' : '#eef0ff' });
    const pc = (k, label, sub) => chk(label, sub, P[k], () => setP(k, !P[k]));
    const sc = (k, label, sub) => chk(label, sub, s[k], () => this.setState(st => ({ [k]: !st[k] })));
    const seg = (label, sub, opts) => ({ isRow: true, isSeg: true, label: T(label), sub: T(sub), opts });
    const pseg = (k, label, sub, list, fn) => seg(label, sub, list.map(v => opt(v, P[k] === v, () => (fn ? fn(v) : setP(k, v)))));
    const sld = (k, label, sub, lo = 'LENTO', hi = 'RÁPIDO') => ({ isRow: true, isSlider: true, label: T(label), sub: T(sub), lo: T(lo), hi: T(hi), pct: Math.round(P[k] * 100), down: e => {
      e.preventDefault(); const r = e.currentTarget.getBoundingClientRect();
      const f = x => setP(k, Math.max(0, Math.min(1, (x - r.left) / r.width)));
      f(e.clientX); const mv = ev => f(ev.clientX); const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    } });
    const fmt = f => opt(f, P.formats.includes(f), () => setP('formats', P.formats.includes(f) ? P.formats.filter(x => x !== f) : [...P.formats, f]));
    switch (tab) {
      case 'Sistema': return [head('OPCIONES DE SISTEMA'), pc('onTop', 'Siempre encima', 'Sobre otras ventanas'), pc('startup', 'Abrir al iniciar', 'Arranca con el sistema'), pc('rememberPos', 'Recordar posición', 'Al volver a abrir'), pc('lockWin', 'Bloquear ventana', 'Evita moverla sin querer'), pc('translucent', 'Ventana translúcida', 'Deja ver el escritorio'), head('IDIOMA'), pseg('lang', 'Idioma', 'Interfaz', ['Español', 'Català', 'English']), head('DATOS'), seg('Borrar caché', 'Ajustes, lista y datos guardados', [s.resetArm ? { label: T('¿SEGURO? PULSA OTRA VEZ'), on: () => sq.resetAll(), bg: '#f4ff3a', fg: '#0a0f5c' } : opt('BORRAR TODO', false, () => { this.setState({ resetArm: true }); clearTimeout(this.resetT); this.resetT = setTimeout(() => this.setState({ resetArm: false }), 4000); })])];
      case 'Lista': return [head('OPCIONES DE LISTA'), pc('append', 'Añadir a la lista', 'No reemplazar al abrir'), sc('autoAdd', 'Reproducir al añadir', 'Empieza a sonar al cargar'), pc('clearOnLoad', 'Vaciar al cargar carpeta', 'Empieza una lista nueva'), pc('showFile', 'Ver nombre del archivo', 'En vez del título'), pc('saveInfo', 'Guardar info en lista', 'Duración y etiquetas'), head('ORDEN'), sc('repeat', 'Repetir', 'La canción actual'), sc('shuffle', 'Aleatorio', 'Al avanzar')];
      case 'Audio': return [head('SALIDA'), pseg('out', 'Dispositivo', 'Dónde suena', ['Salida del sistema', 'Grabar a WAV'], v => (v === 'Grabar a WAV' ? this.startRec() : this.stopRec())), pseg('dsp', 'Procesador', 'Procesado extra', ['Ninguno', 'Reverberación', 'Fundido']), pc('masterVol', 'Volumen con el master', 'Usa el del sistema'), seg('Volumen', 'Nivel de salida', [0, 25, 50, 75, 100].map(v => opt(v + '%', Math.round(s.vol * 100) === v, () => this.setState({ vol: v / 100 })))), head('ECUALIZADOR'), sc('eqOpen', 'Panel de audio', 'Mostrar el ecualizador'), seg('Preset', '20 bandas', Object.keys(PRESETS).map(k => opt(k.toUpperCase(), s.preset === k, () => this.setState({ preset: k, eq: PRESETS[k].slice() })))), seg('Balance y tono', 'Volver al centro', [opt('RESTABLECER', true, () => this.setState({ bal: 0, pitch: 0 }))])];
      case 'Menú': return [head('TRANSICIÓN ENTRE PANTALLAS'), chk('Entrada por bloques', 'Los elementos llegan escalonados', P.blocks !== false, () => setP('blocks', P.blocks === false)), seg('Estilo', 'Toca para previsualizar', TRANS.map(([k, l]) => opt(l.toUpperCase(), (s.trans || 'iris') === k, () => { this.setState({ trans: k, view: '_', tabSwitch: false }); requestAnimationFrame(() => this.setState({ view: 'settings' })); }))), head('ANIMACIÓN DE MENÚS'), sld('menuSmooth', 'Suavidad', 'Fluidez del despliegue'), sld('menuSpeed', 'Velocidad', 'Duración del despliegue'), head('PANTALLA'), seg('Contador', 'Qué muestra', [['TRANSCURRIDO', false], ['RESTANTE', true]].map(([l, v]) => opt(l, s.showRemain === v, () => this.setState({ showRemain: v })))), pseg('fullscreen', 'Pantalla completa', 'Modo de dibujo', ['Acelerada', 'Compatible'])];
      case 'Archivos': return [head('FORMATOS ASOCIADOS'), seg('Audio', 'Se abren con soniqus', ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus'].map(fmt)), seg('Listas', 'Se abren con soniqus', ['m3u', 'pls', 'cue'].map(fmt))];
      case 'Visuales': return [head('EFECTOS VISUALES'), seg('Pantalla principal', 'Consola de navegación', MODES.map((l, i) => opt(l, s.modeCon === i, () => this.setState({ modeCon: i })))), seg('Pantalla compacta', 'Círculo superior', MODES.map((l, i) => opt(l, s.modeMid === i, () => this.setState({ modeMid: i })))), seg('Estilo de ondas', 'Anillos o barras', [['ANILLOS', 'ondas'], ['BARRAS', 'barras']].map(([l, v]) => opt(l, kind === v, () => this.setState({ vizKind: v })))), pc('blur', 'Desenfocar', 'Suaviza los visuales'), pc('smoke', 'Humo', 'Estela larga en Halo'), pc('zoom', 'Zoom', 'Giro del vúmetro 3D'), sld('fxLevel', 'Nivel de efectos', 'Intensidad del brillo', 'BAJO', 'ALTO'), sld('zoomSpeed', 'Velocidad del zoom', 'Giro del vúmetro')];
      case 'Internet': return [head('CONEXIÓN'), pc('covers', 'Buscar carátulas', 'Descarga portadas'), pc('songInfo', 'Info de canciones', 'Artista, álbum y año'), pc('stream', 'Radio por internet', 'Permitir streams'), pc('updates', 'Buscar actualizaciones', 'Al iniciar')];
      case 'Aspecto': return [head('ASPECTO'), seg('Acabado', 'Carcasa del reproductor', SKINS.map(x => opt(x.name, x.key === sk.key, () => this.setState({ skin: x.key }))))];
    }
    return [];
  }

  // ---------- visualizaciones (del prototipo) ----------
  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const compat = this.state.prefs.fullscreen === 'Compatible';
    this.tick = (this.tick || 0) + 1;
    if (compat && this.tick % 2) return;
    const d = this.data();
    if (this.frame++ % 2 === 0) { this.hist.unshift(d.spec.slice()); if (this.hist.length > 24) this.hist.pop(); }
    for (const k of ['mid', 'con']) {
      const c = this.cv[k]; if (!c || !c.isConnected) continue;
      const dpr = compat ? 1 : (window.devicePixelRatio || 1), w = c.clientWidth, hh = c.clientHeight;
      if (!w || !hh) continue;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(hh * dpr); }
      c.style.filter = this.state.prefs.blur ? 'blur(1.2px)' : 'none'; const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mode = k === 'mid' ? this.state.modeMid : this.state.modeCon;
      if (mode === 1) this.draw3d(ctx, w, hh); else if (mode === 2) this.drawHalo(ctx, w, hh, d); else if (mode === 3) this.drawFly(ctx, w, hh);
    }
  };
  data() {
    const N = 32, spec = new Array(N).fill(0), L = new Array(128).fill(0), Rr = new Array(128).fill(0);
    const real = this.anL && this.audio && !this.audio.paused;
    if (real) {
      const f = this.fbuf || (this.fbuf = new Uint8Array(this.anL.frequencyBinCount));
      const f2 = this.fbuf2 || (this.fbuf2 = new Uint8Array(this.anR.frequencyBinCount));
      this.anL.getByteFrequencyData(f); this.anR.getByteFrequencyData(f2);
      const n = f.length;
      for (let i = 0; i < N; i++) {
        const a = Math.floor(Math.pow(n * 0.7, i / N)), b = Math.max(a + 1, Math.floor(Math.pow(n * 0.7, (i + 1) / N)));
        let s = 0; for (let j = a; j < b; j++) s += f[j] + f2[j];
        spec[i] = s / ((b - a) * 510);
      }
      const t1 = this.tbuf || (this.tbuf = new Uint8Array(this.anL.fftSize)), t2 = this.tbuf2 || (this.tbuf2 = new Uint8Array(this.anR.fftSize));
      this.anL.getByteTimeDomainData(t1); this.anR.getByteTimeDomainData(t2);
      const st = Math.floor(t1.length / 128);
      for (let i = 0; i < 128; i++) { L[i] = (t1[i * st] - 128) / 128; Rr[i] = (t2[i * st] - 128) / 128; }
    }
    for (let i = 0; i < N; i++) { this.sm[i] = spec[i] > this.sm[i] ? spec[i] : this.sm[i] * 0.88 + spec[i] * 0.12; spec[i] = this.sm[i]; }
    return { spec, L, R: Rr };
  }
  col(v, a) {
    const r = Math.round(43 + (244 - 43) * v), g = Math.round(59 + (255 - 59) * v), b = Math.round(255 + (58 - 255) * v);
    return `rgba(${r},${g},${b},${a})`;
  }
  draw3d(ctx, w, h) {
    const P = this.state.prefs, t = performance.now() / 1000;
    const H = this.hist, n = H.length;
    const cur = H[0] || new Array(32).fill(0);
    const bass = (cur[0] + cur[1] + cur[2] + cur[3]) / 4, energy = cur.reduce((a, v) => a + v, 0) / 32;
    this.kick = Math.max((this.kick || 0) * 0.9, bass > 0.62 && bass > (this.lastBass || 0) + 0.04 ? 1 : 0);
    this.lastBass = bass;
    const K = this.kick, fx = P.fxLevel;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = P.smoke ? 'rgba(2,4,26,.38)' : 'rgba(2,4,26,.9)';
    ctx.fillRect(0, 0, w, h);
    const spin = P.zoom ? t * (0.08 + P.zoomSpeed * 0.35) : 0;
    const a = Math.sin(spin) * 0.38, ca = Math.cos(a), sa = Math.sin(a);
    const tilt = 0.9 + Math.sin(t * 0.23) * 0.15;
    const shake = K * 3 * fx;
    const ox = (Math.random() - 0.5) * shake, oy = (Math.random() - 0.5) * shake;
    const hor = h * (0.2 + Math.sin(t * 0.17) * 0.02);
    const zoom = 1 + K * 0.06 * fx;
    const P3 = (x, z, y) => {
      const xr = x * ca - (z - 0.5) * sa, zr = x * sa + (z - 0.5) * ca + 0.5, D = 2.5 + zr * 2.4;
      return [w / 2 + ox + (xr * w * 1.1 / D) * zoom, hor + oy + (h * 0.95 * tilt / D - y * h * 0.75 / D) * zoom, D, zr];
    };
    if (!this.stars) this.stars = Array.from({ length: 70 }, () => [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()]);
    ctx.fillStyle = '#c9cdff';
    for (const s of this.stars) {
      s[2] -= 0.004 + energy * 0.03; if (s[2] <= 0.02) { s[0] = Math.random() * 2 - 1; s[1] = Math.random() * 2 - 1; s[2] = 1; }
      const px = w / 2 + s[0] / s[2] * w * 0.25, py = hor * 0.7 + s[1] / s[2] * h * 0.2;
      if (py > hor + 4) continue;
      ctx.globalAlpha = (1 - s[2]) * 0.8; const r = (1 - s[2]) * 1.6; ctx.fillRect(px, py, r, r);
    }
    ctx.globalAlpha = 1;
    const sg = ctx.createRadialGradient(w / 2, hor, 0, w / 2, hor, w * (0.3 + bass * 0.2));
    sg.addColorStop(0, `rgba(244,255,58,${0.08 + bass * 0.18 * fx})`); sg.addColorStop(0.4, `rgba(43,59,255,${0.12 + energy * 0.2})`); sg.addColorStop(1, 'rgba(43,59,255,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
    const scroll = (t * (0.25 + energy * 0.8)) % (1 / 8);
    ctx.lineWidth = 1;
    for (let i = 0; i <= 12; i++) { const x = -1.2 + i * 0.2; const p1 = P3(x, 0, 0), p2 = P3(x, 1.4, 0); ctx.strokeStyle = 'rgba(80,96,255,.22)'; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke(); }
    for (let i = 0; i <= 11; i++) { const z = i / 8 - scroll; if (z < 0) continue; const p1 = P3(-1.2, z, 0), p2 = P3(1.2, z, 0); ctx.strokeStyle = `rgba(80,96,255,${0.12 + (1 - z / 1.4) * 0.3 + K * 0.3})`; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke(); }
    const rows = [];
    for (let r = n - 1; r >= 0; r--) rows.push(r);
    rows.sort((p, q) => P3(0, q / 23, 0)[3] - P3(0, p / 23, 0)[3]);
    for (const r of rows) {
      const z = r / 23, fade = 1 - r / 24, row = H[r];
      ctx.beginPath();
      const base0 = P3(-0.95, z, 0); ctx.moveTo(base0[0], base0[1]);
      for (let i = 0; i < 32; i++) { const p = P3(-0.95 + (i / 31) * 1.9, z, row[i]); ctx.lineTo(p[0], p[1]); }
      const base1 = P3(0.95, z, 0); ctx.lineTo(base1[0], base1[1]); ctx.closePath();
      const g = ctx.createLinearGradient(0, base0[1] - h * 0.4, 0, base0[1]);
      g.addColorStop(0, this.col(1, 0.07 * fade)); g.addColorStop(1, this.col(0, 0.015 * fade));
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath();
      for (let i = 0; i < 32; i++) { const p = P3(-0.95 + (i / 31) * 1.9, z, row[i]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.strokeStyle = this.col(0.15 + 0.85 * fade * fade, 0.12 + 0.55 * fade); ctx.lineWidth = r === 0 ? 2 : 1;
      if (r === 0) { ctx.shadowColor = '#f4ff3a'; ctx.shadowBlur = 18 * fx; }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.globalCompositeOperation = 'lighter';
    if (!this.peaks) this.peaks = new Array(32).fill(0);
    for (let i = 0; i < 32; i++) {
      const v = cur[i], x = -0.95 + (i / 31) * 1.9;
      this.peaks[i] = Math.max(v, this.peaks[i] - 0.012);
      const b0 = P3(x, 0, 0), b1 = P3(x, 0, v), pk = P3(x, 0, this.peaks[i]);
      const bw = Math.max(2, w * 0.03 / b0[2]);
      const gr = ctx.createLinearGradient(0, b0[1], 0, b1[1]);
      gr.addColorStop(0, 'rgba(43,59,255,.55)'); gr.addColorStop(1, this.col(Math.min(1, v * 1.2), .85));
      ctx.fillStyle = gr; ctx.shadowColor = this.col(v, 1); ctx.shadowBlur = 8 * fx;
      ctx.fillRect(b0[0] - bw / 2, b1[1], bw, b0[1] - b1[1]);
      ctx.shadowBlur = 0;
      const rg = ctx.createLinearGradient(0, b0[1], 0, b0[1] + (b0[1] - b1[1]) * 0.5);
      rg.addColorStop(0, this.col(v, 0.28)); rg.addColorStop(1, this.col(v, 0));
      ctx.fillStyle = rg; ctx.fillRect(b0[0] - bw / 2, b0[1] + 1, bw, (b0[1] - b1[1]) * 0.5);
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#f4ff3a'; ctx.shadowBlur = 8 * fx;
      ctx.fillRect(b0[0] - bw / 2, pk[1] - 4, bw, 2); ctx.shadowBlur = 0;
      if (v > 0.8 && Math.random() < 0.25 * fx) (this.sparks || (this.sparks = [])).push({ x: b1[0], y: b1[1], vx: (Math.random() - 0.5) * 2.5, vy: -1.5 - Math.random() * 2.5, l: 1 });
    }
    if (this.sparks) {
      for (const s of this.sparks) { s.x += s.vx; s.y += s.vy; s.vy += 0.08; s.l -= 0.025; ctx.fillStyle = this.col(1, Math.max(0, s.l)); ctx.fillRect(s.x, s.y, 2, 2); }
      this.sparks = this.sparks.filter(s => s.l > 0).slice(-160);
    }
    if (K > 0.95) (this.waves || (this.waves = [])).push(0);
    if (this.waves) {
      ctx.lineWidth = 2;
      for (let k = 0; k < this.waves.length; k++) {
        const r = (this.waves[k] += 0.025);
        ctx.beginPath();
        for (let j = 0; j <= 40; j++) { const an = (j / 40) * Math.PI * 2; const p = P3(Math.cos(an) * r * 1.4, 0.5 + Math.sin(an) * r * 0.7, 0); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
        ctx.strokeStyle = `rgba(244,255,58,${Math.max(0, 0.5 - r * 0.5) * fx})`; ctx.stroke();
      }
      this.waves = this.waves.filter(r => r < 1);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
    if (K > 0.5) { ctx.fillStyle = `rgba(244,255,58,${(K - 0.5) * 0.12 * fx})`; ctx.fillRect(0, 0, w, h); }
  }
  drawFly(ctx, w, h) {
    const P = this.state.prefs, t = performance.now() / 1000, fx = P.fxLevel;
    const H = this.hist, N = H.length; if (!N) return;
    const cur = H[0], bass = (cur[0] + cur[1] + cur[2]) / 3, energy = cur.reduce((a, v) => a + v, 0) / 32;
    this.fk = Math.max((this.fk || 0) * 0.9, bass > 0.6 && bass > (this.fLast || 0) + 0.04 ? 1 : 0); this.fLast = bass;
    const K = this.fk;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = P.smoke ? 'rgba(2,4,26,.45)' : 'rgba(2,4,26,.92)'; ctx.fillRect(0, 0, w, h);
    const cx = w / 2 + Math.sin(t * 0.5) * w * 0.04, cy = h / 2 + Math.sin(t * 0.37) * h * 0.05;
    const roll = P.zoom ? Math.sin(t * (0.15 + P.zoomSpeed * 0.5)) * 0.22 : 0;
    const f = Math.min(w, h) * (0.9 + K * 0.08 * fx);
    const phase = (this.frame % 2) / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(roll);
    const pr = (X, Y, z) => [X * f / z, Y * f / z];
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(w, h) * (0.25 + bass * 0.2));
    cg.addColorStop(0, `rgba(255,255,255,${0.35 + K * 0.4})`); cg.addColorStop(0.15, `rgba(244,255,58,${0.25 + bass * 0.3 * fx})`); cg.addColorStop(1, 'rgba(43,59,255,0)');
    ctx.fillStyle = cg; ctx.fillRect(-w, -h, w * 2, h * 2);
    if (!this.warp) this.warp = Array.from({ length: 110 }, () => ({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 3, z: Math.random() * 24 + 1 }));
    const sp = 0.18 + energy * 0.9 + K * 0.6;
    ctx.lineCap = 'round';
    for (const s of this.warp) {
      const z0 = s.z; s.z -= sp; if (s.z < 0.4) { s.x = (Math.random() - 0.5) * 6; s.y = (Math.random() - 0.5) * 3; s.z = 24; continue; }
      const a = pr(s.x, s.y, z0), b = pr(s.x, s.y, s.z);
      ctx.strokeStyle = `rgba(201,205,255,${Math.min(1, (1 - s.z / 24) * 0.9)})`; ctx.lineWidth = Math.max(0.5, 2.2 / s.z * 2);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    const XS = 2.4, band = X => Math.min(31, Math.floor(Math.abs(X) / XS * 32));
    for (let r = 0; r < N; r++) {
      const z = (N - r) - phase + 0.6; if (z < 0.6) continue;
      const row = H[r], near = 1 - z / (N + 1), al = Math.max(0, near) * 0.9 + 0.05;
      const pts = [];
      for (let j = 0; j <= 40; j++) { const X = -XS + (j / 40) * XS * 2; pts.push([X, row[31 - band(X)]]); }
      for (const sgn of [1, -1]) {
        ctx.beginPath();
        pts.forEach(([X, v], j) => { const p = pr(X, sgn * (1.1 - v * 0.85), z); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
        const e1 = pr(XS, sgn * 1.1, z), e0 = pr(-XS, sgn * 1.1, z);
        ctx.lineTo(e1[0], e1[1]); ctx.lineTo(e0[0], e0[1]); ctx.closePath();
        ctx.fillStyle = sgn > 0 ? this.col(0.9, al * 0.12) : `rgba(43,59,255,${al * 0.14})`; ctx.fill();
        ctx.beginPath();
        pts.forEach(([X, v], j) => { const p = pr(X, sgn * (1.1 - v * 0.85), z); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
        ctx.strokeStyle = sgn > 0 ? this.col(0.4 + 0.6 * near, al) : `rgba(110,130,255,${al})`;
        ctx.lineWidth = Math.max(0.6, 2.4 / z * 1.5);
        if (z < 3) { ctx.shadowColor = sgn > 0 ? '#f4ff3a' : '#6e82ff'; ctx.shadowBlur = 14 * fx; }
        ctx.stroke(); ctx.shadowBlur = 0;
      }
      if (r % 3 === 0) {
        ctx.strokeStyle = `rgba(80,96,255,${al * 0.5})`; ctx.lineWidth = 1;
        for (const sx of [-XS, XS]) { const a = pr(sx, -1.1, z), b = pr(sx, 1.1, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      }
    }
    if (K > 0.95) (this.gates || (this.gates = [])).push(24);
    if (this.gates) {
      for (let i = 0; i < this.gates.length; i++) {
        const z = (this.gates[i] -= sp * 1.4); if (z < 0.5) continue;
        const a = pr(-XS, -1.1, z), b = pr(XS, 1.1, z), al = Math.min(1, (1 - z / 24) * 1.3);
        ctx.strokeStyle = `rgba(244,255,58,${al})`; ctx.lineWidth = Math.max(1, 6 / z);
        ctx.shadowColor = '#f4ff3a'; ctx.shadowBlur = 20 * fx;
        const rr = Math.min(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) * 0.18;
        ctx.beginPath(); ctx.roundRect(a[0], a[1], b[0] - a[0], b[1] - a[1], rr); ctx.stroke();
        ctx.shadowBlur = 0;
      }
      this.gates = this.gates.filter(z => z > 0.5);
    }
    ctx.restore();
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${0.55 + energy * 0.25})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
    if (K > 0.6) { ctx.fillStyle = `rgba(244,255,58,${(K - 0.6) * 0.15 * fx})`; ctx.fillRect(0, 0, w, h); }
    ctx.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  }
  drawHalo(ctx, w, h, d) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = this.state.prefs.smoke ? 'rgba(0,0,0,.08)' : 'rgba(0,0,0,.3)'; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const fx = 0.4 + this.state.prefs.fxLevel;
    const line = (arr, y0, col, amp) => {
      for (const [lw, al, bl, dy] of [[7, 0.10, 0, 0], [3, 0.35, 16, 3], [1.6, 1, 8, 0]]) {
        ctx.beginPath();
        for (let i = 0; i < arr.length; i++) { const x = w * 0.06 + (i / (arr.length - 1)) * w * 0.88; const y = y0 + dy + arr[i] * amp; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = col.replace('A', al); ctx.lineWidth = lw; ctx.shadowColor = col.replace('A', 1); ctx.shadowBlur = bl * fx; ctx.lineJoin = 'round'; ctx.stroke();
      }
    };
    line(d.L, h * 0.38, 'rgba(110,130,255,A)', h * 0.26);
    line(d.R, h * 0.64, 'rgba(244,255,58,A)', h * 0.26);
    ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
  }
  viz(kind, ox, oy, size, n, bw, dur) {
    const run = this.state.playing ? 'running' : 'paused';
    const h = React.createElement;
    if (kind === 'barras') {
      const bars = Array.from({ length: 28 }, (_, i) => h('span', { key: i, style: {
        flex: 1, height: '70%', background: i % 2 ? '#2b3bff' : '#f4ff3a', opacity: .85, borderRadius: 3, transformOrigin: 'bottom',
        animation: `sqBar ${0.6 + ((i * 37) % 9) / 10}s ease-in-out ${-(i * 0.13)}s infinite`, animationPlayState: run } }));
      return h('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 10% 0', opacity: .45 } }, bars);
    }
    const rings = Array.from({ length: n }, (_, i) => h('span', { key: i, style: {
      position: 'absolute', left: ox, top: oy, width: size, height: size, borderRadius: '50%', border: `${bw}px solid ${i % 3 === 2 ? '#2b3bff' : 'rgba(244,255,58,.55)'}`,
      animation: `sqRipple ${dur}s linear ${-(i * dur) / n}s infinite`, animationPlayState: run } }));
    return h('div', { style: { position: 'absolute', inset: 0 } }, rings);
  }

  // ---------- ficheros y lista ----------
  async openFiles(autoplay) {
    const r = await sq.openDialog(this.state.prefs.formats);
    if (r) this.addItems(r.items, r.folder, autoplay);
  }
  addItems(items, folder, autoplay) {
    const P = this.state.prefs;
    items = (items || []).filter(it => (it.url ? P.stream : true));
    if (!items.length) return;
    if (!P.append || (folder && P.clearOnLoad)) this.clearList();
    const start = this.tracks.length, wasEmpty = start === 0;
    for (const it of items) this.tracks.push(this.mkTrack(it));
    this.listDirty = true;
    this.scan();
    const play = autoplay ?? (this.state.autoAdd || wasEmpty);
    this.setState(st => (play ? { idx: start, sel: start, t: 0, playing: true, view: 'viz', navHist: st.view === 'viz' ? st.navHist : [...st.navHist, st.view].slice(-20) } : { sel: start }));
  }
  clearList() {
    this.tracks = [];
    if (this.audio) { this.audio.pause(); this.audio.removeAttribute('src'); this.audio.load(); }
    this.srcId = null;
    this.setState({ idx: 0, sel: 0, t: 0, playing: false });
  }
  async scan() {
    if (this.scanning) return;
    this.scanning = true;
    for (;;) {
      const tr = this.tracks.find(x => !x.scanned);
      if (!tr) break;
      tr.scanned = true;
      if (tr.path) {
        try {
          const r = await sq.readTags(tr.path, false);
          if (r) {
            if (r.missing) tr.missing = true;
            tr.tech = r.tech;
            const tg = r.tags || {};
            tr.tags = { ...tr.tags, ...tg };
            if (tg.title) tr.title = tg.title;
            if (tg.artist) tr.artist = tg.artist;
            tr.orig = { ...tr.tags };
          }
        } catch (e) { /* se queda con el nombre del archivo */ }
        if (!tr.d && !tr.missing) tr.d = await this.probe(tr);
      }
      this.listDirty = true;
      if (!this.updT) this.updT = setTimeout(() => { this.updT = null; this.forceUpdate(); }, 120);
    }
    this.scanning = false;
  }
  probe(tr) {
    return new Promise(res => {
      const a = this.probeEl || (this.probeEl = new Audio());
      const done = v => { clearTimeout(to); a.onloadedmetadata = a.onerror = null; res(isFinite(v) && v > 0 ? v : 0); };
      const to = setTimeout(() => done(0), 8000);
      a.preload = 'metadata';
      a.onloadedmetadata = () => done(a.duration);
      a.onerror = () => done(0);
      a.src = srcOf(tr);
    });
  }
  async loadCover(tr) {
    if (!tr || !tr.path || tr.coverLoaded) return;
    tr.coverLoaded = true;
    try {
      const r = await sq.readTags(tr.path, true);
      if (r && r.cover && !tr.coverDirty) {
        tr.coverData = r.cover;
        tr.tags = { ...tr.tags, cover: URL.createObjectURL(new Blob([r.cover.data], { type: r.cover.mime })) };
        if (tr.orig) tr.orig.cover = tr.tags.cover;
        this.forceUpdate();
      }
    } catch (e) { /* sin carátula */ }
  }
  dropCover(tr) {
    if (!tr || tr.coverDirty || !tr.coverLoaded) return;
    if (tr.tags && tr.tags.cover) { URL.revokeObjectURL(tr.tags.cover); delete tr.tags.cover; if (tr.orig) delete tr.orig.cover; }
    tr.coverData = null; tr.coverLoaded = false;
  }
  moveTrack(from, to) {
    const T_ = this.tracks;
    if (from == null || to == null || from < 0 || from >= T_.length) return;
    to = Math.max(0, Math.min(T_.length, to));
    if (to === from || to === from + 1) return;
    const [tr] = T_.splice(from, 1);
    const ins = to > from ? to - 1 : to;
    T_.splice(ins, 0, tr);
    this.listDirty = true;
    const map = i => (i === from ? ins : (from < i && i <= ins ? i - 1 : (ins <= i && i < from ? i + 1 : i)));
    this.setState(st => ({ idx: map(st.idx), sel: ins }));
  }
  removeTrack(i) {
    const T_ = this.tracks;
    if (i < 0 || i >= T_.length) return;
    T_.splice(i, 1);
    this.listDirty = true;
    this.setState(st => {
      const n = T_.length;
      if (!n) return { idx: 0, sel: 0, t: 0, playing: false };
      if (i === st.idx) return { idx: Math.min(i, n - 1), sel: Math.min(i, n - 1), t: 0 };
      const idx = i < st.idx ? st.idx - 1 : st.idx;
      return { idx, sel: Math.min(i < st.sel ? st.sel - 1 : st.sel, n - 1) };
    });
  }

  // ---------- audio ----------
  ensureAudio() {
    if (this.audio) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const A = this.audio = new Audio();
    A.preservesPitch = false; A.preload = 'auto';
    const ac = this.ac = new AudioContext({ latencyHint: 'playback' });
    const src = ac.createMediaElementSource(A);
    this.pre = ac.createGain();
    this.filters = FREQS.map(f => { const b = ac.createBiquadFilter(); b.type = 'peaking'; b.frequency.value = f; b.Q.value = 2.4; b.gain.value = 0; return b; });
    this.pan = ac.createStereoPanner();
    this.conv = ac.createConvolver(); this.conv.buffer = impulse(ac);
    this.wet = ac.createGain(); this.wet.gain.value = 0;
    this.fade = ac.createGain(); this.gain = ac.createGain(); this.out = ac.createGain();
    let n = this.pre; src.connect(n);
    for (const f of this.filters) { n.connect(f); n = f; }
    n.connect(this.pan); n.connect(this.conv); this.conv.connect(this.wet); this.wet.connect(this.pan);
    const sp = ac.createChannelSplitter(2);
    this.anL = ac.createAnalyser(); this.anR = ac.createAnalyser();
    this.anL.fftSize = this.anR.fftSize = 1024; this.anL.smoothingTimeConstant = this.anR.smoothingTimeConstant = 0.6;
    this.pan.connect(sp); sp.connect(this.anL, 0); sp.connect(this.anR, 1);
    this.pan.connect(this.fade); this.fade.connect(this.gain); this.gain.connect(this.out); this.out.connect(ac.destination);
    A.ontimeupdate = () => { if (this.reloading) return; this.setState({ t: A.currentTime }); this.applyFade(); };
    const dur = () => { const c = this.tracks[this.state.idx]; if (c && this.srcId === c.id && isFinite(A.duration) && A.duration > 0 && Math.abs((c.d || 0) - A.duration) > 0.5) { c.d = A.duration; this.listDirty = true; this.forceUpdate(); } };
    A.onloadedmetadata = dur; A.ondurationchange = dur;
    A.onplaying = () => { this.errN = 0; };
    A.onended = () => {
      const st = this.state, n = this.tracks.length;
      // Repetir: vuelve a sonar la misma pista.
      if (st.repeat) { A.currentTime = 0; A.play().catch(() => {}); this.setState({ t: 0 }); return; }
      // Sin repetir: al acabar la última (o la única) se detiene y vuelve al principio de la lista.
      if (n <= 1 || (!st.shuffle && st.idx >= n - 1)) { A.currentTime = 0; this.setState({ idx: 0, sel: 0, t: 0, playing: false }); return; }
      this.setState(s => this.jump(s, 1)); // siguiente, o una al azar distinta si Aleatorio está activo
    };
    A.onerror = () => {
      const c = this.tracks[this.state.idx];
      if (!c || !A.getAttribute('src')) return;
      c.error = true; this.errN = (this.errN || 0) + 1;
      if (this.state.playing && this.errN < this.tracks.length) this.setState(st => this.jump({ ...st, shuffle: false }, 1));
      else this.setState({ playing: false });
    };
  }
  applyFade() {
    if (!this.fade) return;
    const A = this.audio, on = this.state.prefs.dsp === 'Fundido', D = A.duration;
    const g = on && isFinite(D) && D > 6 ? Math.max(0, Math.min(1, A.currentTime / 1.5, (D - A.currentTime) / 3)) : 1;
    this.fade.gain.setTargetAtTime(g, this.ac.currentTime, 0.12);
  }
  syncAudio() {
    const s = this.state, c = this.tracks[s.idx];
    if (!c) { if (this.audio && !this.audio.paused) this.audio.pause(); if (s.playing) this.setState({ playing: false }); return; }
    if (!this.audio) { if (!s.playing) return; this.ensureAudio(); }
    const A = this.audio, ac = this.ac, P = s.prefs, now = ac.currentTime;
    const sig = [s.vol, s.amp, s.bal, s.pitch, P.dsp, P.masterVol, this.recOn, s.eq.join()].join('|');
    if (sig !== this.audSig) {
      this.audSig = sig;
      this.pre.gain.setTargetAtTime(Math.pow(10, ((s.amp - 0.5) * 24) / 20), now, 0.02);
      s.eq.forEach((v, i) => this.filters[i].gain.setTargetAtTime(v, now, 0.02));
      this.pan.pan.setTargetAtTime(s.bal, now, 0.02);
      this.gain.gain.setTargetAtTime(P.masterVol ? 1 : s.vol, now, 0.02);
      this.wet.gain.setTargetAtTime(P.dsp === 'Reverberación' ? 0.4 : 0, now, 0.05);
      this.out.gain.setTargetAtTime(this.recOn ? 0 : 1, now, 0.02);
      A.defaultPlaybackRate = A.playbackRate = Math.pow(2, s.pitch * 0.5);
    }
    if (this.srcId !== c.id) {
      const prevTr = this.tracks.find(x => x.id === this.srcId);
      this.dropCover(prevTr);
      this.srcId = c.id;
      A.src = srcOf(c);
      A.playbackRate = Math.pow(2, s.pitch * 0.5);
      this.loadCover(c);
      if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: c.title, artist: c.artist, album: (c.tags && c.tags.album) || '' });
    }
    if (s.playing && A.paused && !this.reloading) { if (ac.state === 'suspended') ac.resume(); A.play().catch(() => {}); }
    if (!s.playing && !A.paused) A.pause();
  }
  reloadAt(t) {
    const A = this.audio, c = this.tracks[this.state.idx];
    if (!A || !c || this.srcId !== c.id) return;
    this.reloading = true;
    A.src = srcOf(c) + '&v=' + Date.now();
    A.addEventListener('loadedmetadata', () => { A.currentTime = t; this.reloading = false; if (this.state.playing) A.play().catch(() => {}); }, { once: true });
    setTimeout(() => { this.reloading = false; }, 3000);
  }
  seekBy(dt) {
    const A = this.audio, c = this.tracks[this.state.idx];
    if (!A || !c || !c.d || this.srcId !== c.id) return;
    const t = Math.max(0, Math.min(c.d - 0.5, A.currentTime + dt));
    A.currentTime = t; this.setState({ t });
  }
  jump(s, dir) {
    const n = this.tracks.length;
    if (!n) return { idx: 0, sel: 0, t: 0, playing: false };
    let i = (s.idx + dir + n) % n;
    if (s.shuffle && dir > 0 && n > 1) { i = Math.floor(Math.random() * n); if (i === s.idx) i = (i + 1) % n; }
    if (i === s.idx && this.audio) { this.audio.currentTime = 0; if (s.playing) this.audio.play().catch(() => {}); }
    return { idx: i, sel: i, t: 0 };
  }
  async startRec() {
    this.ensureAudio();
    const file = await sq.recStart(this.ac.sampleRate);
    if (!file) return;
    if (!this.recLoaded) { await this.ac.audioWorklet.addModule('recorder.js'); this.recLoaded = true; }
    const node = this.recNode = new AudioWorkletNode(this.ac, 'rec', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit' });
    const z = this.recZero = this.ac.createGain(); z.gain.value = 0;
    this.fade.connect(node); node.connect(z); z.connect(this.ac.destination);
    let buf = [], size = 0;
    node.port.onmessage = e => {
      if (!this.state.playing) return;
      buf.push(new Uint8Array(e.data)); size += e.data.byteLength;
      if (size >= 32768) { const o = new Uint8Array(size); let p = 0; for (const b of buf) { o.set(b, p); p += b.length; } sq.recChunk(o.buffer); buf = []; size = 0; }
    };
    this.recOn = true;
    this.setState(st => ({ prefs: { ...st.prefs, out: 'Grabar a WAV' }, id3Status: null }));
  }
  stopRec() {
    if (this.recNode) { try { this.fade.disconnect(this.recNode); this.recNode.disconnect(); this.recZero.disconnect(); } catch (e) { /* ya desconectado */ } this.recNode.port.onmessage = null; this.recNode = null; }
    this.recOn = false;
    sq.recStop();
    this.setState(st => ({ prefs: { ...st.prefs, out: 'Salida del sistema' } }));
  }
  drag(key, min, max, sens) {
    return e => {
      e.preventDefault();
      const y0 = e.clientY, v0 = this.state[key];
      const mv = ev => this.setState({ [key]: Math.max(min, Math.min(max, v0 + (y0 - ev.clientY) * sens)) });
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    };
  }
  bandDown(i) {
    return e => {
      e.preventDefault();
      const r = e.currentTarget.getBoundingClientRect();
      const set = y => {
        const v = Math.round(Math.max(-12, Math.min(12, ((r.bottom - y) / r.height) * 24 - 12)));
        this.setState(s => { const eq = s.eq.slice(); eq[i] = v; return { eq, preset: 'Personal' }; });
      };
      set(e.clientY);
      const mv = ev => set(ev.clientY);
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    };
  }

  // ---------- valores para las vistas (del prototipo) ----------
  renderVals() {
    const s = this.state, T_ = this.tracks, P0 = s.prefs;
    const real = T_[s.idx];
    const nameOf = tr => (P0.showFile && tr.path ? baseName(tr.path) : tr.title);
    const artOf = tr => T(tr.artist);
    const cur = real || { empty: true, title: T('Sin música'), artist: T('Pulsa ABRIR para añadir canciones'), d: 0 };
    const fmt = x => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
    const D = cur.d || 1, p = real && cur.d ? s.t / D : -1;
    const seek = f => e => { if (e && e.stopPropagation) e.stopPropagation(); if (!real || !cur.d) return; if (this.audio && this.srcId === cur.id) this.audio.currentTime = f * D; this.setState({ t: Math.floor(f * D) }); };
    const canvas = k => React.createElement('canvas', { key: 'cv-' + k, ref: el => { this.cv[k] = el; }, style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } });
    const kind = s.vizKind || 'ondas';
    const led = on => (on ? 'linear-gradient(180deg,#fdffb0,#f4ff3a 50%,#c3cf00)' : 'linear-gradient(180deg,#0a0e45,#1c237f)');
    const glow = on => (on ? 'inset 0 1px 0 rgba(255,255,255,.7), 0 0 0 2px #0a0e45, 0 0 12px rgba(244,255,58,.7)' : 'inset 0 2px 3px rgba(0,0,0,.6), 0 0 0 2px #0a0e45, 0 1px 0 2px rgba(255,255,255,.08)');
    const tog = k => () => this.setState(st => ({ [k]: !st[k] }));
    const listOn = s.view === 'list';
    const go = v => this.navSet(st => (st.view === v ? null : { tabSwitch: false, view: v, navHist: [...st.navHist, st.view].slice(-20) }));
    const toggleList = () => go(s.view === 'list' ? 'viz' : 'list');
    const eject = () => this.openFiles();
    const volDeg = -135 + 270 * s.vol;
    const move = dir => () => this.setState(st => (st.view === 'list' && st.win === 'full'
      ? (T_.length ? { sel: (st.sel + dir + T_.length) % T_.length } : null)
      : { modeCon: (st.modeCon + dir + 4) % 4, modeMid: (st.modeMid + dir + 4) % 4 }));
    const opt = (label, on, fn) => ({ label: T(label), on: fn, bg: on ? '#f4ff3a' : 'transparent', fg: on ? '#0a0f5c' : '#eef0ff' });
    const MODES = ['ONDAS', 'VÚMETRO 3D', 'HALO', 'VUELO'];
    const tab = TABS.includes(s.setTab) ? s.setTab : 'Sistema';
    const BK = P0.blocks !== false, bsp = 0.6 + (1 - P0.menuSpeed) * 0.8;
    const ba = (dir, i, base = 0.12) => (!BK ? 'none' : s.exiting ? `sqBx-${dir} ${(0.32 * bsp).toFixed(2)}s cubic-bezier(.7,0,.84,0) ${(Math.max(0, 6 - i) * 0.03 * bsp).toFixed(2)}s both` : `sqB-${dir} ${(0.55 * bsp).toFixed(2)}s cubic-bezier(.16,1,.3,1) ${((base + i * 0.07) * bsp).toFixed(2)}s both`);
    const b = { l0: ba('l', 0), l1: ba('l', 1), u3: ba('u', 3), r1: ba('r', 1), r2: ba('r', 2), r3: ba('r', 3), r4: ba('r', 4), r5: ba('r', 5), u5: ba('u', 6), u6: ba('u', 7), d0: ba('d', 0) };
    const sk = SKINS.find(x => x.key === s.skin) || SKINS[2];
    const goTab = k => { this.setState({ setTab: k, tabSwitch: false }); go('settings'); };
    const status = m => this.setState({ id3Status: m });
    const plainTags = tg => Object.fromEntries(TAG_KEYS.map(k => [k, (tg && tg[k]) || '']));
    const pct = x => { const n = Math.round(x * 100); return (n > 0 ? '+' : '') + n + '%'; };
    const isMp3 = real && cur.path && /\.mp3$/i.test(cur.path);
    return {
      sk, b,
      viewAnim: (() => { const tr = s.trans || 'iris'; if (s.exiting) { if (tr === 'none') return 'none'; const dx = ((tr === 'glitch' ? 0.45 : 0.3) + (1 - P0.menuSpeed) * 0.7) * 0.6; return `sqTx-${tr} ${dx.toFixed(2)}s cubic-bezier(.7,0,.84,0) ${(BK ? 0.12 * bsp : 0).toFixed(2)}s both`; } if (tr === 'none' || (s.tabSwitch && s.view === 'settings')) return 'none'; const d = (tr === 'glitch' ? 0.45 : 0.3) + (1 - P0.menuSpeed) * 0.7; const ease = tr === 'glitch' ? 'linear' : (P0.menuSmooth > 0.5 ? 'cubic-bezier(.16,1,.3,1)' : 'ease-out'); return `sqT-${tr} ${d.toFixed(2)}s ${ease} both`; })(),
      isSettings: s.view === 'settings', goSettings: () => go('settings'),
      setTabs: TABS.map((k, i) => ({ anim: s.tabSwitch ? 'none' : ba('l', i * 0.6, 0.15), label: T(k), bg: tab === k ? '#f4ff3a' : 'transparent', fg: tab === k ? '#0a0f5c' : '#eef0ff', on: () => { if (k === s.setTab || s.tabExit) return; const done = () => { this.setState({ setTab: k, tabSwitch: true, tabExit: false, view: '_' }); requestAnimationFrame(() => this.setState({ view: 'settings' })); }; if (!BK) return done(); this.setState({ tabExit: true }); clearTimeout(this.tabT); this.tabT = setTimeout(done, (0.28 + 0.2) * bsp * 1000); } })),
      setRows: this.settingsRows(tab, { opt, sk, kind, MODES }).map((r, i) => ({ ...r, anim: s.tabExit && BK ? `sqBx-r ${(0.28 * bsp).toFixed(2)}s cubic-bezier(.7,0,.84,0) ${(i * 0.02 * bsp).toFixed(2)}s both` : ba('r', i * 0.6, s.tabSwitch ? 0 : 0.2) })),
      conTime: s.showRemain ? '-' + fmt(Math.max(0, (cur.d || 0) - s.t)) : fmt(s.t),
      cur: { title: real ? nameOf(cur) : cur.title, artist: real ? artOf(cur) : cur.artist }, playing: s.playing, paused: !s.playing,
      trackNo: `${String(real ? s.idx + 1 : 0).padStart(2, '0')} / ${String(T_.length).padStart(2, '0')}`,
      elapsed: fmt(s.t), remaining: '-' + fmt(Math.max(0, (cur.d || 0) - s.t)), dur: fmt(cur.d || 0),
      vizMid: s.modeMid === 0 ? this.viz(kind, 74, 128, 420, 7, 2, 4.2) : canvas('mid'),
      vizConsole: s.modeCon === 0 ? this.viz(kind, '100%', '100%', 1100, 9, 3, 6) : canvas('con'),
      modeMid: T(MODES[s.modeMid]), modeCon: T(MODES[s.modeCon]), midLogoOp: s.modeMid === 0 ? 1 : 0,
      isViz: s.view === 'viz', isList: listOn, isHome: s.view === 'home', isInfo: s.view === 'info', isAbout: s.view === 'about',
      about: { version: T('Versión') + ' ' + sq.version, copy: '© 2026 NUVOLACAT · ' + T('Código abierto, licencia MIT') },
      showInfoBtn: !!s.infoVis,
      infoBtnAnim: s.infoLeaving ? 'sqI-out .38s cubic-bezier(.45,0,.75,.3) both' : 'sqI-in .5s cubic-bezier(.16,1,.3,1) both',
      goInfo: () => { this.setState({ id3Status: null }); if (real) this.loadCover(cur); if (s.win !== 'full') this.setState({ win: 'full', view: 'info', navHist: s.view === 'info' ? s.navHist : [...s.navHist, s.view].slice(-20) }); else go('info'); },
      id3: (() => { const tg = cur.tags || { title: real ? cur.title : '', artist: '' }; return { title: tg.title || '', artist: tg.artist || '', album: tg.album || '', year: tg.year || '', genre: tg.genre || '', track: tg.track || '', comment: tg.comment || '', cover: tg.cover || '', coverBg: tg.cover ? `url("${tg.cover}")` : 'none', hasCover: !!tg.cover, noCover: !tg.cover, status: s.id3Status || (this.recOn ? T('Grabando en') + ' WAV' : real ? (cur.path ? baseName(cur.path) : T('Emisión por internet')) : '—'), tech: (cur.error ? [T('No se puede reproducir')] : (cur.tech || ['—']).map(x => T(x))).join('\n') }; })(),
      id3Set: Object.fromEntries(TAG_KEYS.map(k => [k, e => { if (!real) return; const v = e.target.value; if (!cur.tags) cur.tags = { title: cur.title, artist: cur.artist }; if (!cur.orig) cur.orig = { ...cur.tags }; cur.tags[k] = v; status(T('Cambios sin guardar')); }])),
      id3Save: async () => {
        if (!real) return;
        const tg = cur.tags || {};
        if (tg.title) cur.title = tg.title; if (tg.artist) cur.artist = tg.artist;
        this.listDirty = true;
        if (!isMp3) { cur.orig = { ...tg }; status(T(cur.path ? 'Guardado en la lista (solo se escribe en archivos mp3)' : 'Guardado en la lista')); return; }
        status(T('Guardando…'));
        const pos = this.audio && this.srcId === cur.id ? this.audio.currentTime : null;
        const r = await sq.writeTags(cur.path, plainTags(tg), cur.coverDirty ? cur.coverData : null, null);
        if (r && r.ok) { cur.orig = { ...tg }; cur.coverDirty = false; if (pos != null) this.reloadAt(pos); status(T('Guardado en el archivo')); }
        else status(T('No se pudo guardar') + (r && r.error ? ' · ' + r.error : ''));
      },
      id3Revert: () => { if (!real) return; if (cur.orig) cur.tags = { ...cur.orig }; status(T('Cambios descartados')); },
      id3Download: async () => {
        if (!isMp3) { status(T('Solo para archivos mp3 de tu equipo')); return; }
        const tg = cur.tags || {};
        const dest = await sq.saveDialog(((tg.artist ? tg.artist + ' - ' : '') + (tg.title || 'cancion')).replace(/[/:]/g, '-') + '.mp3', 'mp3');
        if (!dest) return;
        status(T('Guardando…'));
        const r = await sq.writeTags(cur.path, plainTags(tg), cur.coverDirty ? cur.coverData : null, dest);
        status(r && r.ok ? T('Copia guardada con las etiquetas') : T('No se pudo guardar') + (r && r.error ? ' · ' + r.error : ''));
      },
      id3Search: async () => {
        if (!real) return;
        if (!P0.songInfo) { status(T('Activa «Info de canciones» en Ajustes · Internet')); return; }
        const tg = cur.tags || { title: cur.title, artist: cur.artist };
        const esc = x => String(x).replace(/["\\]/g, ' ');
        const q = [tg.title && `recording:"${esc(tg.title)}"`, tg.artist && tg.artist !== 'Archivo local' && tg.artist !== 'Radio' && `artist:"${esc(tg.artist)}"`].filter(Boolean).join(' AND ');
        if (!q) return;
        status(T('Buscando en MusicBrainz…'));
        const j = await sq.mbSearch(q);
        if (!j || j.error) { status(T('No se pudo conectar')); return; }
        const rec = (j.recordings || [])[0];
        if (!rec) { status(T('Sin resultados')); return; }
        const rel = (rec.releases || [])[0] || {};
        if (!cur.orig) cur.orig = { ...tg };
        cur.tags = { ...tg, title: rec.title || tg.title, artist: (rec['artist-credit'] || []).map(a => a.name + (a.joinphrase || '')).join('') || tg.artist, album: rel.title || tg.album, year: (rel.date || rec['first-release-date'] || '').slice(0, 4) || tg.year, track: (rel.media && rel.media[0] && rel.media[0].track && rel.media[0].track[0] && rel.media[0].track[0].number) || tg.track, genre: tg.genre || ((rec.tags || [])[0] || {}).name || '' };
        status(T('Encontrado · revisa y guarda'));
        if (rel.id && P0.covers) {
          const c = await sq.mbCover(rel.id);
          if (c && c.data && this.tracks.includes(cur)) { cur.coverData = c; cur.coverDirty = true; cur.coverLoaded = true; cur.tags = { ...cur.tags, cover: URL.createObjectURL(new Blob([c.data], { type: c.mime })) }; this.forceUpdate(); }
        }
      },
      back: () => this.navSet(st => (st.navHist.length ? { view: st.navHist[st.navHist.length - 1], navHist: st.navHist.slice(0, -1) } : null)),
      backOp: s.navHist.length ? 1 : 0.45,
      home: () => go('home'),
      minWin: () => this.setState({ win: 'min' }),
      closeWin: () => { this.setState({ playing: false }); sq.hide(); },
      restoreWin: () => this.setState({ win: 'full' }),
      toCompact: () => this.setState({ win: 'compact' }),
      goViz: () => go('viz'), goList: () => go('list'), openMusic: () => this.openFiles(),
      openAudio: () => this.setState({ eqOpen: true }),
      toggle: () => { if (!T_.length) { this.openFiles(); return; } this.setState(st => ({ playing: !st.playing })); },
      stop: () => { if (this.audio) this.audio.currentTime = 0; this.setState({ playing: false, t: 0 }); },
      prev: () => { if (s.t > 3) { if (this.audio) this.audio.currentTime = 0; this.setState({ t: 0 }); } else this.setState(st => this.jump({ ...st, shuffle: false }, -1)); },
      next: () => this.setState(st => this.jump(st, 1)),
      up: move(-1), down: move(1),
      links: { inicio: () => sq.openExternal('https://nuvola.cat'), musica: () => sq.openMusic(), noticias: () => sq.openExternal('https://nuvola.cat'), aspectos: () => goTab('Aspecto'), complementos: () => goTab('Visuales'), ayuda: () => sq.help(), acerca: () => go('about'), web: () => sq.openExternal('https://www.soniqus.com'), nuvola: () => sq.openExternal('https://nuvola.cat'), github: () => sq.openExternal('https://github.com/nuvolacat/Soniqus') },
      pills: [
        { label: T('ABRIR'), led: led(false), glow: glow(false), on: eject },
        { label: T('NAVEGAR'), led: led(false), glow: glow(false), on: () => this.setState({ win: 'full' }) },
        { label: T('REPETIR'), led: led(s.repeat), glow: glow(s.repeat), on: tog('repeat') },
        { label: T('ALEATORIO'), led: led(s.shuffle), glow: glow(s.shuffle), on: tog('shuffle') },
      ],
      pillsConsole: [
        { label: T('ABRIR'), led: led(false), glow: glow(false), on: eject },
        { label: T('LISTA'), led: led(listOn), glow: glow(listOn), on: toggleList },
        { label: T('REPETIR'), led: led(s.repeat), glow: glow(s.repeat), on: tog('repeat') },
        { label: T('ALEATORIO'), led: led(s.shuffle), glow: glow(s.shuffle), on: tog('shuffle') },
      ],
      ringDots: Array.from({ length: 64 }, (_, i) => ({
        tf: `rotate(${i * 360 / 64}deg) translateY(-112px)`,
        c: i / 64 <= p ? '#f4ff3a' : 'rgba(238,240,255,.18)', seek: seek(i / 64),
      })),
      segs: Array.from({ length: 60 }, (_, i) => ({ c: i / 60 <= p ? '#f4ff3a' : 'rgba(238,240,255,.14)', seek: seek(i / 60) })),
      volDots: Array.from({ length: 11 }, (_, i) => ({
        tf: `rotate(${-135 + i * 27}deg) translateY(-38px)`, c: i / 10 <= s.vol + 0.001 ? '#f4ff3a' : '#2a3190', g: i / 10 <= s.vol + 0.001 ? '0 0 6px rgba(244,255,58,.8)' : 'none',
      })),
      volBars: Array.from({ length: 11 }, (_, i) => ({ h: 6 + i * 2, c: i / 10 <= s.vol + 0.001 ? '#f4ff3a' : '#2a3190' })),
      volDeg, dragVol: this.drag('vol', 0, 1, 0.006),
      rows: T_.map((tr, i) => {
        const sel = i === s.sel;
        return {
          n: String(i + 1).padStart(2, '0'), title: nameOf(tr), artist: artOf(tr), d: fmt(tr.d || 0),
          bg: sel ? '#f4ff3a' : 'transparent', fg: sel ? '#0a0f5c' : (tr.error || tr.missing ? '#8f96d6' : '#eef0ff'),
          dot: i === s.idx ? (sel ? '#0a0f5c' : '#f4ff3a') : 'transparent',
          pick: () => this.setState({ sel: i }),
          play: () => this.navSet(st => ({ idx: i, sel: i, t: 0, playing: true, view: 'viz', navHist: [...st.navHist, st.view].slice(-20) })),
          del: e => { e.stopPropagation(); this.removeTrack(i); },
          ds: e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); this.setState({ dragFrom: i, sel: i }); },
          dov: e => { e.preventDefault(); if (s.dragFrom == null) return; const r = e.currentTarget.getBoundingClientRect(); const to = e.clientY < r.top + r.height / 2 ? i : i + 1; if (s.dragOver !== to) this.setState({ dragOver: to }); },
          drop: e => { if (e.dataTransfer.files && e.dataTransfer.files.length) return; e.preventDefault(); if (s.dragFrom != null) this.moveTrack(s.dragFrom, s.dragOver); this.setState({ dragFrom: null, dragOver: null }); },
          de: () => this.setState({ dragFrom: null, dragOver: null }),
          ind: s.dragFrom != null && s.dragOver === i ? 'inset 0 3px 0 #f4ff3a' : (s.dragFrom != null && s.dragOver === T_.length && i === T_.length - 1 ? 'inset 0 -3px 0 #f4ff3a' : 'none'),
          op: s.dragFrom === i ? 0.4 : 1, anim: ba('r', Math.min(i, 10) * 0.5, 0.15),
        };
      }),
      listInfo: T_.length + ' ' + T(T_.length === 1 ? 'canción ·' : 'canciones ·') + ' ' + fmt(T_.reduce((a, x) => a + (x.d || 0), 0)),
      addTracks: () => this.openFiles(s.autoAdd),
      moveUp: () => this.moveTrack(s.sel, s.sel - 1),
      moveDown: () => this.moveTrack(s.sel, s.sel + 2),
      delSel: () => this.removeTrack(s.sel), delOp: T_.length > 0 ? 1 : 0.4,
      listKey: () => {},
      eqOpen: s.eqOpen, toggleEq: tog('eqOpen'),
      chevron: s.eqOpen ? 225 : 45, chevronOff: s.eqOpen ? 4 : -4,
      eqRows: s.eqOpen ? '1fr' : '0fr', eqOp: s.eqOpen ? 1 : 0, eqMt: s.eqOpen ? '0px' : '-16px', eqDur: s.eqOpen ? '.6s' : '.45s',
      bands: s.eq.map((v, i) => {
        const pos = ((12 - v) / 24) * 100;
        return { anim: s.eqOpen ? `sqB-u .5s cubic-bezier(.16,1,.3,1) ${(0.08 + i * 0.022).toFixed(3)}s both` : 'none', n: i + 1, pos, ft: Math.min(50, pos), fh: Math.abs(50 - pos), down: this.bandDown(i) };
      }),
      knobs: [
        { anim: s.eqOpen ? 'sqB-r .5s cubic-bezier(.16,1,.3,1) .3s both' : 'none', label: T('AMPLI'), deg: -135 + 270 * s.amp, down: this.drag('amp', 0, 1, 0.006), val: pct((s.amp - 0.5) * 2), reset: () => this.setState({ amp: 0.5 }) },
        { anim: s.eqOpen ? 'sqB-r .5s cubic-bezier(.16,1,.3,1) .36s both' : 'none', label: T('BAL'), deg: 135 * s.bal, down: this.drag('bal', -1, 1, 0.012), val: Math.round(s.bal * 100) === 0 ? '0%' : T(s.bal < 0 ? 'I' : 'D') + ' ' + Math.abs(Math.round(s.bal * 100)) + '%', reset: () => this.setState({ bal: 0 }) },
        { anim: s.eqOpen ? 'sqB-r .5s cubic-bezier(.16,1,.3,1) .42s both' : 'none', label: T('TONO'), deg: 135 * s.pitch, down: this.drag('pitch', -1, 1, 0.012), val: pct(s.pitch), reset: () => this.setState({ pitch: 0 }) },
      ],
      flat: () => this.setState({ eq: Array(20).fill(0), amp: 0.5, bal: 0, pitch: 0, preset: 'Plano' }),
    };
  }

  render() {
    setLang(this.state.prefs.lang);
    const v = this.vals = this.renderVals();
    const w = this.state.win;
    if (w === 'compact') return Compact(v);
    return (
      <div data-ghost="" style={S('width:780px;display:flex;flex-direction:column;gap:10px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.3))')}>
        {w === 'min' ? Mini(v) : Console(v)}
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(<App />);
