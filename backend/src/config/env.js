import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
  isTest: process.env.NODE_ENV === 'test',

  databaseUrl: required('DATABASE_URL', 'postgres://jcred:jcred@localhost:5432/jcred'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },

  // 32-byte key for AES-256. Accepts base64 or hex; falls back to a dev key.
  vaultEncryptionKey: required('VAULT_ENCRYPTION_KEY', 'ZGV2LW9ubHktMzItYnl0ZS1rZXktZG8tbm90LXVzZSE='),

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10),
  },
};

export default env;
