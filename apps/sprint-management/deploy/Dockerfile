# Stage 1: Build
FROM node:24.13-alpine AS builder
ARG BUILD_BASE_HREF=/
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx nx build sprint-management --configuration=production --baseHref="${BUILD_BASE_HREF}"
# Stage 2: run node server
FROM node:24.13-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/sprint-management ./
COPY --from=builder /app/package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev --ignore-scripts
ENV PORT=4204
ENV NODE_ENV=production
EXPOSE 4204
CMD ["node", "server/server.mjs"]
