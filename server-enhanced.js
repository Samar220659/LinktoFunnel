// Enhanced API Server - Unified Endpoint System
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OAuthManager from './ai-agent/core/oauth-manager.js';
import SocialMediaManager from './ai-agent/integrations/social-media-manager.js';
import BaseAgent from './ai-agent/core/base-agent.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize services
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const oauthManager = new OAuthManager();
const socialMediaManager = new SocialMediaManager();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'LinktoFunnel API',
    version: '2.0.0',
    description: 'AI-powered social media automation system',
    endpoints: {
      health: '/health',
      oauth: '/auth/*',
      content: '/api/content/*',
      agents: '/api/agents/*',
      social: '/api/social/*',
      analytics: '/api/analytics/*'
    }
  });
});

// ==================== OAUTH AUTHENTICATION ====================

/**
 * Get OAuth authorization URL for a platform
 * GET /auth/:platform/authorize
 */
app.get('/auth/:platform/authorize', async (req, res) => {
  try {
    const { platform } = req.params;
    const { user_id } = req.query;

    const redirectUri = `${req.protocol}://${req.get('host')}/auth/${platform}/callback`;

    const { url, state } = await oauthManager.getAuthorizationUrl(
      platform,
      redirectUri,
      user_id
    );

    res.json({
      success: true,
      authorization_url: url,
      state: state
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Handle OAuth callback
 * GET /auth/:platform/callback
 */
app.get('/auth/:platform/callback', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state } = req.query;

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/auth/${platform}/callback`;

    const result = await oauthManager.handleCallback(
      platform,
      code,
      state,
      redirectUri
    );

    // Redirect to success page
    res.redirect(`/dashboard?auth=success&platform=${platform}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`/dashboard?auth=error&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Get authenticated platforms
 * GET /auth/platforms
 */
app.get('/auth/platforms', async (req, res) => {
  try {
    const { user_id = 'default' } = req.query;

    const platforms = await oauthManager.getAuthenticatedPlatforms(user_id);

    res.json({
      success: true,
      platforms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Delete platform credentials
 * DELETE /auth/:platform
 */
app.delete('/auth/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { user_id = 'default' } = req.query;

    await oauthManager.deleteCredentials(platform, user_id);

    res.json({
      success: true,
      message: `Disconnected from ${platform}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CONTENT MANAGEMENT ====================

/**
 * Get generated content
 * GET /api/content
 */
app.get('/api/content', async (req, res) => {
  try {
    const { status = 'ready', limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      success: true,
      content: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get content by ID
 * GET /api/content/:id
 */
app.get('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      content: data
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create content manually
 * POST /api/content
 */
app.post('/api/content', async (req, res) => {
  try {
    const contentData = req.body;

    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        ...contentData,
        status: 'ready',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      content: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== SOCIAL MEDIA POSTING ====================

/**
 * Post content to social media
 * POST /api/social/post
 */
app.post('/api/social/post', async (req, res) => {
  try {
    const { content_id, platforms = 'all' } = req.body;

    // Get content
    const { data: content, error: contentError } = await supabase
      .from('generated_content')
      .select('*')
      .eq('id', content_id)
      .single();

    if (contentError) throw contentError;

    // Post to platforms
    const result = await socialMediaManager.postToMultiple(content, platforms);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Post to specific platform
 * POST /api/social/:platform/post
 */
app.post('/api/social/:platform/post', async (req, res) => {
  try {
    const { platform } = req.params;
    const { content_id } = req.body;

    // Get content
    const { data: content, error: contentError } = await supabase
      .from('generated_content')
      .select('*')
      .eq('id', content_id)
      .single();

    if (contentError) throw contentError;

    // Post to platform
    const result = await socialMediaManager.postTo(platform, content);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get post analytics
 * GET /api/social/:platform/analytics/:post_id
 */
app.get('/api/social/:platform/analytics/:post_id', async (req, res) => {
  try {
    const { platform, post_id } = req.params;

    const analytics = await socialMediaManager.getAnalytics(platform, post_id);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all analytics
 * GET /api/social/analytics
 */
app.get('/api/social/analytics', async (req, res) => {
  try {
    const { date_range = 7 } = req.query;

    const analytics = await socialMediaManager.getAllAnalytics(parseInt(date_range));

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get platform stats
 * GET /api/social/stats
 */
app.get('/api/social/stats', async (req, res) => {
  try {
    const stats = await socialMediaManager.getPlatformStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== AI AGENTS ====================

/**
 * Trigger product scout agent
 * POST /api/agents/scout
 */
app.post('/api/agents/scout', async (req, res) => {
  try {
    // Import and run agent
    const { default: ProductScoutAgent } = await import('./ai-agent/agents/product-scout.js');
    const agent = new ProductScoutAgent();

    // Run single cycle
    const result = await agent.run({ singleRun: true });

    res.json({
      success: true,
      agent: 'product-scout',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Trigger content creator agent
 * POST /api/agents/create-content
 */
app.post('/api/agents/create-content', async (req, res) => {
  try {
    const { product_id } = req.body;

    // Import and run agent
    const { default: ViralContentCreatorAgent } = await import('./ai-agent/agents/viral-content-creator.js');
    const agent = new ViralContentCreatorAgent();

    const result = await agent.run({ singleRun: true, product_id });

    res.json({
      success: true,
      agent: 'content-creator',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Trigger publisher agent
 * POST /api/agents/publish
 */
app.post('/api/agents/publish', async (req, res) => {
  try {
    // Import and run agent
    const { default: MultiPlatformPublisherAgent } = await import('./ai-agent/agents/cross-poster.js');
    const agent = new MultiPlatformPublisherAgent();

    const result = await agent.run({ singleRun: true });

    res.json({
      success: true,
      agent: 'publisher',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get agent metrics
 * GET /api/agents/metrics
 */
app.get('/api/agents/metrics', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rl_learning')
      .select('agent_name, reward, timestamp')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Aggregate by agent
    const agentMetrics = {};

    data.forEach(record => {
      if (!agentMetrics[record.agent_name]) {
        agentMetrics[record.agent_name] = {
          total_runs: 0,
          total_reward: 0,
          avg_reward: 0
        };
      }

      agentMetrics[record.agent_name].total_runs++;
      agentMetrics[record.agent_name].total_reward += record.reward;
    });

    // Calculate averages
    Object.keys(agentMetrics).forEach(agent => {
      agentMetrics[agent].avg_reward =
        agentMetrics[agent].total_reward / agentMetrics[agent].total_runs;
    });

    res.json({
      success: true,
      metrics: agentMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ANALYTICS ====================

/**
 * Get dashboard analytics
 * GET /api/analytics/dashboard
 */
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const { date_range = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(date_range) * 24 * 60 * 60 * 1000);

    // Get daily analytics
    const { data: dailyData, error: dailyError } = await supabase
      .from('analytics_daily')
      .select('*')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: false });

    if (dailyError) throw dailyError;

    // Calculate totals
    const totals = {
      revenue: dailyData.reduce((sum, day) => sum + (day.revenue || 0), 0),
      conversions: dailyData.reduce((sum, day) => sum + (day.conversions || 0), 0),
      clicks: dailyData.reduce((sum, day) => sum + (day.clicks || 0), 0),
      posts: dailyData.reduce((sum, day) => sum + (day.posts_count || 0), 0),
      avg_conversion_rate: dailyData.reduce((sum, day) => sum + (day.conversion_rate || 0), 0) / dailyData.length
    };

    // Get platform breakdown
    const { data: platformData, error: platformError } = await supabase
      .from('social_media_posts')
      .select('platform, status')
      .gte('posted_at', startDate.toISOString());

    if (platformError) throw platformError;

    const platformBreakdown = {};
    platformData.forEach(post => {
      if (!platformBreakdown[post.platform]) {
        platformBreakdown[post.platform] = { total: 0, published: 0, failed: 0 };
      }
      platformBreakdown[post.platform].total++;
      if (post.status === 'published') platformBreakdown[post.platform].published++;
      if (post.status === 'failed') platformBreakdown[post.platform].failed++;
    });

    res.json({
      success: true,
      totals,
      daily: dailyData,
      platforms: platformBreakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get revenue analytics
 * GET /api/analytics/revenue
 */
app.get('/api/analytics/revenue', async (req, res) => {
  try {
    const { date_range = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(date_range) * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('analytics_daily')
      .select('date, revenue, conversions, conversion_rate')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    const summary = {
      total_revenue: data.reduce((sum, day) => sum + day.revenue, 0),
      total_conversions: data.reduce((sum, day) => sum + day.conversions, 0),
      avg_conversion_rate: data.reduce((sum, day) => sum + day.conversion_rate, 0) / data.length,
      daily_data: data
    };

    res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== PRODUCTS ====================

/**
 * Get products
 * GET /api/products
 */
app.get('/api/products', async (req, res) => {
  try {
    const { status = 'active', limit = 20 } = req.query;

    const { data, error } = await supabase
      .from('digistore_products')
      .select('*')
      .eq('status', status)
      .order('ai_score', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      success: true,
      products: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);

  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// ==================== START SERVER ====================

app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║        🚀 LinktoFunnel API Server v2.0           ║
║                                                   ║
║   AI-Powered Social Media Automation System      ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║   Server:      http://localhost:${port}            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   Status:      Running ✅                         ║
║                                                   ║
║   Endpoints:                                      ║
║   - GET  /health                                  ║
║   - GET  /auth/:platform/authorize                ║
║   - POST /api/social/post                         ║
║   - POST /api/agents/*                            ║
║   - GET  /api/analytics/dashboard                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
