// Unified Social Media Manager - Centralized API Management
import { TikTokAPI } from './platforms/tiktok.js';
import { InstagramAPI } from './platforms/instagram.js';
import { YouTubeAPI } from './platforms/youtube.js';
import { PinterestAPI } from './platforms/pinterest.js';
import { TwitterAPI } from './platforms/twitter.js';
import { LinkedInAPI } from './platforms/linkedin.js';
import { FacebookAPI } from './platforms/facebook.js';
import { RedditAPI } from './platforms/reddit.js';
import { TelegramAPI } from './platforms/telegram.js';
import { createClient } from '@supabase/supabase-js';

export class SocialMediaManager {
  constructor(credentials = {}) {
    // Initialize all platform APIs
    this.platforms = {
      tiktok: new TikTokAPI(credentials.tiktok),
      instagram: new InstagramAPI(credentials.instagram),
      youtube: new YouTubeAPI(credentials.youtube),
      pinterest: new PinterestAPI(credentials.pinterest),
      twitter: new TwitterAPI(credentials.twitter),
      linkedin: new LinkedInAPI(credentials.linkedin),
      facebook: new FacebookAPI(credentials.facebook),
      reddit: new RedditAPI(credentials.reddit),
      telegram: new TelegramAPI(credentials.telegram)
    };

    // Initialize Supabase for credential management
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Platform priority weights (for automatic selection)
    this.platformWeights = {
      tiktok: 0.35,      // Highest viral potential
      instagram: 0.25,   // Strong engagement
      youtube: 0.20,     // Long-term value
      pinterest: 0.10,   // Passive traffic
      twitter: 0.05,     // Trending topics
      linkedin: 0.05     // B2B audience
    };

    // Optimal posting times by platform
    this.optimalTimes = {
      tiktok: {
        days: [2, 3, 4],              // Tue-Thu
        hours: [15, 18, 21],          // 3PM, 6PM, 9PM
        timezone: 'Europe/Berlin'
      },
      instagram: {
        days: [3, 4, 5],              // Wed-Fri
        hours: [11, 13, 17, 19],      // 11AM, 1PM, 5PM, 7PM
        timezone: 'Europe/Berlin'
      },
      youtube: {
        days: [5, 6, 0],              // Fri-Sun
        hours: [14, 17, 20],          // 2PM, 5PM, 8PM
        timezone: 'Europe/Berlin'
      },
      pinterest: {
        days: [6, 0],                 // Sat-Sun
        hours: [20, 21],              // 8PM, 9PM
        timezone: 'Europe/Berlin'
      },
      twitter: {
        days: [1, 2, 3, 4, 5],        // Mon-Fri
        hours: [12, 15, 18],          // 12PM, 3PM, 6PM
        timezone: 'Europe/Berlin'
      }
    };
  }

