import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { listActivity, listAllActivity } from './activity.service.js';

const router = Router();

router.get(
  '/activity',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ activity: await listActivity(req.user.id) });
  }),
);

router.get(
  '/admin/activity',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (_req, res) => {
    res.json({ activity: await listAllActivity() });
  }),
);

export default router;
