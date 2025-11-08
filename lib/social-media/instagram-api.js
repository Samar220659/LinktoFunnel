#!/usr/bin/env node

/**
 * 📸 INSTAGRAM API INTEGRATION
 * Real Instagram Reels posting using Instagram Graph API
 *
 * Features:
 * - Reels upload (video)
 * - Stories posting
 * - Feed posts
 * - Analytics & insights
 * - Hashtag optimization
 *
 * Requirements:
 * - Facebook Business Account
 * - Instagram Business/Creator Account
 * - Facebook Graph API Access Token
 */

const fs = require('fs').promises;

class InstagramAPI {
  constructor(config = {}) {
    this.accessToken = config.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
    this.businessAccountId = config.businessAccountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.apiVersion = 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Post a Reel to Instagram
   */
  async postReel(videoUrl, options = {}) {
    console.log('📤 Uploading Reel to Instagram...');

    try {
      // Step 1: Create media container
      const containerId = await this.createReelContainer(videoUrl, options);

      // Step 2: Check container status
      await this.waitForContainerReady(containerId);

      // Step 3: Publish container
      const result = await this.publishContainer(containerId);

      console.log('✅ Reel posted to Instagram successfully!');
      return result;

    } catch (error) {
      console.error('❌ Instagram Reel posting failed:', error.message);
      throw error;
    }
  }

  async createReelContainer(videoUrl, options) {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      media_type: 'REELS',
      video_url: videoUrl,
      caption: options.caption || '',
      share_to_feed: options.shareToFeed !== false,
      ...(options.coverUrl && { cover_url: options.coverUrl })
    });

    const response = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/media?${params}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Reel container: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.id;
  }

  async waitForContainerReady(containerId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getContainerStatus(containerId);

      if (status === 'FINISHED') {
        return true;
      } else if (status === 'ERROR') {
        throw new Error('Container processing failed');
      }

      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log(`⏳ Waiting for video processing... (${i + 1}/${maxAttempts})`);
    }

    throw new Error('Container processing timeout');
  }

  async getContainerStatus(containerId) {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: 'status_code'
    });

    const response = await fetch(
      `${this.baseUrl}/${containerId}?${params}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get container status: ${response.status}`);
    }

    const data = await response.json();
    return data.status_code;
  }

  async publishContainer(containerId) {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      creation_id: containerId
    });

    const response = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/media_publish?${params}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to publish Reel: ${error.error?.message || response.status}`);
    }

    return await response.json();
  }

  /**
   * Post a Story to Instagram
   */
  async postStory(mediaUrl, options = {}) {
    console.log('📤 Uploading Story to Instagram...');

    const isVideo = options.mediaType === 'video';

    const params = new URLSearchParams({
      access_token: this.accessToken,
      media_type: 'STORIES',
      ...(isVideo ? { video_url: mediaUrl } : { image_url: mediaUrl })
    });

    const response = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/media?${params}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Story: ${error.error?.message || response.status}`);
    }

    const container = await response.json();

    // Wait and publish
    if (isVideo) {
      await this.waitForContainerReady(container.id);
    }

    return await this.publishContainer(container.id);
  }

  /**
   * Get account insights
   */
  async getInsights(metrics = ['impressions', 'reach', 'profile_views']) {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      metric: metrics.join(','),
      period: 'day'
    });

    const response = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/insights?${params}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get insights: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get media insights (for a specific post)
   */
  async getMediaInsights(mediaId) {
    const metrics = [
      'impressions',
      'reach',
      'saved',
      'video_views',
      'likes',
      'comments',
      'shares',
      'plays',
      'total_interactions'
    ];

    const params = new URLSearchParams({
      access_token: this.accessToken,
      metric: metrics.join(',')
    });

    const response = await fetch(
      `${this.baseUrl}/${mediaId}/insights?${params}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get media insights: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user's recent media
   */
  async getRecentMedia(limit = 10) {
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
      limit
    });

    const response = await fetch(
      `${this.baseUrl}/${this.businessAccountId}/media?${params}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get recent media: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Optimize hashtags for Instagram
   */
  optimizeHashtags(baseHashtags, niche) {
    const nicheHashtags = {
      'affiliate-marketing': [
        'affiliatemarketing', 'passiveincome', 'onlinebusiness',
        'makemoneyonline', 'digitalmarketing', 'entrepreneurship',
        'sidehustle', 'workfromhome', 'financialfreedom'
      ],
      'health-fitness': [
        'fitness', 'health', 'wellness', 'workout', 'fitnessmotivation',
        'healthylifestyle', 'nutrition', 'weightloss', 'fitfam'
      ],
      'personal-development': [
        'personaldevelopment', 'selfimprovement', 'mindset', 'motivation',
        'success', 'growthmindset', 'lifecoach', 'inspiration'
      ],
      'default': [
        'reels', 'viral', 'trending', 'explore', 'instagood'
      ]
    };

    const viralHashtags = ['reels', 'reelsinstagram', 'viral', 'trending', 'explore'];
    const relevantNiche = nicheHashtags[niche] || nicheHashtags.default;

    // Instagram allows up to 30 hashtags, but 10-15 is optimal
    return [
      ...viralHashtags.slice(0, 3),
      ...relevantNiche.slice(0, 7),
      ...baseHashtags.slice(0, 5)
    ].slice(0, 15);
  }

  /**
   * Format caption with hashtags (Instagram best practices)
   */
  formatCaption(text, hashtags) {
    // Put hashtags in comment or at end with line breaks
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
    return `${text}\n\n.\n.\n.\n${hashtagString}`;
  }

  /**
   * Upload video to a hosting service (required for Instagram API)
   */
  async uploadVideoToHost(videoPath) {
    // In production, upload to:
    // - AWS S3
    // - Google Cloud Storage
    // - Cloudinary
    // - Your own server

    // For now, return a placeholder
    // YOU MUST implement actual video hosting!
    console.warn('⚠️  Video hosting not implemented. Upload video to public URL first!');
    throw new Error('Video must be hosted on a public URL for Instagram API');
  }
}

// ===== INSTAGRAM CONTENT STRATEGY =====

class InstagramStrategy {
  /**
   * Best times to post on Instagram (DACH timezone)
   */
  getBestPostingTimes() {
    return {
      monday: ['08:00', '12:00', '19:00'],
      tuesday: ['08:00', '12:00', '19:00'],
      wednesday: ['08:00', '12:00', '19:00'],
      thursday: ['08:00', '12:00', '19:00'],
      friday: ['08:00', '12:00', '17:00'],
      saturday: ['10:00', '14:00', '20:00'],
      sunday: ['10:00', '14:00', '20:00']
    };
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(likes, comments, followers) {
    return ((likes + comments) / followers) * 100;
  }

  /**
   * Suggest posting frequency
   */
  getSuggestedFrequency(followerCount) {
    if (followerCount < 1000) return { reels: 2, stories: 3 }; // per day
    if (followerCount < 10000) return { reels: 3, stories: 5 };
    return { reels: 4, stories: 7 };
  }
}

module.exports = {
  InstagramAPI,
  InstagramStrategy
};

// ===== CLI USAGE =====
if (require.main === module) {
  const instagram = new InstagramAPI();

  // Example: Get insights
  instagram.getInsights()
    .then(insights => {
      console.log('📊 Instagram Insights:', insights);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
    });
}
