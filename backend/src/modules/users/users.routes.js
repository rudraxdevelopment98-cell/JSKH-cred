import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { query } from '../../db/pool.js';
import { ApiError } from '../../middleware/ApiError.js';

// Admin user management. Mounted at /admin/users.
const router = Router();
router.use(requireAuth, requireRole('super_admin'));

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT id, email, phone, display_name, role, status, created_at
       FROM users ORDER BY created_at DESC LIMIT 200`,
    );
    res.json({ users: rows });
  }),
);

router.post(
  '/:id/suspend',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `UPDATE users SET status = 'suspended', updated_at = now()
       WHERE id = $1 RETURNING id, status`,
      [req.params.id],
    );
    if (!rows[0]) throw ApiError.notFound('User not found');
    res.json({ user: rows[0] });
  }),
);

router.post(
  '/:id/reinstate',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `UPDATE users SET status = 'active', updated_at = now()
       WHERE id = $1 RETURNING id, status`,
      [req.params.id],
    );
    if (!rows[0]) throw ApiError.notFound('User not found');
    res.json({ user: rows[0] });
  }),
);

export default router;
