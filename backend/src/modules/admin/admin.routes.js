import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { query } from '../../db/pool.js';

// Mounted at /admin. Super-admin only.
const router = Router();
router.use(requireAuth, requireRole('super_admin'));

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT
        (SELECT COUNT(*) FROM users)                              AS total_users,
        (SELECT COUNT(*) FROM users WHERE status = 'suspended')   AS suspended_users,
        (SELECT COUNT(*) FROM families)                           AS total_families,
        (SELECT COUNT(*) FROM vault_items)                        AS total_items,
        (SELECT COUNT(*) FROM shares)                             AS total_shares,
        (SELECT COUNT(*) FROM access_requests WHERE status = 'pending') AS pending_requests,
        (SELECT COUNT(*) FROM activity_logs WHERE created_at > now() - interval '24 hours') AS activity_24h
    `);
    const r = rows[0];
    res.json({
      stats: {
        totalUsers: Number(r.total_users),
        suspendedUsers: Number(r.suspended_users),
        totalFamilies: Number(r.total_families),
        totalItems: Number(r.total_items),
        totalShares: Number(r.total_shares),
        pendingRequests: Number(r.pending_requests),
        activityLast24h: Number(r.activity_24h),
      },
    });
  }),
);

export default router;
