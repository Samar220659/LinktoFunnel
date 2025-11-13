-- 🗄️ SUPABASE DATABASE SCHEMA
-- Complete schema for AI Business Agent System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== AGENT STATES TABLE =====
-- Tracks all agent executions for RL learning

CREATE TABLE IF NOT EXISTS agent_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT NOT NULL,
  state_data JSONB,
  reward DECIMAL,
  action TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_states_name ON agent_states(agent_name);
CREATE INDEX idx_agent_states_created ON agent_states(created_at DESC);

-- ===== DIGISTORE24 PRODUCTS TABLE =====
-- Stores discovered marketplace products

CREATE TABLE IF NOT EXISTS digistore_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT UNIQUE NOT NULL,
  product_name TEXT,
  category TEXT,
  commission_rate DECIMAL,
  conversion_score DECIMAL,
  trend_score DECIMAL,
  affiliate_link TEXT,
  is_promoted BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- Additional product data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON digistore_products(category);
CREATE INDEX idx_products_score ON digistore_products(conversion_score DESC);
CREATE INDEX idx_products_promoted ON digistore_products(is_promoted);

-- ===== GENERATED CONTENT TABLE =====
-- Tracks all AI-generated marketing content

CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES digistore_products(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- video, landing_page, email, social_post, blog
  content_url TEXT,
  content_data JSONB, -- Full content or metadata
  platform TEXT, -- tiktok, instagram, youtube, etc.
  performance_score DECIMAL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_product ON generated_content(product_id);
CREATE INDEX idx_content_type ON generated_content(content_type);
CREATE INDEX idx_content_performance ON generated_content(performance_score DESC);

-- ===== CAMPAIGNS TABLE =====
-- Marketing campaigns tracking

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES digistore_products(id) ON DELETE SET NULL,
  campaign_name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, completed
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  revenue DECIMAL DEFAULT 0,
  costs DECIMAL DEFAULT 0,
  roi DECIMAL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_roi ON campaigns(roi DESC);

-- ===== DAILY ANALYTICS TABLE =====
-- Aggregated daily performance metrics

CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  revenue DECIMAL DEFAULT 0,
  costs DECIMAL DEFAULT 0,
  roi DECIMAL,
  best_product_id UUID REFERENCES digistore_products(id),
  best_platform TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_date ON analytics_daily(date DESC);

-- ===== REINFORCEMENT LEARNING TABLE =====
-- Stores RL episodes for continuous learning

CREATE TABLE IF NOT EXISTS rl_learning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode INTEGER NOT NULL,
  state_before JSONB NOT NULL,
  action_taken TEXT NOT NULL,
  reward DECIMAL NOT NULL,
  state_after JSONB,
  learning_rate DECIMAL DEFAULT 0.1,
  exploration_rate DECIMAL DEFAULT 0.1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rl_episode ON rl_learning(episode DESC);
CREATE INDEX idx_rl_reward ON rl_learning(reward DESC);

-- ===== LEADS TABLE =====
-- Captured leads from landing pages

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  source_campaign_id UUID REFERENCES campaigns(id),
  source_content_id UUID REFERENCES generated_content(id),
  status TEXT DEFAULT 'new', -- new, contacted, converted, lost
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_campaign ON leads(source_campaign_id);

-- ===== OWN PRODUCTS TABLE =====
-- AI-generated products we sell

CREATE TABLE IF NOT EXISTS own_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  digistore_product_id TEXT UNIQUE,
  product_name TEXT NOT NULL,
  niche TEXT,
  price DECIMAL,
  content_type TEXT, -- ebook, course, template, tool
  generation_prompt TEXT,
  sales_page_url TEXT,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, live, paused
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_own_products_niche ON own_products(niche);
CREATE INDEX idx_own_products_revenue ON own_products(total_revenue DESC);

-- ===== WORKFLOWS TABLE =====
-- Automation workflow tracking

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_name TEXT NOT NULL,
  trigger_type TEXT, -- cron, webhook, manual
  schedule TEXT, -- cron expression
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  status TEXT DEFAULT 'active',
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_next_run ON workflows(next_run);

-- ===== NOTIFICATIONS TABLE =====
-- System notifications & alerts

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- success, warning, error, info
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_read ON notifications(read, created_at DESC);

-- ===== FUNCTIONS & TRIGGERS =====

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to products table
CREATE TRIGGER update_digistore_products_updated_at
    BEFORE UPDATE ON digistore_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===== ROW LEVEL SECURITY =====

-- Enable RLS on all tables
ALTER TABLE agent_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE digistore_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE rl_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE own_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role (used by backend)
-- In production, create more granular policies

CREATE POLICY "Allow all for service role" ON agent_states FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON digistore_products FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON generated_content FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON analytics_daily FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON rl_learning FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON own_products FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON workflows FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON notifications FOR ALL USING (true);

-- ===== CONTENT APPROVAL QUEUE TABLE =====
-- Stores content waiting for user approval before auto-posting

CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES digistore_products(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}', -- Array of platforms to post to
  status TEXT DEFAULT 'pending_approval', -- pending_approval, approved, rejected, posted
  video_url TEXT,
  affiliate_link TEXT,
  approval_user_id TEXT,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  posted_at TIMESTAMP,
  posting_results JSONB, -- Results from auto-posting
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_queue_status ON content_queue(status);
CREATE INDEX idx_content_queue_created ON content_queue(created_at DESC);
CREATE INDEX idx_content_queue_content_id ON content_queue(content_id);

-- ===== INITIAL DATA =====

-- Insert default workflow
INSERT INTO workflows (workflow_name, trigger_type, schedule, config) VALUES
('Daily Product Scout', 'cron', '0 9 * * *', '{"agent": "product-scout", "limit": 50}'),
('Daily Content Generation', 'cron', '0 12 * * *', '{"agent": "content-creator", "batch_size": 10}'),
('Evening Analytics', 'cron', '0 18 * * *', '{"agent": "analytics", "report_email": true}');

-- Create notification for setup completion
INSERT INTO notifications (type, title, message) VALUES
('success', 'Database Initialized', 'AI Business Agent system is ready to generate passive income!');
