// Lectura y escritura de etiquetas ID3 (v2.2/2.3/2.4 + v1) y datos técnicos MPEG.
// Basado en la implementación de referencia del prototipo de diseño, ampliado para
// escribir en el fichero real conservando la carátula y el resto de marcos.
const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');

const GENRES = ['Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge', 'Hip-Hop', 'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B', 'Rap', 'Reggae', 'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska', 'Death Metal', 'Pranks', 'Soundtrack', 'Euro-Techno', 'Ambient', 'Trip-Hop', 'Vocal', 'Jazz+Funk', 'Fusion', 'Trance', 'Classical', 'Instrumental', 'Acid', 'House', 'Game', 'Sound Clip', 'Gospel', 'Noise', 'AlternRock', 'Bass', 'Soul', 'Punk', 'Space', 'Meditative', 'Instrumental Pop', 'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave', 'Techno-Industrial', 'Electronic', 'Pop-Folk', 'Eurodance', 'Dream', 'Southern Rock', 'Comedy', 'Cult', 'Gangsta', 'Top 40', 'Christian Rap', 'Pop/Funk', 'Jungle', 'Native American', 'Cabaret', 'New Wave', 'Psychadelic', 'Rave', 'Showtunes', 'Trailer', 'Lo-Fi', 'Tribal', 'Acid Punk', 'Acid Jazz', 'Polka', 'Retro', 'Musical', 'Rock & Roll', 'Hard Rock'];

const ss = (u, p) => ((u[p] & 127) << 21) | ((u[p + 1] & 127) << 14) | ((u[p + 2] & 127) << 7) | (u[p + 3] & 127);
const be32 = (u, p) => ((u[p] << 24) | (u[p + 1] << 16) | (u[p + 2] << 8) | u[p + 3]) >>> 0;
const syncsafe = n => [(n >> 21) & 127, (n >> 14) & 127, (n >> 7) & 127, n & 127];
const ascii = (u, p, n) => String.fromCharCode(...u.subarray(p, p + n));

function dec(enc, b) {
  try {
    if (enc === 1) return new TextDecoder(b[0] === 0xfe && b[1] === 0xff ? 'utf-16be' : 'utf-16le').decode(b);
    if (enc === 2) return new TextDecoder('utf-16be').decode(b);
    if (enc === 3) return new TextDecoder('utf-8').decode(b);
    return new TextDecoder('latin1').decode(b);
  } catch (e) { return ''; }
}
const clean = s => s.replace(/\u0000+$/g, '').replace(/^﻿/, '').split('\u0000')[0].trim();

function deunsync(u) {
  const o = Buffer.alloc(u.length); let n = 0;
  for (let i = 0; i < u.length; i++) { o[n++] = u[i]; if (u[i] === 0xff && u[i + 1] === 0) i++; }
  return o.subarray(0, n);
}

// Devuelve { ver, frames:[{id, flags, body}], tagEnd, unsyncAll } o null si no hay ID3v2.
function parseTag(u) {
  if (u.length < 10 || u[0] !== 73 || u[1] !== 68 || u[2] !== 51) return null;
  const ver = u[3], hf = u[5], size = ss(u, 6);
  const tagEnd = 10 + size + (ver === 4 && (hf & 0x10) ? 10 : 0);
  let data = u.subarray(10, Math.min(u.length, 10 + size));
  if ((hf & 0x80) && ver <= 3) data = deunsync(data);
  let p = 0;
  if (ver >= 3 && (hf & 0x40)) p = ver === 4 ? ss(data, 0) : be32(data, 0) + 4;
  const frames = [];
  if (ver === 2) {
    while (p + 6 <= data.length) {
      const id = ascii(data, p, 3);
      if (!/^[A-Z0-9]{3}$/.test(id)) break;
      const n = (data[p + 3] << 16) | (data[p + 4] << 8) | data[p + 5];
      if (p + 6 + n > data.length) break;
      frames.push({ id, flags: [0, 0], body: data.subarray(p + 6, p + 6 + n) });
      p += 6 + n;
    }
  } else if (ver === 3 || ver === 4) {
    while (p + 10 <= data.length) {
      const id = ascii(data, p, 4);
      if (!/^[A-Z0-9]{4}$/.test(id)) break;
      const n = ver === 4 ? ss(data, p + 4) : be32(data, p + 4);
      if (p + 10 + n > data.length) break;
      frames.push({ id, flags: [data[p + 8], data[p + 9]], body: data.subarray(p + 10, p + 10 + n) });
      p += 10 + n;
    }
  }
  return { ver, frames, tagEnd, unsyncAll: !!(hf & 0x80) };
}

