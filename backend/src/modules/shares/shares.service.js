import { query } from '../../db/pool.js';
import { ApiError } from '../../middleware/ApiError.js';
import { logActivity } from '../activity/activity.service.js';
import { getItemOrThrow } from '../items/access.js';

/** Only the owner may manage shares for an item. */
async function requireOwner(itemId, userId) {
  const item = await getItemOrThrow(itemId);
  if (item.owner_id !== userId) {
    throw ApiError.forbidden('Only the owner can manage sharing');
  }
  return item;
}

export async function shareItem(itemId, ownerId, { granteeId, permission, expiresAt }) {
  await requireOwner(itemId, ownerId);
  if (granteeId === ownerId) {
    throw ApiError.badRequest('Cannot share an item with yourself');
  }

  const grantee = await query('SELECT id FROM users WHERE id = $1', [granteeId]);
  if (!grantee.rows[0]) throw ApiError.notFound('Grantee not found', 'user_not_found');

  const { rows } = await query(
    `INSERT INTO shares (item_id, grantee_id, permission, expires_at, created_by)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (item_id, grantee_id)
       DO UPDATE SET permission = EXCLUDED.permission, expires_at = EXCLUDED.expires_at
     RETURNING *`,
    [itemId, granteeId, permission, expiresAt ?? null, ownerId],
  );

  await query(
    `INSERT INTO notifications (user_id, type, payload)
     VALUES ($1, 'document_shared', $2)`,
    [granteeId, { itemId, permission }],
  );
  await logActivity({
    userId: ownerId,
    action: 'permission_change',
    targetId: itemId,
    metadata: { op: 'share', granteeId, permission },
  });
  return rows[0];
}

export async function listShares(itemId, ownerId) {
  await requireOwner(itemId, ownerId);
  const { rows } = await query(
    `SELECT s.id, s.permission, s.expires_at, s.created_at,
            u.id AS grantee_id, u.email, u.display_name
     FROM shares s JOIN users u ON u.id = s.grantee_id
     WHERE s.item_id = $1
     ORDER BY s.created_at`,
    [itemId],
  );
  return rows;
}

export async function revokeShare(itemId, ownerId, granteeId) {
  await requireOwner(itemId, ownerId);
  const { rowCount } = await query(
    'DELETE FROM shares WHERE item_id = $1 AND grantee_id = $2',
    [itemId, granteeId],
  );
  if (!rowCount) throw ApiError.notFound('Share not found');
}
