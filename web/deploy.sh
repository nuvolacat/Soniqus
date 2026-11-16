#!/bin/bash
# Publica la web (web/dist) en un servidor por rsync.
# El destino va en web/deploy.env (no se versiona):
#   DEPLOY_DEST=usuario@servidor
#   DEPLOY_DOCROOT=/ruta/al/docroot
#   DEPLOY_OWNER=usuario:grupo        (opcional)
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f web/deploy.env ] || { echo "Falta web/deploy.env (mira la cabecera de este guion)"; exit 1; }
. web/deploy.env
node web/build.mjs
rsync -rlt --delete web/dist/ "$DEPLOY_DEST:$DEPLOY_DOCROOT/"
if [ -n "${DEPLOY_OWNER:-}" ]; then
  ssh "$DEPLOY_DEST" "chown -R $DEPLOY_OWNER $DEPLOY_DOCROOT && find $DEPLOY_DOCROOT -type d -exec chmod 755 {} + && find $DEPLOY_DOCROOT -type f -exec chmod 644 {} + && chmod 750 $DEPLOY_DOCROOT"
fi
echo "Web publicada"
