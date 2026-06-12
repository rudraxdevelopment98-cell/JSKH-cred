import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import * as items from './items.service.js';
import shareRoutes from '../shares/shares.routes.js';

const router = Router();
router.use(requireAuth);

// Item-scoped sharing: /items/:id/shares
router.use('/:id/shares', shareRoutes);

const ITEM_TYPES = [
  'password', 'secure_note', 'passport', 'license', 'insurance',
  'medical', 'property', 'certificate', 'bank', 'tax',
];

const createSchema = z.object({
  type: z.enum(ITEM_TYPES),
  title: z.string().min(1).max(200),
  category: z.string().max(120).optional(),
  tags: z.array(z.string().max(60)).max(50).optional(),
  familyId: z.string().uuid().optional(),
  expiresAt: z.coerce.date().optional(),
  // Arbitrary JSON secret (password fields, note body, etc.) — encrypted at rest.
  secret: z.record(z.any()).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().max(120).nullable().optional(),
  tags: z.array(z.string().max(60)).max(50).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  secret: z.record(z.any()).nullable().optional(),
});

const listQuerySchema = z.object({
  type: z.enum(ITEM_TYPES).optional(),
});

router.post(
  '/',
  validate(createSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ item: await items.createItem(req.user.id, req.body) });
  }),
);

router.get(
  '/',
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    res.json({ items: await items.listItems(req.user.id, req.query) });
  }),
);

router.get(
  '/shared-with-me',
  asyncHandler(async (req, res) => {
    res.json({ items: await items.listSharedWithMe(req.user.id) });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ item: await items.getItem(req.params.id, req.user.id) });
  }),
);

router.get(
  '/:id/reveal',
  asyncHandler(async (req, res) => {
    res.json({ item: await items.revealItem(req.params.id, req.user.id) });
  }),
);

router.put(
  '/:id',
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    res.json({ item: await items.updateItem(req.params.id, req.user.id, req.body) });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await items.deleteItem(req.params.id, req.user.id);
    res.status(204).end();
  }),
);

export default router;
