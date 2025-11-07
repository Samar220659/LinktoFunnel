-- ===== USERS TABLE =====
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_chat_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  setup_completed BOOLEAN DEFAULT false,
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CREDENTIALS TABLE (Encrypted API Keys) =====
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'openai', 'supabase', etc.
  api_key TEXT NOT NULL,
  url TEXT, -- for supabase
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- ===== SOCIAL ACCOUNTS TABLE =====
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube', etc.
  username TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'error'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- ===== AFFILIATE ACCOUNTS TABLE =====
CREATE TABLE IF NOT EXISTS affiliate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'digistore24', 'awin', etc.
  email TEXT NOT NULL,
  affiliate_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- ===== AUTOMATION SETTINGS TABLE =====
CREATE TABLE IF NOT EXISTS automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  approval_mode BOOLEAN DEFAULT true,
  auto_post_enabled BOOLEAN DEFAULT true,
  daily_approval_time TEXT DEFAULT '08:00',
  auto_post_time TEXT DEFAULT '18:00',
  timezone TEXT DEFAULT 'Europe/Berlin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== APPROVAL QUEUE TABLE =====
CREATE TABLE IF NOT EXISTS approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'content', 'legal', etc.
  product_id UUID,
  product_name TEXT,
  variants JSONB NOT NULL, -- Array of variant objects
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  selected_variant TEXT, -- 'a', 'b', etc.
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== PRODUCTS TABLE =====
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  price DECIMAL(10,2),
  commission DECIMAL(10,2),
  platform TEXT DEFAULT 'digistore24',
  category TEXT,
  ai_score DECIMAL(3,1), -- 0.0 - 10.0
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CONTENT TABLE =====
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  script JSONB NOT NULL, -- {hook, problem, solution, cta}
  hashtags TEXT[],
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'posted'
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== POSTS TABLE =====
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  url TEXT,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ANALYTICS TABLE =====
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, date)
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_approval_queue_user_status ON approval_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_user_platform ON posts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_products_user_status ON products(user_id, status);

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ===== POLICIES (Allow service_role full access) =====
-- Note: Service role bypasses RLS, but we define policies for anon key usage

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Service can do anything on users" ON users
  FOR ALL USING (true);