// Cuerpo «legible» de un marco (deshace desincronización e indicador de longitud en v2.4).
function plainBody(f, ver) {
  let b = f.body;
  if (ver === 4) {
    if (f.flags[1] & 0x01) b = b.subarray(4);
    if (f.flags[1] & 0x02) b = deunsync(b);
  }
  return b;
}

function termEnd(b, from, wide) {
  let z = from; const w = wide ? 2 : 1;
  while (z < b.length && !(b[z] === 0 && (w === 1 || b[z + 1] === 0))) z += w;
  return z;
}

function normGenre(g) {
  if (!g) return g;
  let m = g.match(/^\((\d+)\)(.*)$/);
  if (m) return m[2].trim() || GENRES[+m[1]] || m[1];
  m = g.match(/^(\d+)$/);
  if (m) return GENRES[+m[1]] || g;
  return g;
}

const MAP4 = { TIT2: 'title', TPE1: 'artist', TALB: 'album', TYER: 'year', TDRC: 'year', TCON: 'genre', TRCK: 'track' };
const MAP2 = { TT2: 'title', TP1: 'artist', TAL: 'album', TYE: 'year', TCO: 'genre', TRK: 'track' };

function picture(f, ver) {
  const body = plainBody(f, ver);
  if (body.length < 8) return null;
  const enc = body[0]; let q = 1, mime = '';
  if (ver === 2) { const fmt = ascii(body, 1, 3).toUpperCase(); mime = fmt === 'PNG' ? 'image/png' : 'image/jpeg'; q = 4; }
  else { while (q < body.length && body[q]) mime += String.fromCharCode(body[q++]); q += 1; }
  const type = body[q]; q += 1;
  const wide = enc === 1 || enc === 2;
  q = termEnd(body, q, wide) + (wide ? 2 : 1);
  if (q >= body.length) return null;
  if (!/\//.test(mime)) mime = mime.toUpperCase() === 'PNG' ? 'image/png' : 'image/jpeg';
  return { mime, type, data: body.subarray(q) };
}

function extract(tg, wantCover) {
  const out = {}; let cover = null;
  const map = tg.ver === 2 ? MAP2 : MAP4;
  for (const f of tg.frames) {
    const body = plainBody(f, tg.ver);
    if (!body.length) continue;
    if (map[f.id]) { const v = clean(dec(body[0], body.subarray(1))); if (v && !(f.id === 'TYER' && out.year)) out[map[f.id]] = v; }
    else if ((f.id === 'COMM' || f.id === 'COM') && body.length > 4) {
      const enc = body[0], wide = enc === 1 || enc === 2;
      const z = termEnd(body, 4, wide);
      const desc = clean(dec(enc, body.subarray(4, z)));
      const txt = clean(dec(enc, body.subarray(z + (wide ? 2 : 1))));
      if (txt && (!desc || out.comment === undefined) && !/^iTun/.test(desc)) out.comment = txt;
    } else if ((f.id === 'APIC' || f.id === 'PIC') && wantCover && !cover) {
      const pic = picture(f, tg.ver);
      if (pic) cover = { mime: pic.mime, data: new Uint8Array(pic.data) };
    }
  }
  if (out.year) out.year = out.year.slice(0, 4);
  if (out.genre) out.genre = normGenre(out.genre);
  return { out, cover };
}

function readV1(t) {
  if (t.length < 128 || t[0] !== 84 || t[1] !== 65 || t[2] !== 71) return null;
  const s = (a, b) => new TextDecoder('latin1').decode(t.subarray(a, b)).replace(/\u0000.*$/, '').trim();
  const o = { title: s(3, 33), artist: s(33, 63), album: s(63, 93), year: s(93, 97), comment: s(97, 127) };
  if (t[125] === 0 && t[126]) { o.comment = s(97, 125); o.track = String(t[126]); }
  if (GENRES[t[127]]) o.genre = GENRES[t[127]];
  return o;
}

function mp3Tech(u) {
  for (let i = 0; i < u.length - 4; i++) {
    if (u[i] === 0xff && (u[i + 1] & 0xe0) === 0xe0) {
      const v = (u[i + 1] >> 3) & 3, l = (u[i + 1] >> 1) & 3, br = u[i + 2] >> 4, sr = (u[i + 2] >> 2) & 3, ch = u[i + 3] >> 6;
      if (v === 1 || l === 0 || br === 0 || br === 15 || sr === 3) continue;
      const B1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], B2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
      const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] }[v];
      return ['MPEG' + (v === 3 ? '1' : v === 2 ? '2' : '2.5'), 'Capa ' + (4 - l), ch === 3 ? 'Mono' : 'Estéreo', SR[sr] + ' Hz', (v === 3 ? B1 : B2)[br] + ' kb/s'];
    }
  }
  return null;
}

