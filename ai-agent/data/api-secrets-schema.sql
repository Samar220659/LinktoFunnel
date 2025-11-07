-- 🔐 API SECRETS STORAGE TABLE
-- Secure storage for API keys in Supabase

CREATE TABLE IF NOT EXISTS api_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_name TEXT UNIQUE NOT NULL,
  key_value JSONB NOT NULL, -- Encrypted: {iv, encrypted, authTag}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP,
  access_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_api_secrets_key_name ON api_secrets(key_name);
CREATE INDEX idx_api_secrets_updated ON api_secrets(updated_at DESC);

-- Row Level Security
ALTER TABLE api_secrets ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role only" ON api_secrets
  FOR ALL
  USING (true);

-- Function to update timestamp and track access
CREATE OR REPLACE FUNCTION update_api_secret_access()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    IF TG_OP = 'SELECT' THEN
        NEW.last_accessed = NOW();
        NEW.access_count = NEW.access_count + 1;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER api_secrets_access_trigger
    BEFORE UPDATE ON api_secrets
    FOR EACH ROW
    EXECUTE FUNCTION update_api_secret_access();

-- Success notification
INSERT INTO notifications (type, title, message)
VALUES ('success', 'API Secrets Storage Ready', 'Secure API key management system initialized!');
