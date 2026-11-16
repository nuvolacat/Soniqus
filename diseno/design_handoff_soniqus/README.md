# Handoff: Soniqus — reproductor de música de escritorio

## Overview
**Soniqus** es un reproductor de música de escritorio (mp3 y otros formatos locales) que rinde homenaje a los reproductores con *skins* de finales de los 90 / 2000: carcasa física con relieve, pantallas redondas, botones tipo hardware, visualizaciones reactivas al audio y un ecualizador de 20 bandas. Tiene dos ventanas/modos:

1. **Modo compacto** ("Mid mode"): ventana vertical con dos pantallas circulares.
2. **Navigation console**: ventana grande con pantalla principal, rueda de navegación y panel plegable **Audio enhancement control** (ecualizador).

Idioma de la interfaz: **castellano** (excepto los rótulos de marca "NAVIGATION CONSOLE" y "AUDIO ENHANCEMENT CONTROL", que se mantienen en inglés a propósito).

## About the Design Files
Los archivos de este paquete son **referencias de diseño creadas en HTML** — prototipos funcionales que muestran el aspecto y comportamiento esperados, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en una app real**. No hay codebase previo: se recomienda **Electron o Tauri + React + TypeScript** (ventanas sin marco, transparentes y arrastrables; acceso a ficheros locales; Web Audio API para análisis), con `<canvas>` para las visualizaciones.

Para ver los prototipos: abre `Soniqus Player.dc.html` en un navegador (necesita `support.js` en la misma carpeta y conexión a internet para Google Fonts). Toda la lógica del prototipo está en el bloque `<script data-dc-script>` al final del archivo (clase `Component`): úsala como especificación ejecutable — los algoritmos de visualización, lector/escritor ID3 y animaciones son reutilizables casi literalmente.

## Fidelity
**Alta fidelidad (hi-fi).** Colores, tipografías, medidas, animaciones e interacciones son finales. Recréalo al píxel.

---

## Design Tokens

### Colores
| Token | Hex | Uso |
|---|---|---|
| `navy-900` | `#02041a` | fondo más profundo de pantallas, ranuras |
| `navy-800` | `#060a33` | fondo de pantalla |
| `navy-700` | `#0a0f5c` | texto/íconos sobre amarillo, marca |
| `navy-600` | `#0e1566` | brillo superior de pantalla |
| `blue` | `#2b3bff` | azul eléctrico (acento 2) |
| `blue-btn-top` | `#3d49c9` | botón azul (degradado) |
| `blue-btn-mid` | `#1f2690` | |
| `blue-btn-bot` | `#161c74` | |
| `led-off` | `#2a3190` | LED / puntos apagados |
| `yellow` | `#f4ff3a` | acento principal (logo, play, progreso, activos) |
| `yellow-hi` | `#fdffc4` | brillo del botón amarillo |
| `yellow-lo` | `#c3cf00` | sombra del botón amarillo |
| `text-hi` | `#eef0ff` | texto principal sobre pantallas |
| `text-mid` | `#aab0e8` | texto secundario |
| `text-lo` | `#8f96d6` | etiquetas, metadatos |
| `metal-hi/mid/lo` | `#ffffff / #e4e6f4 / #a9aeca / #7d82a6` | perillas metálicas (radial) |
| `screw` | `#e0e1e6 → #6a6c72` | tornillos |

### Tipografías (Google Fonts)
- **Unbounded 900** — sólo logotipo.
- **Space Grotesk 500/700** — UI (títulos de canción, opciones, botones de texto).
- **JetBrains Mono 500/700** — etiquetas en mayúsculas, tiempos, datos técnicos. Etiquetas: 9–11px, `letter-spacing .12em–.3em`.

Escala usada: 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 24 (logo cabecera), 30, 36 (logo pantalla), 38 (título canción en consola) px.

### Radios
Pantalla consola 22px · carcasa consola 32px · panel EQ 24px / interior 16px · píldoras 7–14px · botones de texto 10–14px · tarjetas inicio 12–16px · icono app 22.5% del lado.

