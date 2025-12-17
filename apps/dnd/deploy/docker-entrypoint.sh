#!/bin/sh
set -eu

envsubst '
  ${APP_TTRPG_DND__API_BASE_PATH}
  ${APP_TTRPG_DND_SPELL__API_BASE_PATH}
' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

envsubst '
  ${APP_TTRPG_DND__API_BASE_PATH}
' < /usr/share/nginx/html/assets/app.config.template.json > /usr/share/nginx/html/assets/app.config.json

exec nginx -g 'daemon off;'
