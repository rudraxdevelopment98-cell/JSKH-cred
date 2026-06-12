import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import env from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import familyRoutes from './modules/families/families.routes.js';
import itemRoutes from './modules/items/items.routes.js';
import accessRequestRoutes from './modules/accessRequests/accessRequests.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import activityRoutes from './modules/activity/activity.routes.js';
import adminUserRoutes from './modules/users/users.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In production we may serve the built admin SPA from backend/public.
const publicDir = path.join(__dirname, '..', 'public');

export function createApp() {
  const app = express();

  const servesSpa = env.isProd && fs.existsSync(publicDir);
  // The SPA relies on emotion/MUI injected styles, so relax CSP when serving it.
  app.use(helmet({ contentSecurityPolicy: servesSpa ? false : undefined }));
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  if (!env.isTest) app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  const api = express.Router();
  api.use(apiLimiter);

  api.use('/auth', authRoutes);
  api.use('/families', familyRoutes);
  api.use('/items', itemRoutes);
  api.use('/access-requests', accessRequestRoutes);
  api.use('/notifications', notificationRoutes);
  api.use('/admin/users', adminUserRoutes);
  api.use('/admin', adminRoutes); // /admin/stats
  api.use('/', activityRoutes); // /activity and /admin/activity

  app.use('/api/v1', api);

  // Serve the built admin panel (single-service deploys). API/health are
  // handled above; everything else falls back to the SPA entry point.
  if (servesSpa) {
    app.use(express.static(publicDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') return next();
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