async function readTags(file, wantCover) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const fh = await fsp.open(file, 'r');
  try {
    const st = await fh.stat();
    const head = Buffer.alloc(10);
    await fh.read(head, 0, 10, 0);
    let out = {}, cover = null, audioStart = 0;
    if (head[0] === 73 && head[1] === 68 && head[2] === 51) {
      const size = ss(head, 6);
      audioStart = 10 + size + (head[3] === 4 && (head[5] & 0x10) ? 10 : 0);
      const len = Math.min(10 + size, 48 << 20, st.size);
      const buf = Buffer.alloc(len);
      await fh.read(buf, 0, len, 0);
      const tg = parseTag(buf);
      if (tg) ({ out, cover } = extract(tg, wantCover));
    }
    if (st.size >= 128) {
      const tail = Buffer.alloc(128);
      await fh.read(tail, 0, 128, st.size - 128);
      const v1 = readV1(tail);
      if (v1) for (const k of Object.keys(v1)) if (!out[k] && v1[k]) out[k] = v1[k];
    }
    let tech = null;
    if (ext === 'mp3') {
      const tb = Buffer.alloc(Math.max(0, Math.min(65540, st.size - audioStart)));
      if (tb.length) await fh.read(tb, 0, tb.length, audioStart);
      tech = mp3Tech(tb);
    }
    if (!tech) tech = [ext.toUpperCase()];
    return { tags: out, cover, tech };
  } finally { await fh.close(); }
}

const frame = (id, body, flags = [0, 0]) => Buffer.concat([Buffer.from(id, 'latin1'), Buffer.from(syncsafe(body.length)), Buffer.from(flags), body]);
const textFrame = (id, s) => frame(id, Buffer.concat([Buffer.from([3]), Buffer.from(String(s), 'utf8')]));
const REWRITE = new Set(['TIT2', 'TPE1', 'TALB', 'TYER', 'TDRC', 'TCON', 'TRCK']);
const DROP_V3 = new Set(['TDAT', 'TIME', 'TORY', 'TSIZ', 'TRDA', 'EQUA', 'RVAD', 'IPLS']);

