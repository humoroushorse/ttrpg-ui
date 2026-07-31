################################################################################
# Stage 1: Build the Angular application
################################################################################
FROM node:26.5-alpine AS builder
ARG BUILD_BASE_HREF=/
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx nx build sprint-management --configuration=production --baseHref="${BUILD_BASE_HREF}"

################################################################################
# Stage 2: Run Node.js SSR server
################################################################################
FROM node:26.5-alpine

# Create non-root user
RUN addgroup -g 101 -S appgroup && \
    adduser -u 101 -S appuser -G appgroup

WORKDIR /app

# Change ownership before switching user
COPY --from=builder --chown=101:101 /app/dist/apps/sprint-management ./
COPY --from=builder --chown=101:101 /app/package*.json ./

USER 101

RUN npm ci --legacy-peer-deps --omit=dev --ignore-scripts

ENV PORT=4204
ENV NODE_ENV=production

EXPOSE 4204

CMD ["node", "server/server.mjs"]
