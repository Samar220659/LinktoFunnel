#!/usr/bin/env node

/**
 * 🧠 AUTONOMOUS LEARNING ENGINE
 * Reinforcement Learning System für kontinuierliche Verbesserung
 *
 * Features:
 * - Performance Tracking (Views, Engagement, Conversions)
 * - Marktanalyse (Trending Topics, Hashtags)
 * - Konkurrenzanalyse (Competitor Performance)
 * - Automatische Optimierung (Content Strategy)
 * - A/B Testing
 * - Reward System
 *
 * Der Agent lernt aus jedem Post und wird kontinuierlich besser!
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STATE_FILE = path.join(__dirname, '../../data/learning-state.json');

class LearningEngine {
  constructor() {
    this.state = {
      // Performance History
      posts: [],

      // Strategy Parameters (these will be optimized)
      strategy: {
        best_posting_times: {
          tiktok: [15, 18, 21],
          instagram: [11, 13, 17, 19],
          youtube: [14, 17, 20],
        },
        hook_types: {
          shock: 0.25,      // "Niemand erzählt dir das..."
          curiosity: 0.25,  // "Was wäre wenn..."
          urgency: 0.20,    // "Nur noch heute..."
          benefit: 0.20,    // "So verdienst du..."
          social_proof: 0.10, // "Tausende nutzen bereits..."
        },
        hashtag_categories: {
          trending: 3,      // Use 3 trending hashtags
          niche: 2,         // Use 2 niche-specific
          branded: 1,       // Use 1 branded
        },
        content_length: {
          tiktok: 30,       // 30 seconds optimal
          instagram: 25,
          youtube: 45,
        },
      },

      // Learning Data
      learning: {
        total_posts: 0,
        total_views: 0,
        total_engagement: 0,
        total_conversions: 0,
        avg_engagement_rate: 0,
        avg_conversion_rate: 0,
        improvement_rate: 0,
      },

      // Market Intelligence
      market: {
        trending_topics: [],
        trending_hashtags: [],
        competitor_performance: {},
        last_market_analysis: null,
      },

      // Rewards
      rewards: {
        total_reward: 0,
        last_reward: 0,
        best_reward: 0,
      },

      // Metadata
      initialized_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      version: '1.0',
    };

    this.initialized = false;
  }

  // ===== INITIALIZATION =====

  async init() {
    if (this.initialized) return;

    try {
      await this.load();
      this.initialized = true;
      console.log('🧠 Learning Engine initialized');
    } catch (error) {
      console.error('❌ Learning Engine init error:', error.message);
      this.initialized = true;
    }
  }

  // ===== LEARNING CYCLE =====

  /**
   * Main learning function - call after each post
   * Analyzes performance and adjusts strategy
   */
  async learn(postData) {
    await this.init();

    console.log(`\n🧠 Learning from post: ${postData.id}`);

    // 1. Record post performance
    const performance = await this.recordPerformance(postData);

    // 2. Calculate reward
    const reward = this.calculateReward(performance);

    // 3. Update strategy based on reward
    await this.updateStrategy(postData, performance, reward);

    // 4. Save state
    await this.save();

    console.log(`   Reward: ${reward.toFixed(2)}`);
    console.log(`   Total Posts: ${this.state.learning.total_posts}`);
    console.log(`   Avg Engagement: ${(this.state.learning.avg_engagement_rate * 100).toFixed(2)}%`);

    return {
      reward,
      performance,
      improvements: this.getRecentImprovements(),
    };
  }

  // ===== PERFORMANCE TRACKING =====

  async recordPerformance(postData) {
    const performance = {
      post_id: postData.id,
      platform: postData.platform,
      timestamp: new Date().toISOString(),

      // Content features
      hook_type: this.detectHookType(postData.content?.script?.hook),
      hashtags: postData.content?.script?.hashtags || [],
      posting_hour: new Date().getHours(),

      // Metrics (these would come from platform APIs in production)
      views: postData.metrics?.views || this.estimateMetric('views', postData),
      likes: postData.metrics?.likes || this.estimateMetric('likes', postData),
      comments: postData.metrics?.comments || this.estimateMetric('comments', postData),
      shares: postData.metrics?.shares || this.estimateMetric('shares', postData),
      clicks: postData.metrics?.clicks || this.estimateMetric('clicks', postData),
      conversions: postData.metrics?.conversions || this.estimateMetric('conversions', postData),

      // Calculated
      engagement_rate: 0,
      conversion_rate: 0,
    };

    // Calculate rates
    if (performance.views > 0) {
      performance.engagement_rate =
        (performance.likes + performance.comments + performance.shares) / performance.views;
      performance.conversion_rate = performance.conversions / performance.views;
    }

    // Add to history
    this.state.posts.push(performance);

    // Update learning stats
    this.state.learning.total_posts++;
    this.state.learning.total_views += performance.views;
    this.state.learning.total_engagement +=
      (performance.likes + performance.comments + performance.shares);
    this.state.learning.total_conversions += performance.conversions;

    // Calculate averages
    this.state.learning.avg_engagement_rate =
      this.state.learning.total_engagement / this.state.learning.total_views || 0;
    this.state.learning.avg_conversion_rate =
      this.state.learning.total_conversions / this.state.learning.total_views || 0;

    return performance;
  }

  // ===== REWARD SYSTEM =====

  /**
   * Calculate reward based on post performance
   * Higher reward = better performance
   */
  calculateReward(performance) {
    let reward = 0;

    // Views component (base reward)
    reward += Math.log(performance.views + 1) * 0.2;

    // Engagement component (most important)
    reward += performance.engagement_rate * 10;

    // Conversion component (ultimate goal)
    reward += performance.conversion_rate * 50;

    // Virality bonus (shares)
    reward += Math.log(performance.shares + 1) * 0.5;

    // Update rewards
    this.state.rewards.total_reward += reward;
    this.state.rewards.last_reward = reward;
    if (reward > this.state.rewards.best_reward) {
      this.state.rewards.best_reward = reward;
    }

    return reward;
  }

  // ===== STRATEGY OPTIMIZATION =====

  /**
   * Update strategy based on what works
   */
  async updateStrategy(postData, performance, reward) {
    const avgReward = this.state.rewards.total_reward / this.state.learning.total_posts || 0;

    // Only learn from above-average performance
    if (reward < avgReward) return;

    console.log(`   📈 Above average! Learning from this success...`);

    // 1. Optimize Hook Types
    const hookType = performance.hook_type;
    if (hookType && this.state.strategy.hook_types[hookType]) {
      // Increase probability of successful hook types
      this.state.strategy.hook_types[hookType] *= 1.05;
      this.normalizeHookProbabilities();
    }

    // 2. Optimize Posting Times
    const hour = performance.posting_hour;
    const platform = performance.platform;
    if (platform && this.state.strategy.best_posting_times[platform]) {
      // Add this hour to best times if not already there
      if (!this.state.strategy.best_posting_times[platform].includes(hour)) {
        this.state.strategy.best_posting_times[platform].push(hour);
        // Keep only top 5
        this.state.strategy.best_posting_times[platform] =
          this.state.strategy.best_posting_times[platform].slice(-5);
      }
    }

    // 3. Learn from Hashtags
    // Track successful hashtags for future use
    // (Implementation depends on detailed hashtag tracking)

    // 4. Calculate improvement rate
    if (this.state.posts.length >= 10) {
      const recent10 = this.state.posts.slice(-10);
      const previous10 = this.state.posts.slice(-20, -10);

      if (previous10.length >= 10) {
        const recentAvgEngagement =
          recent10.reduce((sum, p) => sum + p.engagement_rate, 0) / 10;
        const previousAvgEngagement =
          previous10.reduce((sum, p) => sum + p.engagement_rate, 0) / 10;

        this.state.learning.improvement_rate =
          ((recentAvgEngagement - previousAvgEngagement) / previousAvgEngagement) || 0;
      }
    }

    this.state.last_updated = new Date().toISOString();
  }

  // ===== CONTENT GENERATION HELPERS =====

  /**
   * Get optimized hook type based on learning
   */
  getOptimalHookType() {
    const types = Object.keys(this.state.strategy.hook_types);
    const probabilities = Object.values(this.state.strategy.hook_types);

    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      cumulative += probabilities[i];
      if (random < cumulative) {
        return types[i];
      }
    }

    return types[0];
  }

  /**
   * Get optimal posting time for platform
   */
  getOptimalPostingTime(platform) {
    const times = this.state.strategy.best_posting_times[platform] || [12, 15, 18];
    const now = new Date();
    const currentHour = now.getHours();

    // Find next optimal time
    const nextTime = times.find(t => t > currentHour) || times[0];

    const scheduledTime = new Date();
    scheduledTime.setHours(nextTime, 0, 0, 0);

    // If time passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  /**
   * Generate optimized content based on learning
   */
  generateOptimizedContent(productData) {
    const hookType = this.getOptimalHookType();

    // Hook templates by type
    const hookTemplates = {
      shock: [
        '🚨 Niemand erzählt dir das über...',
        '😱 Das verschweigen dir die meisten...',
        '🔥 Die Wahrheit, die keiner hören will...',
      ],
      curiosity: [
        '🤔 Was wäre, wenn du...',
        '❓ Kennst du das Geheimnis von...',
        '💡 Stell dir vor, du könntest...',
      ],
      urgency: [
        '⏰ Nur noch heute:...',
        '🚨 Letzte Chance für...',
        '⚡ Jetzt oder nie:...',
      ],
      benefit: [
        '💰 So verdienst du...',
        '🎯 In 30 Tagen zum...',
        '✨ Erreiche endlich...',
      ],
      social_proof: [
        '✅ Tausende nutzen bereits...',
        '🌟 Das empfehlen Experten:...',
        '📊 #1 Methode für...',
      ],
    };

    const hooks = hookTemplates[hookType] || hookTemplates.benefit;
    const hook = hooks[Math.floor(Math.random() * hooks.length)];

    // Get trending hashtags from market intelligence
    const hashtags = this.getOptimalHashtags(productData.niche);

    return {
      hook,
      hookType,
      hashtags,
      optimizedFor: {
        engagement: true,
        conversion: true,
        learning: this.state.learning.total_posts,
      },
    };
  }

  /**
   * Get optimal hashtags based on learning
   */
  getOptimalHashtags(niche = 'affiliate') {
    // Combine learned successful hashtags with niche-specific ones
    const nicheHashtags = {
      affiliate: ['geldverdienen', 'passiveseinkommen', 'affiliatemarketing', 'onlinebusiness'],
      fitness: ['fitness', 'abnehmen', 'gesundheit', 'workout'],
      finance: ['finanzen', 'geld', 'investieren', 'sparen'],
    };

    const base = nicheHashtags[niche] || nicheHashtags.affiliate;

    // Add trending hashtags from market intelligence
    const trending = this.state.market.trending_hashtags.slice(0, 2);

    // Combine and shuffle
    return [...base.slice(0, 3), ...trending]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  }

  // ===== MARKET ANALYSIS =====

  /**
   * Analyze market trends
   * In production: Call external APIs, scrape data, etc.
   */
  async analyzeMarket() {
    console.log('\n📊 Analyzing market trends...');

    // Simulate market analysis
    // TODO: Implement real market analysis with:
    // - Google Trends API
    // - Social media trend APIs
    // - Competitor scraping
    // - Keyword research APIs

    this.state.market.trending_topics = [
      'passive income 2024',
      'affiliate marketing tips',
      'make money online',
      'side hustle ideas',
    ];

    this.state.market.trending_hashtags = [
      'sidehustle',
      'entrepreneur',
      'onlinegeld',
      'digitalnomad',
    ];

    this.state.market.last_market_analysis = new Date().toISOString();

    await this.save();

    console.log('✅ Market analysis complete');

    return this.state.market;
  }

  // ===== ANALYTICS & INSIGHTS =====

  getPerformanceInsights() {
    const insights = {
      overview: {
        total_posts: this.state.learning.total_posts,
        avg_engagement_rate: (this.state.learning.avg_engagement_rate * 100).toFixed(2) + '%',
        avg_conversion_rate: (this.state.learning.avg_conversion_rate * 100).toFixed(2) + '%',
        improvement_rate: (this.state.learning.improvement_rate * 100).toFixed(2) + '%',
        total_reward: this.state.rewards.total_reward.toFixed(2),
      },
      best_hook_type: this.getBestHookType(),
      best_posting_times: this.state.strategy.best_posting_times,
      trending: {
        topics: this.state.market.trending_topics,
        hashtags: this.state.market.trending_hashtags,
      },
      recent_performance: this.state.posts.slice(-5).map(p => ({
        post_id: p.post_id,
        engagement_rate: (p.engagement_rate * 100).toFixed(2) + '%',
        conversion_rate: (p.conversion_rate * 100).toFixed(2) + '%',
      })),
    };

    return insights;
  }

  getBestHookType() {
    const types = this.state.strategy.hook_types;
    const best = Object.keys(types).reduce((a, b) =>
      types[a] > types[b] ? a : b
    );
    return best;
  }

  getRecentImprovements() {
    return {
      improvement_rate: this.state.learning.improvement_rate,
      best_reward: this.state.rewards.best_reward,
      learning_progress: this.state.learning.total_posts,
    };
  }

  // ===== UTILITIES =====

  detectHookType(hook) {
    if (!hook) return 'benefit';

    const lower = hook.toLowerCase();

    if (lower.includes('niemand') || lower.includes('verschweigen') || lower.includes('wahrheit')) {
      return 'shock';
    } else if (lower.includes('was wäre') || lower.includes('stell dir vor') || lower.includes('geheimnis')) {
      return 'curiosity';
    } else if (lower.includes('jetzt') || lower.includes('heute') || lower.includes('letzte chance')) {
      return 'urgency';
    } else if (lower.includes('tausende') || lower.includes('experten') || lower.includes('#1')) {
      return 'social_proof';
    } else {
      return 'benefit';
    }
  }

  estimateMetric(metricName, postData) {
    // Simulate metrics for testing
    // In production, fetch real metrics from platform APIs

    const baseMetrics = {
      views: 1000 + Math.random() * 5000,
      likes: 50 + Math.random() * 200,
      comments: 5 + Math.random() * 30,
      shares: 2 + Math.random() * 20,
      clicks: 30 + Math.random() * 100,
      conversions: Math.random() * 5,
    };

    return Math.floor(baseMetrics[metricName] || 0);
  }

  normalizeHookProbabilities() {
    const total = Object.values(this.state.strategy.hook_types)
      .reduce((sum, val) => sum + val, 0);

    for (const type in this.state.strategy.hook_types) {
      this.state.strategy.hook_types[type] /= total;
    }
  }

  // ===== PERSISTENCE =====

  async save() {
    try {
      const dir = path.dirname(STATE_FILE);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(
        STATE_FILE,
        JSON.stringify(this.state, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Save learning state error:', error.message);
    }
  }

  async load() {
    try {
      const data = await fs.readFile(STATE_FILE, 'utf-8');
      this.state = { ...this.state, ...JSON.parse(data) };
      console.log(`🧠 Loaded learning state (${this.state.learning.total_posts} posts)`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('❌ Load learning state error:', error.message);
      }
      // Use default state
    }
  }
}

// Singleton instance
let engineInstance = null;

function getLearningEngine() {
  if (!engineInstance) {
    engineInstance = new LearningEngine();
  }
  return engineInstance;
}

module.exports = { LearningEngine, getLearningEngine };

// ===== CLI TESTING =====
if (require.main === module) {
  (async () => {
    const engine = new LearningEngine();
    await engine.init();

    console.log('\n🧪 Testing Learning Engine\n');

    // Simulate learning from posts
    for (let i = 0; i < 5; i++) {
      const mockPost = {
        id: `post_${i}`,
        platform: ['tiktok', 'instagram', 'youtube'][i % 3],
        content: {
          script: {
            hook: ['🚨 Niemand erzählt dir das...', '💰 So verdienst du...', '🤔 Was wäre wenn...'][i % 3],
          },
        },
        metrics: {
          views: 1000 + Math.random() * 5000,
          likes: 50 + Math.random() * 200,
          comments: 5 + Math.random() * 30,
          shares: 2 + Math.random() * 20,
          conversions: Math.random() * 5,
        },
      };

      const result = await engine.learn(mockPost);
      console.log(`\nPost ${i + 1} learned! Reward: ${result.reward.toFixed(2)}`);
    }

    // Get insights
    console.log('\n📊 Performance Insights:');
    const insights = engine.getPerformanceInsights();
    console.log(JSON.stringify(insights, null, 2));

    // Generate optimized content
    console.log('\n🎯 Generating optimized content...');
    const optimized = engine.generateOptimizedContent({ niche: 'affiliate' });
    console.log(optimized);

    console.log('\n✅ Learning Engine tests complete!\n');
  })().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
