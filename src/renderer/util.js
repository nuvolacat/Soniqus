// Utilidades compartidas: estilos en texto CSS → objeto de React, y traducción.
const cache = new Map();
export function S(css) {
  let o = cache.get(css);
  if (o) return o;
  o = {};
  for (const d of css.split(';')) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const k = d.slice(0, i).trim();
    if (k) o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = d.slice(i + 1).trim();
  }
  if (cache.size > 8000) cache.clear();
  cache.set(css, o);
  return o;
}

// [castellano, català, english]
const STR = [
  ['VOLUMEN', 'VOLUM', 'VOLUME'], ['detalles', 'detalls', 'song'], ['canción', 'cançó', 'details'],
  ['Info del archivo (ID3)', 'Info del fitxer (ID3)', 'File info (ID3)'],
  ['Restaurar', 'Restaura', 'Restore'], ['Cerrar', 'Tanca', 'Close'], ['Atrás', 'Enrere', 'Back'], ['Inicio', 'Inici', 'Home'],
  ['Minimizar', 'Minimitza', 'Minimize'], ['Modo compacto', 'Mode compacte', 'Compact mode'],
  ['PANEL DE CONTROL', 'TAULER DE CONTROL', 'CONTROL PANEL'],
  ['Modo visual', 'Mode visual', 'Visual mode'], ['Visuales e info de la canción', 'Visuals i info de la cançó', 'Visuals and song info'],
  ['Editor de lista', 'Editor de llista', 'Playlist editor'], ['Crear y editar listas', 'Crea i edita llistes', 'Create and edit playlists'],
  ['Añadir música', 'Afegeix música', 'Add music'], ['mp3 desde tu equipo', 'mp3 des del teu equip', 'mp3 from your computer'],
  ['Controles', 'Controls', 'Audio'], ['de audio', "d'àudio", 'controls'], ['Ajustes', 'Ajustos', 'Settings'],
  ['ENLACES', 'ENLLAÇOS', 'LINKS'], ['Inicio soniqus', 'Inici soniqus', 'soniqus home'], ['Música', 'Música', 'Music'], ['Noticias', 'Notícies', 'News'],
  ['MI SONIQUS', 'EL MEU SONIQUS', 'MY SONIQUS'], ['Aspectos', 'Aspectes', 'Skins'], ['Complementos', 'Complements', 'Plug-ins'],
  ['Ayuda', 'Ajuda', 'Help'], ['Acerca de', 'Quant a', 'About'], ['OPCIONES', 'OPCIONS', 'OPTIONS'],
  ['SIN', 'SENSE', 'NO'], ['CARÁTULA', 'CARÀTULA', 'COVER'], ['ETIQUETAS ID3', 'ETIQUETES ID3', 'ID3 TAGS'],
  ['TÍTULO', 'TÍTOL', 'TITLE'], ['PISTA', 'PISTA', 'TRACK'], ['ARTISTA', 'ARTISTA', 'ARTIST'], ['AÑO', 'ANY', 'YEAR'],
  ['ÁLBUM', 'ÀLBUM', 'ALBUM'], ['GÉNERO', 'GÈNERE', 'GENRE'], ['COMENTARIO', 'COMENTARI', 'COMMENT'],
  ['BUSCAR EN INTERNET', 'CERCA A INTERNET', 'SEARCH ONLINE'], ['GUARDAR', 'DESA', 'SAVE'], ['GUARDAR COMO…', 'ANOMENA I DESA…', 'SAVE AS…'],
  ['DESHACER', 'DESFÉS', 'REVERT'], ['LISTA', 'LLISTA', 'PLAYLIST'], ['AÑADIR', 'AFEGEIX', 'ADD'], ['SUBIR', 'PUJA', 'UP'], ['BAJAR', 'BAIXA', 'DOWN'],
  ['BORRAR', 'ESBORRA', 'DELETE'], ['Añadir', 'Afegeix', 'Add'], ['Subir', 'Puja', 'Move up'], ['Bajar', 'Baixa', 'Move down'], ['Borrar', 'Esborra', 'Delete'],
  ['AÑADIR MP3 · O ARRÁSTRALOS AQUÍ', 'AFEGEIX MP3 · O ARROSSEGA’LS AQUÍ', 'ADD MP3 · OR DROP THEM HERE'], ['PLANO', 'PLA', 'FLAT'],
  ['ABRIR', 'OBRE', 'OPEN'], ['NAVEGAR', 'NAVEGA', 'NAVIGATE'], ['REPETIR', 'REPETEIX', 'REPEAT'], ['ALEATORIO', 'ALEATORI', 'SHUFFLE'],
  ['ONDAS', 'ONES', 'RIPPLES'], ['VÚMETRO 3D', 'VÚMETRE 3D', '3D VU METER'], ['HALO', 'HALO', 'HALO'], ['VUELO', 'VOL', 'FLIGHT'],
  ['AMPLI', 'AMPLI', 'AMP'], ['BAL', 'BAL', 'BAL'], ['TONO', 'TO', 'PITCH'],
  ['Sistema', 'Sistema', 'System'], ['Lista', 'Llista', 'Playlist'], ['Audio', 'Àudio', 'Audio'], ['Menú', 'Menú', 'Menu'], ['Archivos', 'Fitxers', 'Files'],
  ['Visuales', 'Visuals', 'Visuals'], ['Internet', 'Internet', 'Internet'], ['Aspecto', 'Aspecte', 'Skin'],
  ['OPCIONES DE SISTEMA', 'OPCIONS DE SISTEMA', 'SYSTEM OPTIONS'],
  ['Siempre encima', 'Sempre a sobre', 'Always on top'], ['Sobre otras ventanas', "Sobre d'altres finestres", 'Above other windows'],
  ['Abrir al iniciar', 'Obre en iniciar', 'Open at login'], ['Arranca con el sistema', 'Arrenca amb el sistema', 'Starts with the system'],
  ['Recordar posición', 'Recorda la posició', 'Remember position'], ['Al volver a abrir', 'En tornar a obrir', 'When reopening'],
  ['Bloquear ventana', 'Bloqueja la finestra', 'Lock window'], ['Evita moverla sin querer', 'Evita moure-la sense voler', 'Avoid moving it by accident'],
  ['Ventana translúcida', 'Finestra translúcida', 'Translucent window'], ['Deja ver el escritorio', "Deixa veure l'escriptori", 'Shows the desktop through'],
  ['IDIOMA', 'IDIOMA', 'LANGUAGE'], ['Idioma', 'Idioma', 'Language'], ['Interfaz', 'Interfície', 'Interface'],
  ['OPCIONES DE LISTA', 'OPCIONS DE LLISTA', 'PLAYLIST OPTIONS'],
  ['Añadir a la lista', 'Afegeix a la llista', 'Add to playlist'], ['No reemplazar al abrir', 'No substitueixis en obrir', 'Do not replace on open'],
  ['Reproducir al añadir', 'Reprodueix en afegir', 'Play on add'], ['Empieza a sonar al cargar', 'Comença a sonar en carregar', 'Starts playing on load'],
  ['Vaciar al cargar carpeta', 'Buida en carregar carpeta', 'Clear on folder load'], ['Empieza una lista nueva', 'Comença una llista nova', 'Starts a new playlist'],
  ['Ver nombre del archivo', 'Mostra el nom del fitxer', 'Show file name'], ['En vez del título', 'En lloc del títol', 'Instead of the title'],
  ['Guardar info en lista', 'Desa la info a la llista', 'Save info in playlist'], ['Duración y etiquetas', 'Durada i etiquetes', 'Duration and tags'],
  ['ORDEN', 'ORDRE', 'ORDER'], ['Repetir', 'Repeteix', 'Repeat'], ['La canción actual', 'La cançó actual', 'The current song'],
  ['Aleatorio', 'Aleatori', 'Shuffle'], ['Al avanzar', 'En avançar', 'When advancing'],
  ['SALIDA', 'SORTIDA', 'OUTPUT'], ['Dispositivo', 'Dispositiu', 'Device'], ['Dónde suena', 'On sona', 'Where it plays'],
  ['Salida del sistema', 'Sortida del sistema', 'System output'], ['Grabar a WAV', 'Enregistra a WAV', 'Record to WAV'],
  ['Procesador', 'Processador', 'Processor'], ['Procesado extra', 'Processament extra', 'Extra processing'],
  ['Ninguno', 'Cap', 'None'], ['Reverberación', 'Reverberació', 'Reverb'], ['Fundido', 'Fosa', 'Fade'],
  ['Volumen con el master', 'Volum amb el màster', 'Volume uses master'], ['Usa el del sistema', 'Fa servir el del sistema', 'Uses the system volume'],
  ['Volumen', 'Volum', 'Volume'], ['Nivel de salida', 'Nivell de sortida', 'Output level'],
  ['ECUALIZADOR', 'EQUALITZADOR', 'EQUALIZER'], ['Panel de audio', "Tauler d'àudio", 'Audio panel'], ['Mostrar el ecualizador', "Mostra l'equalitzador", 'Show the equalizer'],
  ['Preset', 'Preset', 'Preset'], ['20 bandas', '20 bandes', '20 bands'], ['GRAVES', 'GREUS', 'BASS'], ['VOZ', 'VEU', 'VOICE'], ['BRILLO', 'BRILLANTOR', 'TREBLE'], ['PERSONAL', 'PERSONAL', 'CUSTOM'],
  ['Balance y tono', 'Balanç i to', 'Balance and pitch'], ['Volver al centro', 'Torna al centre', 'Back to centre'], ['RESTABLECER', 'RESTABLEIX', 'RESET'],
  ['TRANSICIÓN ENTRE PANTALLAS', 'TRANSICIÓ ENTRE PANTALLES', 'SCREEN TRANSITION'],
  ['Entrada por bloques', 'Entrada per blocs', 'Staggered blocks'], ['Los elementos llegan escalonados', 'Els elements arriben esglaonats', 'Elements arrive one by one'],
  ['Estilo', 'Estil', 'Style'], ['Toca para previsualizar', 'Toca per previsualitzar', 'Tap to preview'],
  ['IRIS', 'IRIS', 'IRIS'], ['BARRIDO CRT', 'ESCOMBRAT CRT', 'CRT SWEEP'], ['VÓRTICE', 'VÒRTEX', 'VORTEX'], ['GLITCH', 'GLITCH', 'GLITCH'],
  ['VOLTEO 3D', 'GIR 3D', '3D FLIP'], ['DESLIZAR', 'LLISCA', 'SLIDE'], ['NINGUNA', 'CAP', 'NONE'],
  ['ANIMACIÓN DE MENÚS', 'ANIMACIÓ DE MENÚS', 'MENU ANIMATION'], ['Suavidad', 'Suavitat', 'Smoothness'], ['Fluidez del despliegue', 'Fluïdesa del desplegament', 'How smooth it unfolds'],
  ['Velocidad', 'Velocitat', 'Speed'], ['Duración del despliegue', 'Durada del desplegament', 'How long it takes'], ['LENTO', 'LENT', 'SLOW'], ['RÁPIDO', 'RÀPID', 'FAST'],
  ['PANTALLA', 'PANTALLA', 'DISPLAY'], ['Contador', 'Comptador', 'Counter'], ['Qué muestra', 'Què mostra', 'What it shows'],
  ['TRANSCURRIDO', 'TRANSCORREGUT', 'ELAPSED'], ['RESTANTE', 'RESTANT', 'REMAINING'],
  ['Pantalla completa', 'Pantalla completa', 'Drawing'], ['Modo de dibujo', 'Mode de dibuix', 'Drawing mode'], ['Acelerada', 'Accelerada', 'Accelerated'], ['Compatible', 'Compatible', 'Compatible'],
  ['FORMATOS ASOCIADOS', 'FORMATS ASSOCIATS', 'ASSOCIATED FORMATS'], ['Se abren con soniqus', "S'obren amb soniqus", 'Open with soniqus'], ['Listas', 'Llistes', 'Playlists'],
  ['EFECTOS VISUALES', 'EFECTES VISUALS', 'VISUAL EFFECTS'], ['Pantalla principal', 'Pantalla principal', 'Main screen'], ['Consola de navegación', 'Consola de navegació', 'Navigation console'],
  ['Pantalla compacta', 'Pantalla compacta', 'Compact screen'], ['Círculo superior', 'Cercle superior', 'Upper circle'],
  ['Estilo de ondas', "Estil d'ones", 'Ripple style'], ['Anillos o barras', 'Anells o barres', 'Rings or bars'], ['ANILLOS', 'ANELLS', 'RINGS'], ['BARRAS', 'BARRES', 'BARS'],
  ['Desenfocar', 'Desenfoca', 'Blur'], ['Suaviza los visuales', 'Suavitza els visuals', 'Softens the visuals'], ['Humo', 'Fum', 'Smoke'], ['Estela larga en Halo', 'Estela llarga a Halo', 'Long trail in Halo'],
  ['Zoom', 'Zoom', 'Zoom'], ['Giro del vúmetro 3D', 'Gir del vúmetre 3D', '3D VU meter spin'], ['Nivel de efectos', "Nivell d'efectes", 'Effects level'],
  ['Intensidad del brillo', 'Intensitat de la brillantor', 'Glow intensity'], ['BAJO', 'BAIX', 'LOW'], ['ALTO', 'ALT', 'HIGH'],
  ['Velocidad del zoom', 'Velocitat del zoom', 'Zoom speed'], ['Giro del vúmetro', 'Gir del vúmetre', 'VU meter spin'],
  ['CONEXIÓN', 'CONNEXIÓ', 'CONNECTION'], ['Buscar carátulas', 'Cerca caràtules', 'Fetch covers'], ['Descarga portadas', 'Baixa portades', 'Downloads cover art'],
  ['Info de canciones', 'Info de cançons', 'Song info'], ['Artista, álbum y año', 'Artista, àlbum i any', 'Artist, album and year'],
  ['Radio por internet', 'Ràdio per internet', 'Internet radio'], ['Permitir streams', 'Permet streams', 'Allow streams'],
  ['Buscar actualizaciones', 'Cerca actualitzacions', 'Check for updates'], ['Al iniciar', 'En iniciar', 'At startup'],
  ['ASPECTO', 'ASPECTE', 'SKIN'], ['Acabado', 'Acabat', 'Finish'], ['Carcasa del reproductor', 'Carcassa del reproductor', 'Player body'],
  ['Aluminio claro', 'Alumini clar', 'Light aluminium'], ['Metal cepillado', 'Metall raspallat', 'Brushed metal'], ['Grafito mate', 'Grafit mat', 'Matte graphite'],
  ['Azul anodizado', 'Blau anoditzat', 'Anodized blue'], ['Plástico humo', 'Plàstic fum', 'Smoke plastic'], ['Amarillo señal', 'Groc senyal', 'Signal yellow'],
  ['Sin música', 'Sense música', 'No music'], ['Pulsa ABRIR para añadir canciones', 'Prem OBRE per afegir cançons', 'Press OPEN to add songs'],
  ['Archivo local', 'Fitxer local', 'Local file'], ['Radio', 'Ràdio', 'Radio'], ['canción ·', 'cançó ·', 'song ·'], ['canciones ·', 'cançons ·', 'songs ·'],
  ['Cambios sin guardar', 'Canvis sense desar', 'Unsaved changes'], ['Guardado en la lista', 'Desat a la llista', 'Saved to the playlist'],
  ['Guardado en la lista (solo se escribe en archivos mp3)', 'Desat a la llista (només s’escriu en fitxers mp3)', 'Saved to the playlist (only mp3 files are written)'],
  ['Guardando…', 'Desant…', 'Saving…'], ['Guardado en el archivo', 'Desat al fitxer', 'Saved to the file'], ['No se pudo guardar', "No s'ha pogut desar", 'Could not save'],
  ['Copia guardada con las etiquetas', 'Còpia desada amb les etiquetes', 'Copy saved with the tags'],
  ['Cambios descartados', 'Canvis descartats', 'Changes discarded'], ['Solo para archivos mp3 de tu equipo', 'Només per a fitxers mp3 del teu equip', 'Only for mp3 files on your computer'],
  ['Buscando en MusicBrainz…', 'Cercant a MusicBrainz…', 'Searching MusicBrainz…'], ['Sin resultados', 'Sense resultats', 'No results'],
  ['Encontrado · revisa y guarda', 'Trobat · revisa i desa', 'Found · review and save'], ['No se pudo conectar', "No s'ha pogut connectar", 'Could not connect'],
  ['Activa «Info de canciones» en Ajustes · Internet', 'Activa «Info de cançons» a Ajustos · Internet', 'Enable “Song info” in Settings · Internet'],
  ['Emisión por internet', 'Emissió per internet', 'Internet stream'], ['No se puede reproducir', 'No es pot reproduir', 'Cannot be played'],
  ['Capa 1', 'Capa 1', 'Layer 1'], ['Capa 2', 'Capa 2', 'Layer 2'], ['Capa 3', 'Capa 3', 'Layer 3'], ['Mono', 'Mono', 'Mono'], ['Estéreo', 'Estèreo', 'Stereo'],
  ['ACERCA DE', 'QUANT A', 'ABOUT'], ['Versión', 'Versió', 'Version'], ['Todos los derechos reservados.', 'Tots els drets reservats.', 'All rights reserved.'],
  ['Reproductor de música de escritorio para macOS.', "Reproductor de música d'escriptori per a macOS.", 'Desktop music player for macOS.'],
  ['Soniqus es un proyecto independiente, sin relación con Sonique ni con sus propietarios. Las marcas citadas pertenecen a sus respectivos titulares.', 'Soniqus és un projecte independent, sense relació amb Sonique ni amb els seus propietaris. Les marques esmentades pertanyen als seus titulars respectius.', 'Soniqus is an independent project, not affiliated with Sonique or its owners. All trademarks belong to their respective owners.'],
  ['El programa se ofrece «tal cual», sin garantías de ningún tipo.', 'El programa s’ofereix «tal com és», sense garanties de cap mena.', 'The software is provided “as is”, without warranty of any kind.'],
  ['Incluye software libre: Electron y Chromium (MIT / BSD) y React (MIT). Tipografías Unbounded, Space Grotesk y JetBrains Mono (SIL Open Font License 1.1). Datos de MusicBrainz y Cover Art Archive.', 'Inclou programari lliure: Electron i Chromium (MIT / BSD) i React (MIT). Tipografies Unbounded, Space Grotesk i JetBrains Mono (SIL Open Font License 1.1). Dades de MusicBrainz i Cover Art Archive.', 'Includes open-source software: Electron and Chromium (MIT / BSD) and React (MIT). Typefaces Unbounded, Space Grotesk and JetBrains Mono (SIL Open Font License 1.1). Data from MusicBrainz and Cover Art Archive.'],
  ['Atajos de teclado', 'Dreceres de teclat', 'Keyboard shortcuts'], ['Doble clic: volver a 0', 'Doble clic: torna a 0', 'Double-click: back to 0'], ['I', 'E', 'L'], ['D', 'D', 'R'],
  ['DATOS', 'DADES', 'DATA'], ['Borrar caché', 'Esborra la memòria cau', 'Clear cache'], ['Ajustes, lista y datos guardados', 'Ajustos, llista i dades desades', 'Settings, playlist and saved data'], ['BORRAR TODO', 'ESBORRA-HO TOT', 'ERASE ALL'], ['¿SEGURO? PULSA OTRA VEZ', 'SEGUR? PREM UN ALTRE COP', 'SURE? PRESS AGAIN'],
  ['Código abierto, licencia MIT', 'Codi obert, llicència MIT', 'Open source, MIT license'],
  ['PERSONALIZADO', 'PERSONALITZAT', 'CUSTOM'], ['SIN GUARDAR', 'SENSE DESAR', 'UNSAVED'], ['DE FÁBRICA', 'DE FÀBRICA', 'BUILT-IN'], ['GUARDADO', 'DESAT', 'SAVED'],
  ['CANCELAR', 'CANCEL·LA', 'CANCEL'], ['¿BORRAR?', 'ESBORRAR?', 'DELETE?'], ['Nombre del preset', 'Nom del preset', 'Preset name'], ['Preset anterior', 'Preset anterior', 'Previous preset'], ['Preset siguiente', 'Preset següent', 'Next preset'],
  ['PLANO', 'PLA', 'FLAT'], ['CLÁSICA', 'CLÀSSICA', 'CLASSICAL'], ['ELECTRÓNICA', 'ELECTRÒNICA', 'ELECTRONIC'], ['ACÚSTICO', 'ACÚSTIC', 'ACOUSTIC'],
  ['＋ GUARDAR ACTUAL…', '＋ DESA L’ACTUAL…', '＋ SAVE CURRENT…'],
  ['Cambiar el efecto visual', "Canvia l'efecte visual", 'Change the visual effect'],
  ['Grabando en', 'Enregistrant a', 'Recording to'],
];
const D = new Map(STR.map(([es, ca, en]) => [es, [ca, en]]));
let lang = 'Español';
export const setLang = l => { lang = l; };
export function T(s) {
  if (lang === 'Español' || typeof s !== 'string') return s;
  const k = s.trim(), e = D.get(k);
  return e ? s.replace(k, e[lang === 'Català' ? 0 : 1]) : s;
}