  /**
   * Post content to a single platform
   */
  async postTo(platform, content, options = {}) {
    try {
      console.log(`📤 Posting to ${platform}...`);

      if (!this.platforms[platform]) {
        throw new Error(`Platform ${platform} not supported`);
      }

      // Check if platform is authenticated
      const isAuthenticated = await this.isPlatformAuthenticated(platform);
      if (!isAuthenticated) {
        throw new Error(`Platform ${platform} not authenticated`);
      }

      // Format content for platform
      const formattedContent = this.formatContentForPlatform(content, platform);

      // Post to platform
      const result = await this.platforms[platform].post(formattedContent, options);

      // Store post record
      await this.storePostRecord({
        platform,
        content_id: content.id,
        post_id: result.post_id,
        post_url: result.url,
        status: 'published',
        metadata: result
      });

      console.log(`✅ Posted to ${platform}: ${result.url}`);
      return result;

    } catch (error) {
      console.error(`❌ Failed to post to ${platform}:`, error.message);

      // Store failed post record
      await this.storePostRecord({
        platform,
        content_id: content.id,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Post content to multiple platforms
   */
  async postToMultiple(content, platforms = 'all', options = {}) {
    const platformList = platforms === 'all'
      ? Object.keys(this.platforms)
      : Array.isArray(platforms)
      ? platforms
      : [platforms];

    console.log(`📤 Posting to ${platformList.length} platforms...`);

    // Post to all platforms in parallel
    const results = await Promise.allSettled(
      platformList.map(platform =>
        this.postTo(platform, content, options)
      )
    );

    // Process results
    const summary = {
      total: platformList.length,
      successful: 0,
      failed: 0,
      results: []
    };

    results.forEach((result, index) => {
      const platform = platformList[index];

      if (result.status === 'fulfilled') {
        summary.successful++;
        summary.results.push({
          platform,
          status: 'success',
          data: result.value
        });
      } else {
        summary.failed++;
        summary.results.push({
          platform,
          status: 'failed',
          error: result.reason.message
        });
      }
    });

    console.log(`✅ Posted to ${summary.successful}/${summary.total} platforms`);
    return summary;
  }

  /**
   * Get analytics for a post
   */
  async getAnalytics(platform, postId) {
    try {
      if (!this.platforms[platform]) {
        throw new Error(`Platform ${platform} not supported`);
      }

      const analytics = await this.platforms[platform].getAnalytics(postId);

      // Store analytics in database
      await this.storeAnalytics({
        platform,
        post_id: postId,
        analytics
      });

      return analytics;
    } catch (error) {
      console.error(`Failed to get analytics from ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Get analytics for all posts
   */
  async getAllAnalytics(dateRange = 7) {
    const { data: posts } = await this.supabase
      .from('social_media_posts')
      .select('*')
      .gte('posted_at', new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'published');

    const analyticsPromises = posts.map(post =>
      this.getAnalytics(post.platform, post.post_id)
        .catch(error => ({ error: error.message }))
    );

    const analytics = await Promise.all(analyticsPromises);

    // Combine and aggregate
    const aggregated = this.aggregateAnalytics(analytics);

    return {
      posts: analytics,
      aggregated
    };
  }

  /**
   * Aggregate analytics across all platforms
   */
  aggregateAnalytics(analytics) {
    const aggregated = {
      total_views: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_revenue: 0,
      by_platform: {}
    };

    analytics.forEach(data => {
      if (data.error) return;

      aggregated.total_views += data.views || 0;
      aggregated.total_likes += data.likes || 0;
      aggregated.total_comments += data.comments || 0;
      aggregated.total_shares += data.shares || 0;
      aggregated.total_clicks += data.clicks || 0;
      aggregated.total_conversions += data.conversions || 0;
      aggregated.total_revenue += data.revenue || 0;

      // Aggregate by platform
      if (!aggregated.by_platform[data.platform]) {
        aggregated.by_platform[data.platform] = {
          views: 0,
          engagement: 0,
          conversions: 0,
          revenue: 0
        };
      }

      const platformStats = aggregated.by_platform[data.platform];
      platformStats.views += data.views || 0;
      platformStats.engagement += (data.likes || 0) + (data.comments || 0) + (data.shares || 0);
      platformStats.conversions += data.conversions || 0;
      platformStats.revenue += data.revenue || 0;
    });

    // Calculate rates
    aggregated.engagement_rate = aggregated.total_views > 0
      ? (aggregated.total_likes + aggregated.total_comments + aggregated.total_shares) / aggregated.total_views
      : 0;

    aggregated.click_rate = aggregated.total_views > 0
      ? aggregated.total_clicks / aggregated.total_views
      : 0;

    aggregated.conversion_rate = aggregated.total_clicks > 0
      ? aggregated.total_conversions / aggregated.total_clicks
      : 0;

    return aggregated;
  }

  /**
   * Format content for specific platform
   */
  formatContentForPlatform(content, platform) {
    const formatted = { ...content };

    switch (platform) {
      case 'twitter':
        // Twitter has 280 char limit
        if (formatted.caption) {
          formatted.caption = formatted.caption.substring(0, 280);
        }
        break;

      case 'linkedin':
        // LinkedIn prefers professional tone
        if (formatted.caption) {
          formatted.caption = this.makeProfessional(formatted.caption);
        }
        break;

      case 'tiktok':
        // TikTok needs vertical video
        formatted.aspectRatio = '9:16';
        break;

      case 'youtube':
        // YouTube Shorts need title
        if (!formatted.title && formatted.caption) {
          formatted.title = formatted.caption.split('\n')[0].substring(0, 100);
        }
        break;

      case 'pinterest':
        // Pinterest needs image optimization
        if (formatted.media_type === 'video') {
          formatted.thumbnail = formatted.thumbnail || content.keyframes?.[0];
        }
        break;
    }

    return formatted;
  }

  /**
   * Check if optimal time to post
   */
  isOptimalTime(platform, date = new Date()) {
    const times = this.optimalTimes[platform];
    if (!times) return true; // No restrictions

    const day = date.getDay();
    const hour = date.getHours();

    return times.days.includes(day) && times.hours.includes(hour);
  }

  /**
   * Get next optimal posting time
   */
  getNextOptimalTime(platform) {
    const now = new Date();
    const times = this.optimalTimes[platform];
    if (!times) return now;

    // Find next optimal time
    let nextTime = new Date(now);
    let foundTime = false;

    // Check next 7 days
    for (let i = 0; i < 7 * 24; i++) {
      nextTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const day = nextTime.getDay();
      const hour = nextTime.getHours();

      if (times.days.includes(day) && times.hours.includes(hour)) {
        foundTime = true;
        break;
      }
    }

    return foundTime ? nextTime : new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  /**
   * Select best platforms for content
   */
  selectBestPlatforms(content, maxPlatforms = 4) {
    let platforms = Object.keys(this.platforms);

    // Filter based on content type
    if (content.media_type === 'image') {
      platforms = platforms.filter(p => ['instagram', 'pinterest', 'facebook'].includes(p));
    } else if (content.media_type === 'video') {
      if (content.duration && content.duration > 60) {
        // Long video - exclude TikTok
        platforms = platforms.filter(p => p !== 'tiktok');
      }
    }

    // Sort by platform weights
    platforms.sort((a, b) =>
      (this.platformWeights[b] || 0) - (this.platformWeights[a] || 0)
    );

    // Return top N platforms
    return platforms.slice(0, maxPlatforms);
  }

  /**
   * Check if platform is authenticated
   */
  async isPlatformAuthenticated(platform) {
    try {
      const { data } = await this.supabase
        .from('social_media_credentials')
        .select('access_token, expires_at')
        .eq('platform', platform)
        .single();

      if (!data || !data.access_token) return false;

      // Check if token expired
      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Store post record in database
   */
  async storePostRecord(data) {
    try {
      await this.supabase
        .from('social_media_posts')
        .insert({
          platform: data.platform,
          content_id: data.content_id,
          post_id: data.post_id,
          post_url: data.post_url,
          status: data.status,
          error: data.error,
          metadata: data.metadata,
          posted_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store post record:', error);
    }
  }

  /**
   * Store analytics in database
   */
  async storeAnalytics(data) {
    try {
      await this.supabase
        .from('social_media_analytics')
        .upsert({
          platform: data.platform,
          post_id: data.post_id,
          ...data.analytics,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store analytics:', error);
    }
  }

  /**
   * Make text more professional (for LinkedIn)
   */
  makeProfessional(text) {
    // Remove emojis and casual language
    return text
      .replace(/🔥|💰|🚀|❤️|😍|💯/g, '')
      .replace(/OMG|WOW|INSANE|CRAZY/gi, '')
      .replace(/!!!/g, '.')
      .trim();
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    const { data: posts } = await this.supabase
      .from('social_media_posts')
      .select('platform, status')
      .gte('posted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const stats = {};

    Object.keys(this.platforms).forEach(platform => {
      const platformPosts = posts.filter(p => p.platform === platform);
      stats[platform] = {
        total: platformPosts.length,
        successful: platformPosts.filter(p => p.status === 'published').length,
        failed: platformPosts.filter(p => p.status === 'failed').length,
        success_rate: platformPosts.length > 0
          ? platformPosts.filter(p => p.status === 'published').length / platformPosts.length
          : 0
      };
    });

    return stats;
  }
}

export default SocialMediaManager;