function latin1Field(s, n) {
  const b = Buffer.alloc(n);
  const str = String(s || '');
  for (let i = 0; i < Math.min(n, str.length); i++) { const c = str.charCodeAt(i); b[i] = c < 256 ? c : 63; }
  return b;
}

// Escribe las etiquetas en `dest` (o en el propio fichero). cover = {mime, data} sustituye la carátula.
async function writeTags(file, t, cover, dest) {
  try {
    const buf = await fsp.readFile(file);
    const st = await fsp.stat(file);
    const tg = parseTag(buf);
    let audio = buf; const keep = [];
    if (tg) {
      audio = buf.subarray(Math.min(buf.length, tg.tagEnd));
      for (const f of tg.frames) {
        if (tg.ver === 2) {
          if (f.id === 'PIC' && !cover) { const pic = picture(f, 2); if (pic) keep.push(apic(pic.mime, pic.data, pic.type)); }
          continue;
        }
        if (REWRITE.has(f.id) || DROP_V3.has(f.id)) continue;
        if (f.id === 'APIC' && cover) continue;
        if (f.id === 'COMM') {
          const b = plainBody(f, tg.ver);
          if (b.length <= 4) continue;
          const wide = b[0] === 1 || b[0] === 2;
          if (!clean(dec(b[0], b.subarray(4, termEnd(b, 4, wide))))) continue; // el comentario principal se reescribe
        }
        if (tg.ver === 3) { if (f.flags[1] !== 0) continue; keep.push(frame(f.id, f.body)); }
        else { const fl = [f.flags[0], f.flags[1]]; if (tg.unsyncAll) fl[1] |= 0x02; keep.push(frame(f.id, f.body, fl)); }
      }
    }
    const parts = [];
    for (const [id, k] of [['TIT2', 'title'], ['TPE1', 'artist'], ['TALB', 'album'], ['TDRC', 'year'], ['TCON', 'genre'], ['TRCK', 'track']]) if (t[k]) parts.push(textFrame(id, t[k]));
    if (t.comment) parts.push(frame('COMM', Buffer.concat([Buffer.from([3, 115, 112, 97, 0]), Buffer.from(String(t.comment), 'utf8')])));
    if (cover && cover.data) parts.push(apic(cover.mime || 'image/jpeg', Buffer.from(cover.data), 3));
    parts.push(...keep);
    const len = parts.reduce((a, b) => a + b.length, 0);
    const head = Buffer.from([73, 68, 51, 4, 0, 0, ...syncsafe(len)]);
    let tail = null;
    if (audio.length >= 128 && audio[audio.length - 128] === 84 && audio[audio.length - 127] === 65 && audio[audio.length - 126] === 71) {
      tail = Buffer.from(audio.subarray(audio.length - 128));
      audio = audio.subarray(0, audio.length - 128);
      latin1Field(t.title, 30).copy(tail, 3); latin1Field(t.artist, 30).copy(tail, 33); latin1Field(t.album, 30).copy(tail, 63);
      latin1Field(t.year, 4).copy(tail, 93);
      const trk = parseInt(t.track, 10);
      if (trk > 0 && trk < 256) { latin1Field(t.comment, 28).copy(tail, 97); tail[125] = 0; tail[126] = trk; }
      else latin1Field(t.comment, 30).copy(tail, 97);
      const gi = GENRES.findIndex(g => g.toLowerCase() === String(t.genre || '').toLowerCase());
      if (gi >= 0) tail[127] = gi;
    }
    const target = dest || file;
    const tmp = target + '.soniqus-tmp';
    await fsp.writeFile(tmp, Buffer.concat([head, ...parts, audio, ...(tail ? [tail] : [])]), { mode: st.mode });
    await fsp.rename(tmp, target);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
function apic(mime, data, type = 3) {
  return frame('APIC', Buffer.concat([Buffer.from([0]), Buffer.from(mime, 'latin1'), Buffer.from([0, type, 0]), Buffer.from(data)]));
}

module.exports = { readTags, writeTags };
