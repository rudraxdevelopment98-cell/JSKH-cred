import { query, withTransaction } from '../../db/pool.js';
import { ApiError } from '../../middleware/ApiError.js';

/** Fetch a member row, or throw 403 if the user is not an active member. */
async function requireActiveMember(familyId, userId) {
  const { rows } = await query(
    `SELECT * FROM family_members
     WHERE family_id = $1 AND user_id = $2 AND status = 'active'`,
    [familyId, userId],
  );
  if (!rows[0]) throw ApiError.forbidden('Not a member of this family');
  return rows[0];
}

async function requireFamilyAdmin(familyId, userId) {
  const member = await requireActiveMember(familyId, userId);
  if (!['family_admin', 'super_admin'].includes(member.role)) {
    throw ApiError.forbidden('Family admin role required');
  }
  return member;
}

export async function createFamily(ownerId, { name }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      'INSERT INTO families (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, ownerId],
    );
    const family = rows[0];
    await client.query(
      `INSERT INTO family_members (family_id, user_id, role, status)
       VALUES ($1, $2, 'family_admin', 'active')`,
      [family.id, ownerId],
    );
    return family;
  });
}

export async function listFamilies(userId) {
  const { rows } = await query(
    `SELECT f.*, fm.role AS my_role, fm.status AS my_status
     FROM families f
     JOIN family_members fm ON fm.family_id = f.id
     WHERE fm.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function listMembers(familyId, requesterId) {
  await requireActiveMember(familyId, requesterId);
  const { rows } = await query(
    `SELECT fm.id, fm.role, fm.status, fm.created_at,
            u.id AS user_id, u.email, u.display_name
     FROM family_members fm
     JOIN users u ON u.id = fm.user_id
     WHERE fm.family_id = $1
     ORDER BY fm.created_at`,
    [familyId],
  );
  return rows;
}

export async function inviteMember(familyId, inviterId, { email }) {
  await requireFamilyAdmin(familyId, inviterId);

  const { rows: userRows } = await query('SELECT id FROM users WHERE email = $1', [email]);
  const invitee = userRows[0];
  if (!invitee) throw ApiError.notFound('No user with that email', 'user_not_found');

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO family_members (family_id, user_id, status)
       VALUES ($1, $2, 'invited')
       ON CONFLICT (family_id, user_id) DO NOTHING
       RETURNING *`,
      [familyId, invitee.id],
    );
    if (!rows[0]) throw ApiError.conflict('User already invited or a member');

    await client.query(
      `INSERT INTO notifications (user_id, type, payload)
       VALUES ($1, 'family_invitation', $2)`,
      [invitee.id, { familyId }],
    );
    return rows[0];
  });
}

/** The invited user accepts (or any admin approves) membership. */
export async function approveMember(familyId, actorId, targetUserId) {
  // The invitee can self-accept; an admin can approve anyone.
  if (actorId !== targetUserId) {
    await requireFamilyAdmin(familyId, actorId);
  }
  const { rows } = await query(
    `UPDATE family_members SET status = 'active'
     WHERE family_id = $1 AND user_id = $2 AND status = 'invited'
     RETURNING *`,
    [familyId, targetUserId],
  );
  if (!rows[0]) throw ApiError.notFound('No pending invitation found');
  return rows[0];
}

export async function removeMember(familyId, adminId, targetUserId) {
  await requireFamilyAdmin(familyId, adminId);
  const { rows } = await query(
    `UPDATE family_members SET status = 'removed'
     WHERE family_id = $1 AND user_id = $2
     RETURNING *`,
    [familyId, targetUserId],
  );
  if (!rows[0]) throw ApiError.notFound('Member not found');
  return rows[0];
}

export async function assignRole(familyId, adminId, targetUserId, role) {
  await requireFamilyAdmin(familyId, adminId);
  const { rows } = await query(
    `UPDATE family_members SET role = $3
     WHERE family_id = $1 AND user_id = $2
     RETURNING *`,
    [familyId, targetUserId, role],
  );
  if (!rows[0]) throw ApiError.notFound('Member not found');
  return rows[0];
}
