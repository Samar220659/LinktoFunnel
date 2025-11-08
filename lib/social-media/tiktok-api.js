#!/usr/bin/env node

/**
 * 🎵 TIKTOK API INTEGRATION
 * Real TikTok posting using TikTok Content Posting API
 *
 * Features:
 * - Video upload
 * - Direct posting
 * - Analytics retrieval
 * - Hashtag optimization
 *
 * Requirements:
 * - TikTok Developer Account
 * - Content Posting API access
 * - Access Token
 */

const fs = require('fs').promises;
const FormData = require('form-data');

class TikTokAPI {
  constructor(config = {}) {
    this.accessToken = config.accessToken || process.env.TIKTOK_ACCESS_TOKEN;
    this.apiVersion = 'v2';
    this.baseUrl = `https://open.tiktokapis.com/${this.apiVersion}`;
  }

  /**
   * Upload and post video to TikTok
   */
  async postVideo(videoPath, options = {}) {
    console.log('📤 Uploading video to TikTok...');

    try {
      // Step 1: Initialize upload
      const initResponse = await this.initializeUpload(options);
      const uploadUrl = initResponse.data.upload_url;
      const publishId = initResponse.data.publish_id;

      // Step 2: Upload video file
      await this.uploadVideoFile(uploadUrl, videoPath);

      // Step 3: Publish post
      const result = await this.publishPost(publishId, options);

      console.log('✅ Video posted to TikTok successfully!');
      return result;

    } catch (error) {
      console.error('❌ TikTok posting failed:', error.message);
      throw error;
    }
  }

  async initializeUpload(options) {
    const response = await fetch(`${this.baseUrl}/post/publish/inbox/video/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: options.videoSize || await this.getFileSize(options.videoPath),
          chunk_size: 10 * 1024 * 1024, // 10MB chunks
          total_chunk_count: 1
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`TikTok init upload failed: ${error.message || response.status}`);
    }

    return await response.json();
  }

  async uploadVideoFile(uploadUrl, videoPath) {
    const videoBuffer = await fs.readFile(videoPath);

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length
      },
      body: videoBuffer
    });

    if (!response.ok) {
      throw new Error(`TikTok video upload failed: ${response.status}`);
    }

    return true;
  }

  async publishPost(publishId, options) {
    const postData = {
      post_info: {
        title: options.caption || '',
        privacy_level: options.privacyLevel || 'PUBLIC_TO_EVERYONE',
        disable_duet: options.disableDuet || false,
        disable_stitch: options.disableStitch || false,
        disable_comment: options.disableComment || false,
        video_cover_timestamp_ms: options.coverTimestamp || 1000
      },
      source_info: {
        source: 'FILE_UPLOAD',
        publish_id: publishId
      }
    };

    const response = await fetch(`${this.baseUrl}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`TikTok publish failed: ${error.message || response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user profile analytics
   */
  async getUserInfo() {
    const response = await fetch(`${this.baseUrl}/user/info/?fields=display_name,avatar_url,follower_count,following_count,likes_count,video_count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId) {
    const response = await fetch(`${this.baseUrl}/video/query/?fields=id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filters: {
          video_ids: [videoId]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get video analytics: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Optimize hashtags for TikTok algorithm
   */
  optimizeHashtags(baseHashtags, niche) {
    const nicheHashtags = {
      'affiliate-marketing': ['affiliatemarketing', 'onlinebusiness', 'passiveincome', 'geldverdienen', 'onlinegeld'],
      'health-fitness': ['gesundheit', 'fitness', 'abnehmen', 'health', 'wellness'],
      'personal-development': ['persönlichkeitsentwicklung', 'mindset', 'erfolg', 'motivation'],
      'default': ['viral', 'fyp', 'foryou', 'trend']
    };

    const viralHashtags = ['fyp', 'foryoupage', 'viral', 'trending', 'tiktok'];
    const relevantNiche = nicheHashtags[niche] || nicheHashtags.default;

    // Combine: 3 viral + 3 niche + custom
    return [
      ...viralHashtags.slice(0, 3),
      ...relevantNiche.slice(0, 3),
      ...baseHashtags.slice(0, 4)
    ].slice(0, 10); // Max 10 hashtags
  }

  /**
   * Format caption with hashtags
   */
  formatCaption(text, hashtags) {
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
    return `${text}\n\n${hashtagString}`;
  }

  async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
  }
}

// ===== TIKTOK SCHEDULER =====

class TikTokScheduler {
  constructor(tiktokApi) {
    this.api = tiktokApi;
    this.queue = [];
  }

  /**
   * Add video to posting queue
   */
  addToQueue(videoPath, options, scheduledTime = null) {
    this.queue.push({
      videoPath,
      options,
      scheduledTime: scheduledTime || new Date(),
      status: 'pending'
    });
  }

  /**
   * Process queue and post videos
   */
  async processQueue() {
    const now = new Date();

    for (const item of this.queue) {
      if (item.status === 'pending' && new Date(item.scheduledTime) <= now) {
        try {
          await this.api.postVideo(item.videoPath, item.options);
          item.status = 'posted';
          item.postedAt = new Date();
        } catch (error) {
          item.status = 'failed';
          item.error = error.message;
        }

        // Rate limiting: Wait 5 minutes between posts
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
      }
    }

    return this.queue.filter(item => item.status === 'posted');
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      posted: this.queue.filter(i => i.status === 'posted').length,
      failed: this.queue.filter(i => i.status === 'failed').length
    };
  }
}

module.exports = {
  TikTokAPI,
  TikTokScheduler
};

// ===== CLI USAGE =====
if (require.main === module) {
  const tiktok = new TikTokAPI();

  // Example: Post a video
  tiktok.postVideo('./outputs/videos/example.mp4', {
    caption: 'Check out this amazing content!',
    hashtags: tiktok.optimizeHashtags(['tutorial', 'tips'], 'affiliate-marketing')
  }).then(result => {
    console.log('✅ Posted:', result);
  }).catch(error => {
    console.error('❌ Error:', error.message);
  });
}
