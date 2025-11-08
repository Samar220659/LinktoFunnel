#!/usr/bin/env node

/**
 * 🚀 UNIFIED MULTI-PLATFORM POSTER
 * Post to TikTok, Instagram, YouTube Shorts simultaneously
 *
 * Features:
 * - Single API for all platforms
 * - Automatic platform optimization
 * - Analytics aggregation
 * - Error handling & retries
 * - Queue management
 */

const { TikTokAPI } = require('./tiktok-api');
const { InstagramAPI } = require('./instagram-api');
const { YouTubeAPI } = require('./youtube-api');
const { VideoGenerator } = require('../video-generator');
const fs = require('fs').promises;
const path = require('path');

class UnifiedPoster {
  constructor(config = {}) {
    this.tiktok = new TikTokAPI(config.tiktok);
    this.instagram = new InstagramAPI(config.instagram);
    this.youtube = new YouTubeAPI(config.youtube);
    this.videoGenerator = new VideoGenerator(config.video);

    this.platforms = {
      tiktok: { enabled: !!config.tiktok?.accessToken, api: this.tiktok },
      instagram: { enabled: !!config.instagram?.accessToken, api: this.instagram },
      youtube: { enabled: !!config.youtube?.credentials, api: this.youtube }
    };
  }

  /**
   * Post to all enabled platforms
   */
  async postToAllPlatforms(videoPath, content, options = {}) {
    console.log('\n🚀 Starting multi-platform posting...\n');

    const results = {
      success: [],
      failed: [],
      timestamp: new Date().toISOString()
    };

    // Post to each enabled platform
    for (const [platform, config] of Object.entries(this.platforms)) {
      if (!config.enabled) {
        console.log(`⏭️  ${platform}: Skipped (not configured)`);
        continue;
      }

      if (options.platforms && !options.platforms.includes(platform)) {
        console.log(`⏭️  ${platform}: Skipped (not selected)`);
        continue;
      }

      try {
        console.log(`📤 Posting to ${platform}...`);

        const result = await this.postToPlatform(
          platform,
          videoPath,
          content,
          options
        );

        results.success.push({
          platform,
          ...result
        });

        console.log(`✅ ${platform}: Posted successfully!`);

      } catch (error) {
        console.error(`❌ ${platform}: Failed - ${error.message}`);

        results.failed.push({
          platform,
          error: error.message
        });
      }

      // Rate limiting: Wait between platform posts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log('\n📊 Posting Summary:');
    console.log(`   ✅ Success: ${results.success.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    console.log('');

    return results;
  }

  /**
   * Post to a specific platform
   */
  async postToPlatform(platform, videoPath, content, options) {
    switch (platform) {
      case 'tiktok':
        return await this.postToTikTok(videoPath, content, options);

      case 'instagram':
        return await this.postToInstagram(videoPath, content, options);

      case 'youtube':
        return await this.postToYouTube(videoPath, content, options);

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  async postToTikTok(videoPath, content, options) {
    const hashtags = this.tiktok.optimizeHashtags(
      content.hashtags || [],
      content.niche || 'default'
    );

    const caption = this.tiktok.formatCaption(
      content.caption || content.script?.hook || '',
      hashtags
    );

    const result = await this.tiktok.postVideo(videoPath, {
      caption,
      privacyLevel: options.privacy || 'PUBLIC_TO_EVERYONE',
      disableComment: options.disableComment || false
    });

    return {
      postId: result.data?.publish_id,
      url: result.data?.share_url,
      platform: 'tiktok'
    };
  }

  async postToInstagram(videoPath, content, options) {
    // Instagram requires public URL - upload video first
    const videoUrl = await this.uploadToPublicStorage(videoPath);

    const hashtags = this.instagram.optimizeHashtags(
      content.hashtags || [],
      content.niche || 'default'
    );

    const caption = this.instagram.formatCaption(
      content.caption || content.script?.hook || '',
      hashtags
    );

    const result = await this.instagram.postReel(videoUrl, {
      caption,
      shareToFeed: options.shareToFeed !== false
    });

    return {
      postId: result.id,
      platform: 'instagram'
    };
  }

  async postToYouTube(videoPath, content, options) {
    const hashtags = this.youtube.optimizeHashtags(
      content.hashtags || [],
      content.niche || 'default'
    );

    const title = this.youtube.optimizeTitle(
      content.title || content.script?.hook || 'My YouTube Short',
      hashtags.slice(0, 3)
    );

    const description = this.youtube.formatDescription(
      content.description || content.script?.value || '',
      hashtags,
      content.affiliateLink
    );

    const result = await this.youtube.uploadShort(videoPath, {
      title,
      description,
      tags: hashtags,
      privacyStatus: options.privacy || 'public',
      categoryId: options.categoryId || '22'
    });

    return {
      postId: result.videoId,
      url: result.videoUrl,
      platform: 'youtube'
    };
  }

  /**
   * Generate video and post to all platforms
   */
  async generateAndPost(productData, options = {}) {
    console.log('\n🎬 Generating video for multi-platform posting...\n');

    try {
      // Step 1: Generate video
      const videoResult = await this.videoGenerator.generateVideo(
        productData,
        { platform: 'tiktok', duration: 30 }
      );

      console.log(`✅ Video generated: ${videoResult.videoPath}`);

      // Step 2: Post to all platforms
      const postingResults = await this.postToAllPlatforms(
        videoResult.videoPath,
        {
          caption: `${videoResult.script.hook} ${videoResult.script.value}`,
          title: videoResult.script.hook,
          description: videoResult.script.value,
          hashtags: videoResult.script.hashtags || [],
          script: videoResult.script,
          niche: productData.niche,
          affiliateLink: productData.affiliateLink
        },
        options
      );

      // Step 3: Clean up (optional)
      if (options.cleanup) {
        await this.videoGenerator.cleanup(videoResult.videoId);
      }

      return {
        video: videoResult,
        posts: postingResults
      };

    } catch (error) {
      console.error('❌ Generate and post failed:', error.message);
      throw error;
    }
  }

  /**
   * Get aggregated analytics from all platforms
   */
  async getAggregatedAnalytics() {
    const analytics = {
      tiktok: null,
      instagram: null,
      youtube: null,
      timestamp: new Date().toISOString()
    };

    // TikTok analytics
    if (this.platforms.tiktok.enabled) {
      try {
        analytics.tiktok = await this.tiktok.getUserInfo();
      } catch (error) {
        console.error('Failed to get TikTok analytics:', error.message);
      }
    }

    // Instagram analytics
    if (this.platforms.instagram.enabled) {
      try {
        analytics.instagram = await this.instagram.getInsights();
      } catch (error) {
        console.error('Failed to get Instagram analytics:', error.message);
      }
    }

    // YouTube analytics
    if (this.platforms.youtube.enabled) {
      try {
        analytics.youtube = await this.youtube.getChannelAnalytics();
      } catch (error) {
        console.error('Failed to get YouTube analytics:', error.message);
      }
    }

    return this.calculateTotalMetrics(analytics);
  }

  calculateTotalMetrics(analytics) {
    const totals = {
      totalFollowers: 0,
      totalViews: 0,
      totalPosts: 0,
      platforms: analytics
    };

    if (analytics.tiktok?.data?.user) {
      totals.totalFollowers += analytics.tiktok.data.user.follower_count || 0;
      totals.totalPosts += analytics.tiktok.data.user.video_count || 0;
    }

    if (analytics.instagram?.data) {
      // Instagram insights structure varies
      totals.totalViews += this.extractInstagramViews(analytics.instagram.data);
    }

    if (analytics.youtube) {
      totals.totalFollowers += analytics.youtube.subscribers || 0;
      totals.totalViews += analytics.youtube.totalViews || 0;
      totals.totalPosts += analytics.youtube.totalVideos || 0;
    }

    return totals;
  }

  extractInstagramViews(data) {
    // Extract total views from Instagram insights
    const viewsMetric = data.find(m => m.name === 'impressions');
    return viewsMetric?.values?.[0]?.value || 0;
  }

  /**
   * Upload video to public storage (placeholder)
   */
  async uploadToPublicStorage(videoPath) {
    // TODO: Implement actual upload to:
    // - AWS S3
    // - Google Cloud Storage
    // - Cloudinary
    // - Your own server with public URL

    console.warn('⚠️  Public storage upload not implemented');
    console.warn('⚠️  For Instagram, you must host videos on a public URL');

    throw new Error('Video hosting not configured. Set up public storage for Instagram.');
  }

  /**
   * Get enabled platforms
   */
  getEnabledPlatforms() {
    return Object.entries(this.platforms)
      .filter(([_, config]) => config.enabled)
      .map(([platform]) => platform);
  }

  /**
   * Check platform status
   */
  async checkPlatformStatus() {
    const status = {};

    for (const [platform, config] of Object.entries(this.platforms)) {
      status[platform] = {
        enabled: config.enabled,
        configured: config.enabled,
        healthy: false
      };

      if (config.enabled) {
        try {
          // Try to get basic info to verify connection
          if (platform === 'tiktok') {
            await config.api.getUserInfo();
          } else if (platform === 'instagram') {
            await config.api.getInsights(['impressions']);
          } else if (platform === 'youtube') {
            await config.api.getChannelAnalytics();
          }
          status[platform].healthy = true;
        } catch (error) {
          status[platform].error = error.message;
        }
      }
    }

    return status;
  }
}

// ===== BATCH PROCESSOR =====

class BatchProcessor {
  constructor(unifiedPoster) {
    this.poster = unifiedPoster;
    this.queue = [];
    this.results = [];
  }

  /**
   * Add job to queue
   */
  addJob(productData, options) {
    this.queue.push({
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productData,
      options,
      status: 'pending',
      addedAt: new Date()
    });
  }

  /**
   * Process entire queue
   */
  async processQueue(options = {}) {
    console.log(`\n📦 Processing ${this.queue.length} jobs...\n`);

    const delay = options.delay || 60000; // 1 minute between jobs by default

    for (const job of this.queue) {
      if (job.status !== 'pending') continue;

      console.log(`\n▶️  Processing job: ${job.id}`);
      job.status = 'processing';
      job.startedAt = new Date();

      try {
        const result = await this.poster.generateAndPost(
          job.productData,
          job.options
        );

        job.status = 'completed';
        job.result = result;
        job.completedAt = new Date();

        this.results.push(job);

        console.log(`✅ Job completed: ${job.id}\n`);

      } catch (error) {
        job.status = 'failed';
        job.error = error.message;
        job.failedAt = new Date();

        console.error(`❌ Job failed: ${job.id} - ${error.message}\n`);
      }

      // Wait between jobs
      if (this.queue.indexOf(job) < this.queue.length - 1) {
        console.log(`⏳ Waiting ${delay / 1000}s before next job...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return this.getQueueSummary();
  }

  getQueueSummary() {
    return {
      total: this.queue.length,
      completed: this.queue.filter(j => j.status === 'completed').length,
      failed: this.queue.filter(j => j.status === 'failed').length,
      pending: this.queue.filter(j => j.status === 'pending').length,
      results: this.results
    };
  }
}

module.exports = {
  UnifiedPoster,
  BatchProcessor
};

// ===== CLI USAGE =====
if (require.main === module) {
  const poster = new UnifiedPoster({
    tiktok: {
      accessToken: process.env.TIKTOK_ACCESS_TOKEN
    },
    instagram: {
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    },
    youtube: {
      credentials: process.env.YOUTUBE_CREDENTIALS ? JSON.parse(process.env.YOUTUBE_CREDENTIALS) : null
    }
  });

  // Check platform status
  poster.checkPlatformStatus()
    .then(status => {
      console.log('\n📊 Platform Status:');
      console.log(JSON.stringify(status, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
