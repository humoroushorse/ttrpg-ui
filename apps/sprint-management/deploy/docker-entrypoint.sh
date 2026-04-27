#!/bin/sh
set -e

# Sub env vars in NGINX config
envsubst '${NGINX_PORT} ${APP_SPRINT_MANAGEMENT__API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# sub env vars in app.config.json
envsubst < /usr/share/nginx/html/browser/assets/app.config.template.json > /usr/share/nginx/html/browser/assets/app.config.json

echo "Environment variables substituted successfully"
echo "NGINX_PORT: ${NGINX_PORT}"
echo "APP_SPRINT_MANAGEMENT__API_BASE_PATH: ${APP_SPRINT_MANAGEMENT__API_BASE_PATH}"
echo "APP_SPRINT_MANAGEMENT__API_URL: ${APP_SPRINT_MANAGEMENT__API_URL}"

exec "$@"
