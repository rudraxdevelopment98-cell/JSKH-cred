import { query, withTransaction } from '../../db/pool.js';
import { ApiError } from '../../middleware/ApiError.js';
import { logActivity } from '../activity/activity.service.js';
import { getItemOrThrow } from '../items/access.js';

export async function createRequest(itemId, requesterId, { isEmergency = false } = {}) {
  const item = await getItemOrThrow(itemId);
  if (item.owner_id === requesterId) {
    throw ApiError.badRequest('You already own this item');
  }

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO access_requests (item_id, requester_id, is_emergency)
       VALUES ($1, $2, $3) RETURNING *`,
      [itemId, requesterId, isEmergency],
    );
    await client.query(
      `INSERT INTO notifications (user_id, type, payload)
       VALUES ($1, 'access_request', $2)`,
      [item.owner_id, { itemId, requestId: rows[0].id, isEmergency }],
    );
    return rows[0];
  });
}

/** Requests that target items owned by the given user. */
export async function listIncoming(ownerId) {
  const { rows } = await query(
    `SELECT ar.*, vi.title AS item_title, u.email AS requester_email
     FROM access_requests ar
     JOIN vault_items vi ON vi.id = ar.item_id
     JOIN users u ON u.id = ar.requester_id
     WHERE vi.owner_id = $1 AND ar.status = 'pending'
     ORDER BY ar.created_at DESC`,
    [ownerId],
  );
  return rows;
}

async function resolve(requestId, ownerId, status) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT ar.*, vi.owner_id, vi.id AS item_id
       FROM access_requests ar
       JOIN vault_items vi ON vi.id = ar.item_id
       WHERE ar.id = $1`,
      [requestId],
    );
    const reqRow = rows[0];
    if (!reqRow) throw ApiError.notFound('Request not found');
    if (reqRow.owner_id !== ownerId) throw ApiError.forbidden('Not the item owner');
    if (reqRow.status !== 'pending') throw ApiError.conflict('Request already resolved');

    await client.query(
      `UPDATE access_requests SET status = $2, resolved_at = now() WHERE id = $1`,
      [requestId, status],
    );

    if (status === 'approved') {
      // Grant access. Emergency requests get download access.
      const permission = reqRow.is_emergency ? 'emergency' : 'view_only';
      await client.query(
        `INSERT INTO shares (item_id, grantee_id, permission, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (item_id, grantee_id)
           DO UPDATE SET permission = EXCLUDED.permission`,
        [reqRow.item_id, reqRow.requester_id, permission, ownerId],
      );
    }

    await client.query(
      `INSERT INTO notifications (user_id, type, payload)
       VALUES ($1, 'access_request', $2)`,
      [reqRow.requester_id, { itemId: reqRow.item_id, status }],
    );
    await logActivity(
      {
        userId: ownerId,
        action: 'permission_change',
        targetId: reqRow.item_id,
        metadata: { op: `request_${status}`, requestId },
      },
      client,
    );
    return { ...reqRow, status };
  });
}

export function approveRequest(requestId, ownerId) {
  return resolve(requestId, ownerId, 'approved');
}

export function denyRequest(requestId, ownerId) {
  return resolve(requestId, ownerId, 'denied');
}
