import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule } from '@angular/ssr/node';
import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  // TODO: This is a security-sensitive option. Remove if not needed. For more information, see https://angular.dev/best-practices/security#configuring-trusted-proxy-headers
  trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto'],
});

// Read base href from environment variable (for Kubernetes deployment)
const BASE_HREF = process.env['BASE_HREF'] || '/';

// Read backend URLs from environment variables (Kubernetes ConfigMap)
const AUTH_API_TARGET = process.env['AUTH_API_TARGET'] || 'http://localhost:8081';
const SPRINT_API_TARGET = process.env['SPRINT_API_TARGET'] || 'http://localhost:8003';

/**
 * API proxy for SSR and client-side requests.
 * When deployed behind ingress at /ttrpg/sprint-management/, the browser sends
 * requests like /ttrpg/sprint-management/auth-api/... because app-config.service.ts
 * prepends baseHref to API paths. We need to match both the prefixed and unprefixed paths.
 */

// Build proxy path prefixes based on BASE_HREF
const authApiPath = `${BASE_HREF}auth-api`.replace(/\/+/g, '/');
const sprintApiPath = `${BASE_HREF}sprint-management-api`.replace(/\/+/g, '/');

// Build pathRewrite maps dynamically to avoid regex escaping issues
function buildAuthRewrite(): Record<string, string> {
  const rewrites: Record<string, string> = {};
  // Rewrite to realm-prefixed path: /auth-api/auth/... -> /auth/sprint-management/...
  // The realm is determined by which app is proxying
  const AUTH_REALM = process.env['AUTH_REALM'] || 'sprint-management';
  rewrites['^' + authApiPath + '/auth/'] = `/auth/${AUTH_REALM}/`;
  rewrites['^' + authApiPath] = '';
  return rewrites;
}

function buildSprintRewrite(): Record<string, string> {
  const rewrites: Record<string, string> = {};
  // e.g. key: "^/ttrpg/sprint-management/sprint-management-api", value: "/api/v1"
  rewrites['^' + sprintApiPath] = '/api/v1';
  return rewrites;
}

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Auth API proxy — matches base-href-prefixed path
console.log(`Registering auth-api proxy: ${authApiPath} -> ${AUTH_API_TARGET}`);
app.use(
  createProxyMiddleware({
    target: AUTH_API_TARGET,
    changeOrigin: true,
    pathFilter: `${authApiPath}/**`,
    pathRewrite: buildAuthRewrite(),
  }),
);

// Also match unprefixed /auth-api for direct access
const AUTH_REALM = process.env['AUTH_REALM'] || 'sprint-management';
app.use(
  createProxyMiddleware({
    target: AUTH_API_TARGET,
    changeOrigin: true,
    pathFilter: '/auth-api/**',
    pathRewrite: {
      '^/auth-api/auth/': `/auth/${AUTH_REALM}/`,
      '^/auth-api': '',
    },
  }),
);

// Sprint Management API proxy — matches base-href-prefixed path
console.log(`Registering sprint-api proxy: ${sprintApiPath} -> ${SPRINT_API_TARGET}`);
app.use(
  createProxyMiddleware({
    target: SPRINT_API_TARGET,
    changeOrigin: true,
    pathFilter: `${sprintApiPath}/**`,
    pathRewrite: buildSprintRewrite(),
  }),
);

// Also match unprefixed /sprint-management-api for direct access
app.use(
  createProxyMiddleware({
    target: SPRINT_API_TARGET,
    changeOrigin: true,
    pathFilter: '/sprint-management-api/**',
    pathRewrite: { '^/sprint-management-api': '/api/v1' },
  }),
);

/**
 * Serve static files from /browser
 */
app.use(
  BASE_HREF,
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', async (req, res, next) => {
  try {
    const response = await angularApp.handle(req, {
      extraProviders: [
        {
          provide: APP_BASE_HREF,
          useValue: BASE_HREF,
        },
      ],
    });

    if (response) {
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      res.status(response.status);
      res.send(await response.text());
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Start the server if this module is the main entry point.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4204;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log(`Base HREF: ${BASE_HREF}`);
    console.log(`Proxying ${authApiPath} -> ${AUTH_API_TARGET}`);
    console.log(`Proxying ${sprintApiPath} -> ${SPRINT_API_TARGET}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
