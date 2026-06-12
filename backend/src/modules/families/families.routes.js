import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import * as families from './families.service.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({ name: z.string().min(1).max(120) });
const inviteSchema = z.object({ email: z.string().email() });
const roleSchema = z.object({
  role: z.enum(['family_admin', 'member']),
});

router.post(
  '/',
  validate(createSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ family: await families.createFamily(req.user.id, req.body) });
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ families: await families.listFamilies(req.user.id) });
  }),
);

router.get(
  '/:id/members',
  asyncHandler(async (req, res) => {
    res.json({ members: await families.listMembers(req.params.id, req.user.id) });
  }),
);

router.post(
  '/:id/invite',
  validate(inviteSchema),
  asyncHandler(async (req, res) => {
    res
      .status(201)
      .json({ member: await families.inviteMember(req.params.id, req.user.id, req.body) });
  }),
);

router.post(
  '/:id/members/:userId/approve',
  asyncHandler(async (req, res) => {
    res.json({
      member: await families.approveMember(req.params.id, req.user.id, req.params.userId),
    });
  }),
);

router.delete(
  '/:id/members/:userId',
  asyncHandler(async (req, res) => {
    await families.removeMember(req.params.id, req.user.id, req.params.userId);
    res.status(204).end();
  }),
);

router.put(
  '/:id/members/:userId/role',
  validate(roleSchema),
  asyncHandler(async (req, res) => {
    res.json({
      member: await families.assignRole(
        req.params.id,
        req.user.id,
        req.params.userId,
        req.body.role,
      ),
    });
  }),
);

export default router;