### Sombras / materiales (reutilizar exactos)
- **Pantalla hundida**: `box-shadow: 0 0 0 5px <bezel>, 0 0 0 6px rgba(255,255,255,.14), inset 0 10px 30px rgba(0,0,0,.75), inset 0 0 0 1px rgba(0,0,0,.6)`; fondo `radial-gradient(120% 120% at 50% 35%, #0e1566 0%, #060a33 55%, #02041a 100%)`.
- **Cristal** (overlay de pantallas): `linear-gradient(155deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,.03) 30%, transparent 42%), repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px)`.
- **Carcasa** (bisel): `inset 0 2px 0 rgba(255,255,255,.22), inset 0 -3px 0 rgba(0,0,0,.35), inset 0 -18px 30px rgba(0,0,0,.25)`; sombra exterior `drop-shadow(0 30px 40px rgba(0,0,0,.3))`.
- **Botón azul**: `linear-gradient(180deg,#3d49c9 0%,#1f2690 55%,#161c74 100%)` + `inset 0 1px 0 rgba(255,255,255,.4), inset 0 -2px 3px rgba(0,0,0,.35), 0 0 0 3px #0a0e45, 0 4px 8px rgba(0,0,0,.45)`. Hover: `filter: brightness(1.25)`.
- **Botón amarillo (play)**: `radial-gradient(circle at 38% 28%, #fdffc4 0%, #f4ff3a 38%, #c3cf00 100%)` + `inset 0 2px 0 rgba(255,255,255,.6), inset 0 -4px 6px rgba(80,80,0,.35), 0 0 0 4px #0a0e45, 0 0 22px rgba(244,255,58,.35), 0 8px 16px rgba(0,0,0,.45)`.
- **Perilla metálica**: `radial-gradient(circle at 38% 30%, #fff 0%, #e4e6f4 30%, #a9aeca 75%, #7d82a6 100%)` + `inset 0 2px 1px rgba(255,255,255,.9), inset 0 -3px 5px rgba(0,0,0,.3), 0 0 0 3px #0a0e45, 0 0 0 4px rgba(255,255,255,.12), 0 8px 16px rgba(0,0,0,.5)`. Indicador: barra navy 4px.
- **LED encendido**: `linear-gradient(180deg,#fdffb0,#f4ff3a 50%,#c3cf00)` + glow `0 0 12px rgba(244,255,58,.7)`. Apagado: `linear-gradient(180deg,#0a0e45,#1c237f)` + `inset 0 2px 3px rgba(0,0,0,.6)`.

### Skins (carcasa) — **por defecto: Aluminio claro**
Cada skin define `body` (background), `label` (color de rótulos sobre la carcasa) y `logo` (color del logo de cabecera). Valores exactos en `SKINS` del prototipo:
| key | nombre | label | logo |
|---|---|---|---|
| `hielo` ★ | Aluminio claro | `#1b1f4a` | `#1b1f4a` |
| `metal` | Metal cepillado | `#e2e3e8` | `#f4ff3a` |
| `grafito` | Grafito mate | `#b9bbc4` | `#f4ff3a` |
| `azul` | Azul anodizado | `#dfe2ff` | `#f4ff3a` |
| `humo` | Plástico humo | `#e6e8ff` | `#f4ff3a` |
| `amarillo` | Amarillo señal | `#0a0f5c` | `#0a0f5c` |

Pantallas y botones NO cambian con la skin.

---

