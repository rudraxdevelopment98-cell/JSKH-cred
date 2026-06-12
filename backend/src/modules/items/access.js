import { query } from '../../db/pool.js';
import { ApiError } from '../../middleware/ApiError.js';

// Ordered from least to most capable. Index acts as a comparable rank.
const RANK = ['private', 'view_only', 'view_download', 'edit'];

function rankOf(permission) {
  const i = RANK.indexOf(permission);
  return i === -1 ? 0 : i;
}

/**
 * Resolve a user's effective permission on an item.
 * Returns one of: 'owner', 'view_only', 'view_download', 'edit', or null.
 *
 * - The owner always has full control.
 * - 'temporary' shares behave like 'view_download' until they expire.
 * - 'emergency' shares behave like 'view_download' (granted via an approved
 *   emergency access request).
 * - 'private' shares grant nothing.
 */
export async function effectivePermission(item, userId) {
  if (item.owner_id === userId) return 'owner';

  const { rows } = await query(
    `SELECT permission, expires_at FROM shares
     WHERE item_id = $1 AND grantee_id = $2`,
    [item.id, userId],
  );
  const share = rows[0];
  if (!share) return null;

  if (share.expires_at && new Date(share.expires_at) < new Date()) return null;

  switch (share.permission) {
    case 'private':
      return null;
    case 'temporary':
    case 'emergency':
      return 'view_download';
    default:
      return share.permission;
  }
}

export async function getItemOrThrow(itemId) {
  const { rows } = await query('SELECT * FROM vault_items WHERE id = $1', [itemId]);
  if (!rows[0]) throw ApiError.notFound('Item not found');
  return rows[0];
}

/**
 * Load an item and assert the user has at least `min` permission.
 * Returns { item, permission }.
 */
export async function authorizeItem(itemId, userId, min = 'view_only') {
  const item = await getItemOrThrow(itemId);
  const permission = await effectivePermission(item, userId);
  if (!permission) throw ApiError.notFound('Item not found'); // hide existence
  if (permission !== 'owner' && rankOf(permission) < rankOf(min)) {
    throw ApiError.forbidden('Insufficient permission on this item');
  }
  return { item, permission };
}

export function canDownload(permission) {
  return permission === 'owner' || rankOf(permission) >= rankOf('view_download');
}
