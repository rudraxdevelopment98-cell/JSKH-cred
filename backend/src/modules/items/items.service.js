import { query } from '../../db/pool.js';
import { encryptJson, decryptJson } from '../../crypto/encryption.js';
import { ApiError } from '../../middleware/ApiError.js';
import { logActivity } from '../activity/activity.service.js';
import { authorizeItem } from './access.js';

/** Item metadata without the encrypted payload — safe for list views. */
function toMetadata(row, permission = 'owner') {
  return {
    id: row.id,
    ownerId: row.owner_id,
    familyId: row.family_id,
    type: row.type,
    title: row.title,
    category: row.category,
    tags: row.tags,
    hasSecret: row.encrypted_payload != null,
    storageKey: row.storage_key,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    permission,
  };
}

export async function createItem(ownerId, input) {
  const encrypted = input.secret != null ? encryptJson(input.secret) : null;
  const { rows } = await query(
    `INSERT INTO vault_items
       (owner_id, family_id, type, title, category, tags, encrypted_payload, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      ownerId,
      input.familyId ?? null,
      input.type,
      input.title,
      input.category ?? null,
      input.tags ?? [],
      encrypted,
      input.expiresAt ?? null,
    ],
  );
  await logActivity({ userId: ownerId, action: 'upload', targetId: rows[0].id });
  return toMetadata(rows[0]);
}

export async function listItems(ownerId, { type } = {}) {
  const params = [ownerId];
  let sql = 'SELECT * FROM vault_items WHERE owner_id = $1';
  if (type) {
    params.push(type);
    sql += ` AND type = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const { rows } = await query(sql, params);
  return rows.map((r) => toMetadata(r));
}

/** Get item metadata only (no decryption). */
export async function getItem(itemId, userId) {
  const { item, permission } = await authorizeItem(itemId, userId, 'view_only');
  if (permission !== 'owner') {
    await logActivity({ userId, action: 'document_view', targetId: item.id });
  }
  return toMetadata(item, permission);
}

/** Get item metadata and the decrypted secret (requires view access). */
export async function revealItem(itemId, userId) {
  const { item, permission } = await authorizeItem(itemId, userId, 'view_only');
  const secret = item.encrypted_payload ? decryptJson(item.encrypted_payload) : null;
  await logActivity({ userId, action: 'credential_access', targetId: item.id });
  return { ...toMetadata(item, permission), secret };
}

export async function updateItem(itemId, userId, input) {
  const { item } = await authorizeItem(itemId, userId, 'edit');

  const fields = [];
  const params = [];
  const set = (col, val) => {
    params.push(val);
    fields.push(`${col} = $${params.length}`);
  };

  if (input.title !== undefined) set('title', input.title);
  if (input.category !== undefined) set('category', input.category);
  if (input.tags !== undefined) set('tags', input.tags);
  if (input.expiresAt !== undefined) set('expires_at', input.expiresAt);
  if (input.secret !== undefined) {
    set('encrypted_payload', input.secret === null ? null : encryptJson(input.secret));
  }

  if (fields.length === 0) return toMetadata(item);

  params.push(itemId);
  const { rows } = await query(
    `UPDATE vault_items SET ${fields.join(', ')}, updated_at = now()
     WHERE id = $${params.length} RETURNING *`,
    params,
  );
  await logActivity({ userId, action: 'permission_change', targetId: itemId, metadata: { op: 'update' } });
  return toMetadata(rows[0]);
}

export async function deleteItem(itemId, userId) {
  // Only the owner may delete.
  const { item } = await authorizeItem(itemId, userId, 'edit');
  if (item.owner_id !== userId) {
    throw ApiError.forbidden('Only the owner can delete this item');
  }
  await query('DELETE FROM vault_items WHERE id = $1', [itemId]);
}

export async function listSharedWithMe(userId) {
  const { rows } = await query(
    `SELECT vi.*, s.permission AS share_permission, s.expires_at AS share_expires
     FROM shares s
     JOIN vault_items vi ON vi.id = s.item_id
     WHERE s.grantee_id = $1 AND s.permission <> 'private'
       AND (s.expires_at IS NULL OR s.expires_at > now())
     ORDER BY s.created_at DESC`,
    [userId],
  );
  return rows.map((r) => toMetadata(r, r.share_permission));
}

export { toMetadata };