## Marca
- **Logotipo**: "soniqus" en Unbounded 900, `letter-spacing -.04em`, amarillo `#f4ff3a`. La "o" es un **anillo**: caja `.74em × .61em`, borde `.1em`, con punto central `.26em` relleno; `margin 0 .025em`, `translateY(.018em)`; alineado a la línea base. Ver `Soniqus Logo.dc.html` (opción **3g** = elegida; en la app se usa sin las ondas).
- **Icono de app**: opción **5a** en `Soniqus App Icon.dc.html` — squircle (radio 22.5%) con fondo `radial-gradient(120% 100% at 30% 0%, #1b2390, #0a0f5c 60%, #060a33)`, anillo amarillo de diámetro 56% del lado, borde 8.5%, punto central 17%. Exportar a 1024/512/256/128/64/32/16 px (.icns / .ico / .png).
- Logo de **nuvola** (https://nuvola.cat/assets/img/nuvola-logo.png): en el Panel de control, bajo "Acerca de", enlazando a https://nuvola.cat. Descargarlo y empaquetarlo localmente.

---

## Screens / Views

### A. Modo compacto (340 × 680 px, ventana sin marco con forma)
Silueta = dos círculos de 300px (x=20, y=0 y y=340) unidos por una píldora 340×168 (y=236, radio 56). Material = skin.
- **Pantalla superior** (252px, x=44 y=24): visualizador (ver *Visualizaciones*). En modo "Ondas" muestra el logo (36px) centrado. Etiqueta del modo actual abajo (JetBrains Mono 9px, punto amarillo con glow).
- **Pantalla inferior** (252px, x=44 y=364): anillo de 64 puntos (6px, radio 112) = progreso de pista; clic en un punto = buscar. Dentro: `TRACK 03 / 08` (mono 11px), título (19px/700, máx 150px, `text-wrap:balance`), artista (13px), tiempo transcurrido (mono 700 30px amarillo), restante (mono 11px).
- **Píldoras izquierda** (x=16, y=274; columna gap 8): LED 30×12 + etiqueta mono 10px: **ABRIR**, **NAVEGAR**, **REPETIR**, **ALEATORIO**.
- **Volumen** (derecha, x=244 y=278): anillo moleteado + perilla metálica 56px; 11 puntos en arco (-135°…+135°) que se encienden. Arrastre vertical cambia valor. Etiqueta "VOLUMEN".
- **Centro (x=110 y=291, 120×48)**: botón **"detalles canción"** (ver componente).
- **Transporte abajo**: anterior (44px, x=12 y=531), play/pausa (56px amarillo, x=63 y=589), siguiente (44px, x=148 y=618).
- Tornillos decorativos 12px.

### B. Navigation console (780px ancho)
Carcasa radio 32, padding `20px 24px 22px`, 4 tornillos en esquinas.
1. **Cabecera**: logo 24px (color `skin.logo`) · a la derecha "NAVIGATION CONSOLE" (mono 11px, `.3em`) + 4 botones de ventana 24px: **Atrás** (atenuado 45% si no hay historial), **Inicio**, **Minimizar**, **Cerrar**.
2. **Cuerpo**: pantalla (flex 1, alto 340, radio 22) + columna derecha 120px: anterior/siguiente (42px), play/pausa (64px), stop (42px), y **rueda de navegación** (144px carcasa + 120px metal partido en ▲/▼, hover amarillo 55%) solapando la pantalla (`margin-left:-58px`, z-index sobre la pantalla).
3. **Fila inferior**: 4 píldoras (LED 38×14): ABRIR · LISTA · REPETIR · ALEATORIO · [hueco central: botón "detalles canción"] · VOLUMEN + 11 barras (4px, altura 6+2i) + perilla 44px.
4. **Panel "AUDIO ENHANCEMENT CONTROL"** (debajo, separado 10px): cabecera clicable con chevron que rota (45° ↔ 225°). Contenido: 20 bandas (pista 130px, valor −12…+12 dB, barra de relleno amarilla con glow desde el centro, cursor metálico 18×8) + perillas **AMPLI**, **BAL**, **TONO** (36px) + botón **PLANO**.

#### Vistas de la pantalla principal (consola)
- **viz**: visualizador + overlay: `TRACK nn / nn`, título 38px/700, artista 16px, barra de 60 segmentos (8px, clic = buscar), tiempo (transcurrido o restante según ajuste) / duración.
- **home — Panel de control**: rejilla `1fr 150px`. Izquierda: logo 30px + "PANEL DE CONTROL"; tres entradas grandes (icono 38px con borde amarillo + título 20px + subtítulo 12px): **Modo visual** ("Visuales e info de la canción"), **Editor de lista** ("Crear y editar listas"), **Añadir música** ("mp3 desde tu equipo"); abajo dos secundarias (icono 30px): **Controles de audio** (abre EQ), **Ajustes**. Derecha (borde izq.): "ENLACES" (Inicio soniqus, Música, Noticias) y "MI SONIQUS" (Aspectos, Complementos, Ayuda, Acerca de) + logo nuvola al fondo.
- **list — Lista**: barra superior "LISTA" + "8 canciones · 37:15" + botones Añadir / Subir / Bajar / Borrar. Filas: asa ≡ · nº · título — artista · punto (suena ahora) · duración · ✕. Seleccionada = fondo amarillo + texto navy. Al final: zona discontinua "AÑADIR MP3 · O ARRÁSTRALOS AQUÍ".
- **settings — Ajustes**: columna de pestañas (118px): **Sistema, Lista, Audio, Menú, Archivos, Visuales, Internet, Aspecto**; a la derecha filas `etiqueta (13px/700) + sub (11px)` con control: interruptor (38×20), segmentado (píldoras mono 10px) o slider (degradado azul→amarillo). Contenido exacto por pestaña en `settingsRows()` del prototipo.
- **info — Etiquetas ID3**: izquierda carátula 120×120 (placeholder a rayas "SIN CARÁTULA") + datos técnicos (MPEG1 / Capa 3 / Estéreo / 44100 Hz / 320 kb/s). Derecha: "ETIQUETAS ID3" + estado; rejilla de campos (Título, Pista, Artista, Año, Álbum, Género, Comentario); botones **BUSCAR EN INTERNET** (amarillo), GUARDAR, DESCARGAR MP3, DESHACER.

#### Ventana minimizada
Barra píldora (radio 40): logo 20px · mini-pantalla con tiempo + "título — artista" · anterior/play/siguiente · restaurar / cerrar.
#### Ventana cerrada
Icono de app 72px + "SONIQUS ESTÁ CERRADO" + botón amarillo "ABRIR SONIQUS".

### Componente: botón "detalles canción"
Píldora (radio 24, padding `5px 16px 5px 5px`, fondo `rgba(10,15,92,.85)`, texto amarillo) con círculo 34px navy (anillo interior amarillo 2px + glow) que contiene una "i" (punto 5px + barra 5×12) y texto en dos líneas "detalles / canción" (Space Grotesk 700 14px; 12px en modo compacto).
- **Visible sólo mientras se reproduce.** Entrada `sqI-in` (escala .6→1.06→1, blur 4px→0, opacidad) .5s `cubic-bezier(.16,1,.3,1)`; salida `sqI-out` .38s `cubic-bezier(.45,0,.75,.3)` y luego se desmonta. **Sin desplazamiento** (no debe salirse del marco).
- **Hover**: fondo amarillo, texto navy, `translateY(-1px)`, sombra `0 6px 16px rgba(0,0,0,.35), 0 0 18px rgba(244,255,58,.45)`; transición .18s.
- **Clic**: abre la vista **info** en la consola.

---

## Interactions & Behavior

### Reproducción
- Play/pausa, stop (vuelve a 0), anterior (si t>3s reinicia pista, si no pista anterior), siguiente (respeta aleatorio).
- Repetir = repetir pista. Aleatorio = salto aleatorio ≠ actual.
- Volumen 0–1 (arrastre vertical, sensibilidad .006/px). Ganancia real.
- **ABRIR**: selector de ficheros (audio/*, múltiple). Añade a la lista; si "Reproducir al añadir" está activo, empieza a sonar.
- Arrastrar ficheros a la lista los añade.

### Rueda de navegación ▲/▼
- En vista **lista**: mueve la selección.
- En el resto: **cambia el efecto visual** (anterior/siguiente) en ambas pantallas. **El clic dentro de la pantalla NO hace nada.**

### Lista
Selección por clic, doble clic = reproducir. Reordenar por drag & drop (indicador: línea amarilla 3px arriba/abajo de la fila destino) o Subir/Bajar. Borrar por ✕ / botón / Supr (mínimo 1 pista). Teclado: ↑/↓ seleccionar, Alt+↑/↓ mover, Supr borrar, Enter reproducir. Si se borra la pista actual, pasa a la siguiente.

### ID3
- Leer ID3v2.3/2.4 (TIT2, TPE1, TALB, TYER/TDRC, TCON, TRCK, COMM, APIC→carátula) y fallback ID3v1. Leer cabecera MPEG para datos técnicos. Implementación de referencia: `readID3`, `readID3v1`, `mp3Tech` en el prototipo.
- Editar campos → "Cambios sin guardar". **Guardar** aplica a la lista (en la app real: **escribir en el fichero**). **Deshacer** restaura. **Descargar mp3**: en la app real sustituir por "Guardar en archivo" (escritor de referencia `writeID3`, ID3v2.4 UTF-8).
- **Buscar en internet**: MusicBrainz `GET https://musicbrainz.org/ws/2/recording/?fmt=json&limit=5&query=recording:"<título>" AND artist:"<artista>"` → rellena título, artista, álbum, año (4 primeros caracteres de la fecha), pista, género (primer tag). Carátula: `https://coverartarchive.org/release/<release-id>/front-250`. Respetar rate-limit de MusicBrainz (1 req/s) y enviar `User-Agent`.

### Visualizaciones (canvas, 60fps, Web Audio `AnalyserNode` fftSize 1024, splitter L/R)
Espectro agrupado en **32 bandas logarítmicas**, suavizado (subida instantánea, caída ×0.88). Historial de 24 frames (push cada 2 frames). Detección de "kick" (graves > .62 y subiendo) con decaimiento ×0.9. Modos (cíclicos):
1. **Ondas** — anillos concéntricos que se expanden (CSS `sqRipple`) + logo. Variante "barras".
2. **Vúmetro 3D** — paisaje de frecuencias (24 filas) en perspectiva sobre rejilla que avanza; barras frontales con degradado azul→amarillo, reflejo, tapas de pico (caída .012/frame), chispas en picos >.8, onda expansiva en el suelo con cada kick, resplandor de horizonte que late con graves, estrellas, cámara con giro suave, scanlines y viñeta. Horizonte al 20% del alto.
3. **Halo** — dos formas de onda (L azul `rgba(110,130,255)`, R amarilla) con 3 pasadas (glow), composición `lighter` y estela (`destination-out`).
4. **Vuelo** — túnel: suelo amarillo y techo azul = espectro reflejado que viene hacia la cámara; líneas de *warp*; marcos amarillos que se atraviesan en cada kick; balanceo y roll de cámara.
Ajustes que afectan: Desenfocar (blur 1.2px), Humo (estela larga), Zoom (giro de cámara on/off), Nivel de efectos (intensidad de glow/flash), Velocidad del zoom. Algoritmos completos: `data()`, `draw3d()`, `drawHalo()`, `drawFly()` del prototipo.

### Transiciones entre pantallas (consola)
Elegibles en Ajustes → Menú (por defecto **Iris**): Iris (`clip-path: circle(0→80%)`), Barrido CRT, Vórtice, Glitch, Volteo 3D, Deslizar, Ninguna. Keyframes `sqT-*` en el prototipo.
- **Entrada y salida**: al navegar, la vista actual reproduce la salida (`sqTx-*`, ~60% de la duración, ease-in) y después se monta la nueva con entrada (ease-out `cubic-bezier(.16,1,.3,1)`). Duración base `0.3s + (1 − velocidadMenú) × 0.7s` (glitch 0.45s base).
- **Entrada por bloques** (activable): cada vista anima sus bloques escalonados (`sqB-l/r/u/d`: 48px/48px/36px/−24px + fade, .55s, retardo base .12s + i×.07s, todo × factor de velocidad). Salida inversa (`sqBx-*`, .32s). Mapa por vista:
  - Inicio: logo ← izq.; Modo visual / Editor / Añadir → der. (escalonados); Enlaces, Mi soniqus → der.; Controles+Ajustes y logo nuvola ↑ abajo.
  - Ajustes: pestañas ← izq.; filas → der. Al cambiar de pestaña sólo salen/entran las filas.
  - Lista: cabecera ↓ arriba; filas → der.; zona añadir ↑.
  - Visual: título ← izq.; progreso ↑.
  - Info: carátula ← izq.; cabecera ↓; campos → der.; botones ↑.
- **Todo se recorta dentro del marco de la pantalla** (`overflow:hidden`). Nada debe aparecer desde fuera de la carcasa.
- **Panel EQ**: abrir/cerrar con `grid-template-rows 0fr↔1fr` (.6s abrir / .45s cerrar) + opacidad; al abrir las 20 bandas suben escalonadas (.08s + i×.022s) y las perillas entran por la derecha (.30/.36/.42s).

### Ventana
Atrás = historial de vistas (máx 20). Inicio = Panel de control. Minimizar = barra mini. Cerrar = pausa + ventana cerrada. En la app real: ventanas sin marco, arrastrables por la carcasa, "Siempre encima", "Bloquear ventana", "Recordar posición", "Ventana translúcida" deben ser funcionales.

---

## State Management
```
playback: { playing, trackIndex, time, volume, repeat, shuffle }
playlist: Track[]  // { title, artist, duration, url|path, tags{title,artist,album,year,genre,track,comment,cover}, tech[] }
ui: { view: 'viz'|'home'|'list'|'settings'|'info', navHistory[], selectedIndex, window: 'full'|'min'|'closed',
      modeConsole: 0..3, modeCompact: 0..3, settingsTab, exiting, eqOpen }
audio: { eq[20] (−12..12 dB), preset, amp, balance (−1..1), pitch (−1..1) }
prefs: { skin='hielo', transition='iris', blocks=true, menuSmooth=.8, menuSpeed=.6, showRemaining,
         autoplayOnAdd, append, showFileName, saveInfo, clearOnLoad, output, dsp, masterVolume,
         blur, smoke, zoom, fxLevel=.6, zoomSpeed=.5, onTop, startup, rememberPos, lockWindow,
         translucent, language='Español', formats[], covers, songInfo, stream, updates }
```
Persistir `prefs`, `playlist` y `audio` entre sesiones. El EQ debe aplicarse con 20 `BiquadFilterNode` (peaking) en la cadena de audio; AMPLI = ganancia de preamp, BAL = `StereoPannerNode`, TONO = `playbackRate`/pitch-shift.

## Assets
- Fuentes: Google Fonts (Unbounded, Space Grotesk, JetBrains Mono) → empaquetar localmente.
- Logo nuvola: https://nuvola.cat/assets/img/nuvola-logo.png (descargar).
- Todo lo demás (logo, icono, botones, íconos) está construido con CSS/formas simples — recrear como SVG/CSS.
- Pistas de demostración del prototipo son ficticias; en la app la lista empieza vacía.

## Files
- `Soniqus Player.dc.html` — prototipo completo y funcional (ambos modos, todas las vistas, visualizadores, ID3, transiciones). **Referencia principal.** La sección superior "Ronda 4 · Aspectos" es sólo un selector de skins para la revisión de diseño — no forma parte de la app.
- `Soniqus App Icon.dc.html` — opciones de icono; **5a = elegido**.
- `Soniqus Logo.dc.html` — exploraciones de logo; **3g = elegido** (la "o" anillo; cuidado: en ese archivo aún aparecen variantes descartadas).
- `support.js` — runtime necesario para abrir los `.dc.html` en el navegador. No forma parte de la app.
