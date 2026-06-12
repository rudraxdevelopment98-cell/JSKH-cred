import { query } from '../../db/pool.js';

/**
 * Record an entry in the append-only activity log.
 * Accepts an optional db client so it can participate in a transaction.
 */
export async function logActivity(
  { userId, action, targetId = null, metadata = {} },
  client = null,
) {
  const runner = client ?? { query };
  await runner.query(
    `INSERT INTO activity_logs (user_id, action, target_id, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, action, targetId, metadata],
  );
}

export async function listActivity(userId, { limit = 50 } = {}) {
  const { rows } = await query(
    `SELECT id, action, target_id, metadata, created_at
     FROM activity_logs
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

export async function listAllActivity({ limit = 100 } = {}) {
  const { rows } = await query(
    `SELECT id, user_id, action, target_id, metadata, created_at
     FROM activity_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}
