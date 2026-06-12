import request from 'supertest';
import { createApp } from '../src/app.js';
import { runMigrations } from '../src/db/migrate.js';
import { pool, query } from '../src/db/pool.js';

export const app = createApp();

/** Run migrations and wipe all data so each test file starts clean. */
export async function resetDb() {
  await runMigrations({ silent: true });
  await query(
    `TRUNCATE users, families, family_members, vault_items, shares,
             access_requests, sessions, notifications, activity_logs
     RESTART IDENTITY CASCADE`,
  );
}

export async function teardown() {
  await pool.end();
}

let counter = 0;

/** Register a fresh user and return { tokens, user, auth header helper }. */
export async function makeUser(overrides = {}) {
  counter += 1;
  const email = overrides.email ?? `user${counter}_${Date.now()}@example.com`;
  const password = overrides.password ?? 'password123';
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ email, password, displayName: overrides.displayName ?? `User ${counter}` });
  if (res.status !== 201) {
    throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return {
    ...res.body,
    email,
    password,
    bearer: `Bearer ${res.body.accessToken}`,
  };
}

/** Promote a user to super_admin directly in the DB (for admin-route tests). */
export async function promoteToSuperAdmin(userId) {
  await query(`UPDATE users SET role = 'super_admin' WHERE id = $1`, [userId]);
}
