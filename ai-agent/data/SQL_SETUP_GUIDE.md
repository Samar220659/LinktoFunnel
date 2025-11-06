# 📊 SQL Schema Installation Guide

## Quick Start

### 1. Open Supabase Dashboard

Go to: https://app.supabase.com/project/YOUR_PROJECT/sql

### 2. Copy SQL Schema

The complete schema is in: `ai-agent/data/social-media-api-schema.sql`

### 3. Execute in SQL Editor

1. Copy the entire contents of `social-media-api-schema.sql`
2. Paste into the Supabase SQL Editor
3. Click **"RUN"** button
4. Wait for completion (should take ~5 seconds)

### 4. Verify Installation

Run this query in SQL Editor to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'social_media%';
```

You should see:
- `social_media_apis`
- `social_media_api_keys`
- `social_media_api_changes`
- `social_media_api_health`
- `social_media_api_usage`

---

## What Gets Created

### ✅ 5 Tables

1. **`social_media_apis`** - API registry with versions and endpoints
2. **`social_media_api_keys`** - Encrypted API keys storage
3. **`social_media_api_changes`** - Change tracking log
4. **`social_media_api_health`** - Health check history
5. **`social_media_api_usage`** - Usage statistics

### ✅ 3 Views

1. **`social_media_api_health_summary`** - 24h health aggregation
2. **`social_media_api_critical_changes`** - Unacknowledged critical changes
3. **`social_media_api_daily_usage`** - Daily usage statistics

### ✅ Triggers

- Auto-update timestamps on changes
- Auto-set notification timestamps
- Auto-set acknowledgment timestamps

### ✅ Row Level Security

- Public read access to APIs (customize for production!)
- Authenticated access required for API keys
- Protected sensitive data

---

## Troubleshooting

### ❌ Error: "relation already exists"

**Solution:** Tables already exist. You can either:

1. **Skip installation** (already done!)
2. **Drop and recreate:**

```sql
DROP TABLE IF EXISTS social_media_api_usage CASCADE;
DROP TABLE IF EXISTS social_media_api_health CASCADE;
DROP TABLE IF EXISTS social_media_api_changes CASCADE;
DROP TABLE IF EXISTS social_media_api_keys CASCADE;
DROP TABLE IF EXISTS social_media_apis CASCADE;

-- Then run the full schema again
```

### ❌ Error: "permission denied"

**Solution:** Make sure you're using a role with CREATE TABLE permissions.

In Supabase, you should have the necessary permissions by default.

### ❌ Error: "uuid-ossp extension not found"

**Solution:** Enable the extension first:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Verification Queries

### Check Tables

```sql
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'social_media%'
ORDER BY table_name;
```

### Check Views

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'social_media%';
```

### Check Triggers

```sql
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table LIKE 'social_media%';
```

### Check Row Level Security

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename LIKE 'social_media%';
```

---

## Manual Table Creation (Alternative)

If you prefer to create tables one by one:

### 1. Social Media APIs Table

```sql
CREATE TABLE social_media_apis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  api_name TEXT NOT NULL,
  base_url TEXT,
  version TEXT,
  docs_url TEXT,
  auth_type TEXT,
  endpoints JSONB,
  rate_limit JSONB,
  check_url TEXT,
  last_checked TIMESTAMP,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, api_name)
);

CREATE INDEX idx_social_media_apis_platform ON social_media_apis(platform);
CREATE INDEX idx_social_media_apis_status ON social_media_apis(status);
```

### 2. API Keys Table (Encrypted)

```sql
CREATE TABLE social_media_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id UUID NOT NULL REFERENCES social_media_apis(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  encryption_auth_tag TEXT NOT NULL,
  permissions JSONB,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  UNIQUE(api_id, key_name)
);

CREATE INDEX idx_social_media_api_keys_api_id ON social_media_api_keys(api_id);
```

### 3. Continue with other tables...

See `social-media-api-schema.sql` for complete definitions.

---

## Post-Installation

After successful installation:

1. **Test the connection:**
   ```bash
   node scripts/test-social-media-api-manager.js
   ```

2. **Initialize APIs:**
   ```bash
   node ai-agent/agents/social-media-api-manager.js
   ```

3. **Check in Supabase:**
   - Go to Table Editor
   - You should see `social_media_apis` table
   - Initially empty, will be populated by the agent

---

## Security Notes

### 🔒 Important Security Settings

1. **Row Level Security is enabled** by default
2. **Default policies allow public read** - Change for production!
3. **API Keys table requires authentication** by default

### Recommended Production Policies

```sql
-- Restrict APIs table to authenticated users only
DROP POLICY IF EXISTS "Allow public read access to APIs" ON social_media_apis;

CREATE POLICY "Only authenticated users can read APIs"
  ON social_media_apis
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Restrict to admin role only
CREATE POLICY "Only admins can manage APIs"
  ON social_media_apis
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Need Help?

- 📚 Full documentation: `ai-agent/SOCIAL_MEDIA_API_MANAGER.md`
- 🐛 Issues: Open a GitHub issue
- 💬 Telegram: Use `/help` command in your bot

---

**✅ Installation complete? Run:** `node ai-agent/agents/social-media-api-manager.js`
