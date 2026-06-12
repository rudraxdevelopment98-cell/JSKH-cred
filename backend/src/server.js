import { createApp } from './app.js';
import env from './config/env.js';
import { runMigrations } from './db/migrate.js';
import { closePool } from './db/pool.js';

async function main() {
  // Apply pending migrations on boot for convenience in dev/containers.
  await runMigrations({ silent: env.isProd });

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`JCred API listening on :${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
