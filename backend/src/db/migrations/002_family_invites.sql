-- Family invite codes: short numeric codes a member enters to join a family.
CREATE TABLE IF NOT EXISTS family_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  email       CITEXT,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Look up active codes quickly (and keep them unique while unused).
CREATE UNIQUE INDEX IF NOT EXISTS idx_family_invites_active_code
  ON family_invites(code) WHERE used = FALSE;
