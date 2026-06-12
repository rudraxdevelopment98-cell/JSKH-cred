-- JCred initial schema
-- Enable UUID generation and case-insensitive text
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Enums -----------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'family_admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('invited', 'active', 'removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE item_type AS ENUM (
    'password', 'secure_note', 'passport', 'license', 'insurance',
    'medical', 'property', 'certificate', 'bank', 'tax'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE permission_level AS ENUM (
    'private', 'view_only', 'view_download', 'edit', 'temporary', 'emergency'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'access_request', 'document_shared', 'expiry_alert',
    'security_alert', 'family_invitation'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE activity_action AS ENUM (
    'login', 'document_view', 'download', 'upload',
    'permission_change', 'credential_access'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              CITEXT UNIQUE,
  phone              TEXT UNIQUE,
  password_hash      TEXT,
  display_name       TEXT,
  role               user_role NOT NULL DEFAULT 'member',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status             user_status NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS families (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       user_role NOT NULL DEFAULT 'member',
  status     member_status NOT NULL DEFAULT 'invited',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

CREATE TABLE IF NOT EXISTS vault_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id         UUID REFERENCES families(id) ON DELETE SET NULL,
  type              item_type NOT NULL,
  title             TEXT NOT NULL,
  category          TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  -- AES-256-GCM encrypted JSON payload (credentials / secure notes)
  encrypted_payload JSONB,
  -- For documents stored in object storage
  storage_key       TEXT,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_items_owner ON vault_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_type ON vault_items(type);

CREATE TABLE IF NOT EXISTS shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  grantee_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission  permission_level NOT NULL DEFAULT 'view_only',
  expires_at  TIMESTAMPTZ,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, grantee_id)
);

CREATE INDEX IF NOT EXISTS idx_shares_grantee ON shares(grantee_id);

CREATE TABLE IF NOT EXISTS access_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       request_status NOT NULL DEFAULT 'pending',
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- SHA-256 hash of the refresh token; raw token is never stored
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip         TEXT,
  revoked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  payload    JSONB NOT NULL DEFAULT '{}',
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS activity_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action     activity_action NOT NULL,
  target_id  UUID,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
