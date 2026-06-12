import { query, closePool } from './pool.js';
import { hashPassword } from '../crypto/password.js';
import { runMigrations } from './migrate.js';

/**
 * Create (or promote) a super admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Idempotent: safe to run repeatedly.
 *
 *   ADMIN_EMAIL=admin@jcred.app ADMIN_PASSWORD=secret npm run seed:admin
 */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
  }

  await runMigrations({ silent: true });

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    await query(
      `UPDATE users SET role = 'super_admin', status = 'active' WHERE email = $1`,
      [email],
    );
    console.log(`Promoted existing user ${email} to super_admin`);
    return;
  }

  const passwordHash = await hashPassword(password);
  await query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, 'Super Admin', 'super_admin')`,
    [email, passwordHash],
  );
  console.log(`Created super_admin ${email}`);
}

seedAdmin()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => closePool());
