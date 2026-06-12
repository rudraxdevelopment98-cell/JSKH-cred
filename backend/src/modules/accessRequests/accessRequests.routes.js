import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import * as requests from './accessRequests.service.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  itemId: z.string().uuid(),
  isEmergency: z.boolean().optional(),
});

router.post(
  '/',
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const { itemId, isEmergency } = req.body;
    res
      .status(201)
      .json({ request: await requests.createRequest(itemId, req.user.id, { isEmergency }) });
  }),
);

router.get(
  '/incoming',
  asyncHandler(async (req, res) => {
    res.json({ requests: await requests.listIncoming(req.user.id) });
  }),
);

router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    res.json({ request: await requests.approveRequest(req.params.id, req.user.id) });
  }),
);

router.post(
  '/:id/deny',
  asyncHandler(async (req, res) => {
    res.json({ request: await requests.denyRequest(req.params.id, req.user.id) });
  }),
);

export default router;
