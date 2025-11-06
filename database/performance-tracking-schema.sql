-- ═══════════════════════════════════════════════════════════════
-- 🧠 SELF-LEARNING PERFORMANCE OPTIMIZER - DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════
--
-- This schema enables the AI to learn from every action and continuously optimize
--
-- Features:
-- - Track performance of every product, post, and funnel
-- - Learn which strategies work best
-- - Predict future performance
-- - Auto-optimize campaigns
--
-- Usage:
--   Run this in your Supabase SQL Editor to create the tables
--

-- ═══════════════════════════════════════════════════════════════
-- TABLE 1: Performance Metrics
-- Tracks every action and its outcome
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- What was done
  action_type VARCHAR(50) NOT NULL,  -- 'post', 'campaign', 'funnel', 'email'
  entity_id VARCHAR(255) NOT NULL,   -- ID of the product, post, etc.
  entity_name TEXT,                  -- Human-readable name

  -- Where it was done
  platform VARCHAR(50),              -- 'tiktok', 'instagram', 'youtube', etc.
  channel VARCHAR(100),              -- Specific channel/account

  -- Performance metrics
  impressions INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,   -- Revenue in cents (avoid float precision issues)

  -- Timing
  duration_seconds INTEGER,          -- How long the campaign ran
  time_to_first_conversion INTEGER,  -- Seconds until first conversion

  -- Cost
  cost_cents INTEGER DEFAULT 0,      -- Cost in cents

  -- Context (for learning)
  metadata JSONB DEFAULT '{}',       -- Additional context (time of day, day of week, etc.)

  -- Calculated fields
  ctr DECIMAL(5,4),                  -- Click-through rate
  conversion_rate DECIMAL(5,4),      -- Conversion rate
  roi DECIMAL(10,2),                 -- Return on investment
  epc DECIMAL(10,2),                 -- Earnings per click (cents)

  -- Performance score (0-100)
  performance_score DECIMAL(5,2),

  -- Index for fast queries
  CONSTRAINT performance_metrics_entity_idx UNIQUE (entity_id, action_type, platform, created_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_action_type ON performance_metrics(action_type);
CREATE INDEX IF NOT EXISTS idx_performance_entity ON performance_metrics(entity_id);
CREATE INDEX IF NOT EXISTS idx_performance_platform ON performance_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_performance_created ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_score ON performance_metrics(performance_score DESC);
CREATE INDEX IF NOT EXISTS idx_performance_roi ON performance_metrics(roi DESC);

-- Function to auto-calculate derived metrics
CREATE OR REPLACE FUNCTION calculate_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate CTR
  IF NEW.impressions > 0 THEN
    NEW.ctr := NEW.clicks::DECIMAL / NEW.impressions;
  END IF;

  -- Calculate conversion rate
  IF NEW.clicks > 0 THEN
    NEW.conversion_rate := NEW.conversions::DECIMAL / NEW.clicks;
  END IF;

  -- Calculate ROI
  IF NEW.cost_cents > 0 THEN
    NEW.roi := ((NEW.revenue_cents - NEW.cost_cents)::DECIMAL / NEW.cost_cents) * 100;
  END IF;

  -- Calculate EPC (Earnings Per Click)
  IF NEW.clicks > 0 THEN
    NEW.epc := NEW.revenue_cents::DECIMAL / NEW.clicks;
  END IF;

  -- Calculate performance score (0-100)
  -- Weighted combination of conversion rate, ROI, and engagement
  NEW.performance_score := LEAST(100, GREATEST(0,
    (COALESCE(NEW.conversion_rate, 0) * 1000 * 0.4) +  -- 40% weight on conversions
    (LEAST(COALESCE(NEW.roi, 0), 500) / 5 * 0.3) +     -- 30% weight on ROI (capped at 500%)
    (COALESCE(NEW.ctr, 0) * 1000 * 0.3)                -- 30% weight on CTR
  ));

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate metrics
DROP TRIGGER IF EXISTS trigger_calculate_performance ON performance_metrics;
CREATE TRIGGER trigger_calculate_performance
  BEFORE INSERT OR UPDATE ON performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION calculate_performance_metrics();

-- ═══════════════════════════════════════════════════════════════
-- TABLE 2: Learning Insights
-- Stores patterns and insights discovered by the AI
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- What was learned
  insight_type VARCHAR(50) NOT NULL,  -- 'pattern', 'trend', 'prediction', 'recommendation'
  category VARCHAR(50),               -- 'product', 'platform', 'timing', 'content'

  -- The insight
  title TEXT NOT NULL,
  description TEXT,
  confidence DECIMAL(3,2),            -- 0.00 to 1.00

  -- Supporting data
  sample_size INTEGER,                -- How many data points
  evidence JSONB DEFAULT '{}',        -- Supporting metrics

  -- Action recommendations
  recommended_action TEXT,
  expected_improvement DECIMAL(5,2),  -- Expected % improvement

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'applied', 'expired', 'invalid'
  applied_at TIMESTAMP WITH TIME ZONE,

  -- Results after applying
  actual_improvement DECIMAL(5,2)
);

