# Ajustes de dmgbuild para el instalador de Soniqus (propuesta 7, «Amarillo señal»).
# Uso: uvx dmgbuild -s tools/dmg-settings.py "Soniqus" release/Soniqus-1.0.0.dmg
import os
root = os.getcwd()
app = os.path.join(root, 'release/Soniqus-darwin-arm64/Soniqus.app')
format = 'UDZO'
files = [app]
symlinks = {'Applications': '/Applications'}
icon = os.path.join(root, 'build/icon.icns')
background = os.path.join(root, 'build/dmg/fondo.png')  # dmgbuild añade solo la versión @2x
window_rect = ((240, 160), (660, 448))
default_view = 'icon-view'
show_status_bar = False; show_tab_view = False; show_toolbar = False; show_pathbar = False; show_sidebar = False
icon_size = 120
text_size = 13
arrange_by = None
icon_locations = {'Soniqus.app': (180, 200), 'Applications': (480, 200)}
