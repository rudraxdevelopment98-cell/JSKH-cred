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

export function createApp() {
  const app = express();

  app.use(helmet());
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
  api.use('/', activityRoutes); // /activity and /admin/activity

  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
