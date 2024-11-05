################################################################################
# Stage 1: Build the Angular application
################################################################################
FROM node:18-alpine AS build

ARG BUILD_CONFIGURATION=production
ARG BUILD_BASE_HREF=/

ARG APP_TTRPG_EVENT_PLANNING__API_BASE_PATH=/ttrpg-event-planning-api

WORKDIR /app

COPY package*.json ./

# RUN npm install
# TODO: change install methodology when off of angular rc tags
RUN npm install --legacy-peer-deps

COPY . .

RUN npx nx run event-planning:build:${BUILD_CONFIGURATION} --base-href=${BUILD_BASE_HREF}

################################################################################
# Stage 2: Serve the application with Nginx
################################################################################
FROM nginx:alpine

ENV NGINX_PORT=80

WORKDIR /usr/share/nginx/html
# remove default nginx static assets
RUN rm -rf ./*
# TODO: use the following to say where the build lives?
# TODO: if so, update ~/deploy/nginx/templates/default.conf.template and ~/deploy/docker-entrypoint.sh
#   COPY --from=build /app/dist/apps/event-planning/browser ./event-planning/browser
COPY --from=build /app/dist/apps/event-planning/browser .

WORKDIR /etc/nginx
COPY --from=build /app/apps/event-planning/deploy/nginx/nginx.conf .
COPY --from=build /app/apps/event-planning/deploy/nginx/templates ./templates

WORKDIR /
COPY --from=build /app/apps/event-planning/deploy/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE ${NGINX_PORT}
ENTRYPOINT [ "/docker-entrypoint.sh" ]