CREATE INDEX IF NOT EXISTS idx_insights_type ON learning_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_category ON learning_insights(category);
CREATE INDEX IF NOT EXISTS idx_insights_confidence ON learning_insights(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_insights_status ON learning_insights(status);

-- ═══════════════════════════════════════════════════════════════
-- TABLE 3: Product Performance History
-- Aggregated performance data per product over time
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS product_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  product_id VARCHAR(255) NOT NULL,
  product_name TEXT,

  -- Time period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  period_type VARCHAR(20),            -- 'hour', 'day', 'week', 'month'

  -- Aggregated metrics
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,

  -- Averages
  avg_ctr DECIMAL(5,4),
  avg_conversion_rate DECIMAL(5,4),
  avg_roi DECIMAL(10,2),
  avg_performance_score DECIMAL(5,2),

  -- Trend analysis
  trend VARCHAR(20),                  -- 'rising', 'falling', 'stable'
  momentum DECIMAL(5,2),              -- Rate of change

  -- Predictions
  predicted_next_period_revenue INTEGER,
  prediction_confidence DECIMAL(3,2),

  CONSTRAINT product_performance_unique UNIQUE (product_id, period_start, period_type)
);

CREATE INDEX IF NOT EXISTS idx_product_perf_product ON product_performance(product_id);
CREATE INDEX IF NOT EXISTS idx_product_perf_period ON product_performance(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_product_perf_score ON product_performance(avg_performance_score DESC);

-- ═══════════════════════════════════════════════════════════════
-- TABLE 4: Optimization Actions
-- Tracks what optimizations were made and their results
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS optimization_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- What was optimized
  action_type VARCHAR(50) NOT NULL,   -- 'increase_budget', 'stop_campaign', 'change_schedule', etc.
  entity_type VARCHAR(50),            -- 'product', 'campaign', 'platform'
  entity_id VARCHAR(255),

  -- The change made
  previous_value TEXT,
  new_value TEXT,
  change_description TEXT,

  -- Why it was done
  reason TEXT,
  based_on_insight_id UUID REFERENCES learning_insights(id),

  -- Expected vs actual results
  expected_improvement DECIMAL(5,2),
  actual_improvement DECIMAL(5,2),

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'completed', 'rolled_back'
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Results
  result_metrics JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_optimization_entity ON optimization_actions(entity_id);
CREATE INDEX IF NOT EXISTS idx_optimization_status ON optimization_actions(status);
CREATE INDEX IF NOT EXISTS idx_optimization_created ON optimization_actions(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- VIEW: Performance Dashboard
-- Quick overview of system performance
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW performance_dashboard AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_actions,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  SUM(conversions) as total_conversions,
  SUM(revenue_cents) / 100.0 as total_revenue_eur,
  SUM(cost_cents) / 100.0 as total_cost_eur,
  AVG(performance_score) as avg_performance_score,
  AVG(roi) as avg_roi,
  COUNT(DISTINCT entity_id) as unique_products
FROM performance_metrics
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ═══════════════════════════════════════════════════════════════
-- VIEW: Top Performing Products
-- Products ranked by performance
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW top_products AS
SELECT
  entity_id as product_id,
  entity_name as product_name,
  COUNT(*) as promotion_count,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  SUM(conversions) as total_conversions,
  SUM(revenue_cents) / 100.0 as total_revenue_eur,
  AVG(performance_score) as avg_performance_score,
  AVG(roi) as avg_roi,
  MAX(created_at) as last_promoted
FROM performance_metrics
WHERE action_type = 'post' OR action_type = 'campaign'
GROUP BY entity_id, entity_name
HAVING SUM(clicks) > 10  -- Minimum 10 clicks for statistical significance
ORDER BY avg_performance_score DESC
LIMIT 50;

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to get product performance trend
CREATE OR REPLACE FUNCTION get_product_trend(
  p_product_id VARCHAR(255),
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date TIMESTAMP WITH TIME ZONE,
  revenue DECIMAL,
  conversions INTEGER,
  performance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('day', created_at) as date,
    SUM(revenue_cents) / 100.0 as revenue,
    SUM(conversions) as conversions,
    AVG(performance_score) as performance_score
  FROM performance_metrics
  WHERE entity_id = p_product_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE_TRUNC('day', created_at)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- INITIAL DATA
-- ═══════════════════════════════════════════════════════════════

-- You can add seed data here if needed

COMMENT ON TABLE performance_metrics IS 'Tracks performance of every marketing action for learning and optimization';
COMMENT ON TABLE learning_insights IS 'AI-discovered patterns and insights for optimization';
COMMENT ON TABLE product_performance IS 'Time-series performance data for trend analysis and predictions';
COMMENT ON TABLE optimization_actions IS 'Tracks optimization actions taken by the system';
