import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import * as shares from './shares.service.js';

// Mounted at /items/:id/shares
const router = Router({ mergeParams: true });
router.use(requireAuth);

const shareSchema = z.object({
  granteeId: z.string().uuid(),
  permission: z.enum([
    'private', 'view_only', 'view_download', 'edit', 'temporary', 'emergency',
  ]),
  expiresAt: z.coerce.date().optional(),
});

router.post(
  '/',
  validate(shareSchema),
  asyncHandler(async (req, res) => {
    res
      .status(201)
      .json({ share: await shares.shareItem(req.params.id, req.user.id, req.body) });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ shares: await shares.listShares(req.params.id, req.user.id) });
  }),
);

router.delete(
  '/:granteeId',
  asyncHandler(async (req, res) => {
    await shares.revokeShare(req.params.id, req.user.id, req.params.granteeId);
    res.status(204).end();
  }),
);

export default router;
