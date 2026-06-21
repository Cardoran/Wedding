-- Diese Migration wird automatisch bei Deployment ausgeführt
CREATE TABLE IF NOT EXISTS rsvps (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  allergies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: Index für schnelleres Abfragen
CREATE INDEX IF NOT EXISTS idx_rsvps_name ON rsvps(name);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);