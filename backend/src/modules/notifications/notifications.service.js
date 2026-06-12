import { query } from '../../db/pool.js';
import { ApiError } from '../../middleware/ApiError.js';

export async function listNotifications(userId, { unreadOnly = false } = {}) {
  let sql = 'SELECT * FROM notifications WHERE user_id = $1';
  if (unreadOnly) sql += ' AND read = FALSE';
  sql += ' ORDER BY created_at DESC LIMIT 100';
  const { rows } = await query(sql, [userId]);
  return rows;
}

export async function markRead(userId, notificationId) {
  const { rowCount } = await query(
    'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
    [notificationId, userId],
  );
  if (!rowCount) throw ApiError.notFound('Notification not found');
}

export async function markAllRead(userId) {
  await query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [userId]);
}
