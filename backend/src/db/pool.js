import pg from 'pg';
import env from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * Run a parameterized query.
 * @param {string} text SQL with $1, $2 placeholders
 * @param {Array} [params]
 */
export function query(text, params) {
  return pool.query(text, params);
}

/**
 * Run a set of statements inside a transaction.
 * The callback receives a dedicated client; it is released automatically.
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}
