import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import * as notifications from './notifications.service.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const unreadOnly = req.query.unread === 'true';
    res.json({ notifications: await notifications.listNotifications(req.user.id, { unreadOnly }) });
  }),
);

router.post(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await notifications.markRead(req.user.id, req.params.id);
    res.status(204).end();
  }),
);

router.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    await notifications.markAllRead(req.user.id);
    res.status(204).end();
  }),
);

export default router;
