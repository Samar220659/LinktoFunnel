// Twitter/X API Integration - Real Implementation
import axios from 'axios';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

export class TwitterAPI {
  constructor(credentials) {
    this.apiKey = credentials?.api_key || process.env.TWITTER_API_KEY;
    this.apiSecret = credentials?.api_secret || process.env.TWITTER_API_SECRET;
    this.accessToken = credentials?.access_token || process.env.TWITTER_ACCESS_TOKEN;
    this.accessSecret = credentials?.access_secret || process.env.TWITTER_ACCESS_SECRET;
    this.bearerToken = credentials?.bearer_token || process.env.TWITTER_BEARER_TOKEN;

    this.baseURL = 'https://api.twitter.com/2';
    this.uploadURL = 'https://upload.twitter.com/1.1';

    // OAuth 1.0a client
    this.oauth = OAuth({
      consumer: {
        key: this.apiKey,
        secret: this.apiSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });
  }

  /**
   * Post tweet (text only or with media)
   */
  async post(content, options = {}) {
    const {
      caption,
      media_url,
      video_url,
      hashtags = []
    } = content;

    try {
      console.log('📤 Posting to Twitter...');

      let text = this.formatTweet(caption, hashtags);
      let mediaIds = [];

      // Upload media if provided
      if (video_url || media_url) {
        const mediaId = await this.uploadMedia(video_url || media_url);
        mediaIds.push(mediaId);
      }

      // Create tweet
      const tweetData = {
        text: text
      };

      if (mediaIds.length > 0) {
        tweetData.media = {
          media_ids: mediaIds
        };
      }

      const response = await this.makeRequest('POST', `${this.baseURL}/tweets`, tweetData);

      const tweetId = response.data.id;
      const username = await this.getMyUsername();

      console.log(`✅ Twitter: Tweet posted (${tweetId})`);

      return {
        success: true,
        post_id: tweetId,
        url: `https://twitter.com/${username}/status/${tweetId}`,
        platform: 'twitter'
      };

    } catch (error) {
      console.error('Twitter post error:', error.response?.data || error.message);
      throw new Error(`Twitter post failed: ${error.message}`);
    }
  }

  /**
   * Upload media (image or video)
   */
  async uploadMedia(mediaUrl) {
    try {
      // Download media
      const mediaResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer'
      });

      const mediaBuffer = Buffer.from(mediaResponse.data);
      const mediaType = mediaResponse.headers['content-type'];
      const mediaCategory = mediaType.includes('video') ? 'tweet_video' : 'tweet_image';

      // Initialize upload
      const initResponse = await this.makeUploadRequest('POST', `${this.uploadURL}/media/upload.json`, {
        command: 'INIT',
        total_bytes: mediaBuffer.length,
        media_type: mediaType,
        media_category: mediaCategory
      });

      const mediaId = initResponse.media_id_string;

      // Upload media in chunks
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      let segmentIndex = 0;

      for (let i = 0; i < mediaBuffer.length; i += chunkSize) {
        const chunk = mediaBuffer.slice(i, Math.min(i + chunkSize, mediaBuffer.length));

        await this.makeUploadRequest('POST', `${this.uploadURL}/media/upload.json`, {
          command: 'APPEND',
          media_id: mediaId,
          segment_index: segmentIndex,
          media: chunk.toString('base64')
        });

        segmentIndex++;
      }

      // Finalize upload
      await this.makeUploadRequest('POST', `${this.uploadURL}/media/upload.json`, {
        command: 'FINALIZE',
        media_id: mediaId
      });

      // Wait for processing if video
      if (mediaCategory === 'tweet_video') {
        await this.waitForMediaProcessing(mediaId);
      }

      return mediaId;

    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  }

  /**
   * Wait for media processing
   */
  async waitForMediaProcessing(mediaId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.makeUploadRequest('GET', `${this.uploadURL}/media/upload.json`, {
          command: 'STATUS',
          media_id: mediaId
        });

        const state = response.processing_info?.state;

        if (state === 'succeeded') {
          return true;
        } else if (state === 'failed') {
          throw new Error('Media processing failed');
        }

        // Wait based on check_after_secs
        const waitTime = response.processing_info?.check_after_secs || 2;
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

      } catch (error) {
        if (i === maxAttempts - 1) throw error;
      }
    }

    throw new Error('Media processing timeout');
  }

  /**
   * Get analytics for a tweet
   */
  async getAnalytics(tweetId) {
    try {
      const response = await this.makeRequest(
        'GET',
        `${this.baseURL}/tweets/${tweetId}`,
        {
          'tweet.fields': 'public_metrics,created_at',
          'expansions': 'author_id'
        }
      );

      const tweet = response.data;
      const metrics = tweet.public_metrics;

      return {
        platform: 'twitter',
        post_id: tweetId,
        views: metrics.impression_count || 0,
        likes: metrics.like_count || 0,
        retweets: metrics.retweet_count || 0,
        replies: metrics.reply_count || 0,
        quotes: metrics.quote_count || 0,
        engagement_rate: metrics.impression_count > 0
          ? (metrics.like_count + metrics.retweet_count + metrics.reply_count) / metrics.impression_count
          : 0,
        url: `https://twitter.com/i/web/status/${tweetId}`,
        created_at: tweet.created_at
      };

    } catch (error) {
      console.error('Twitter analytics error:', error);
      throw error;
    }
  }

  /**
   * Get my username
   */
  async getMyUsername() {
    try {
      const response = await this.makeRequest('GET', `${this.baseURL}/users/me`, {
        'user.fields': 'username'
      });

      return response.data.username;
    } catch (error) {
      console.error('Get username error:', error);
      return 'user';
    }
  }

  /**
   * Get user info
   */
  async getUserInfo() {
    try {
      const response = await this.makeRequest('GET', `${this.baseURL}/users/me`, {
        'user.fields': 'id,name,username,description,public_metrics,profile_image_url,created_at'
      });

      const user = response.data;

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.description,
        followers: user.public_metrics.followers_count,
        following: user.public_metrics.following_count,
        tweets: user.public_metrics.tweet_count,
        profile_image: user.profile_image_url,
        created_at: user.created_at
      };

    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  /**
   * Delete tweet
   */
  async deleteTweet(tweetId) {
    try {
      await this.makeRequest('DELETE', `${this.baseURL}/tweets/${tweetId}`);
      return { success: true };
    } catch (error) {
      console.error('Delete tweet error:', error);
      throw error;
    }
  }

  /**
   * Reply to tweet
   */
  async replyToTweet(tweetId, text) {
    try {
      const response = await this.makeRequest('POST', `${this.baseURL}/tweets`, {
        text: text,
        reply: {
          in_reply_to_tweet_id: tweetId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Reply to tweet error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request (OAuth 1.0a)
   */
  async makeRequest(method, url, data = {}) {
    try {
      const token = {
        key: this.accessToken,
        secret: this.accessSecret
      };

      const isGet = method === 'GET';
      const requestData = {
        url: isGet ? url + '?' + new URLSearchParams(data).toString() : url,
        method: method
      };

      const authHeader = this.oauth.toHeader(
        this.oauth.authorize(requestData, token)
      );

      const config = {
        method: method,
        url: requestData.url,
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        }
      };

      if (!isGet && Object.keys(data).length > 0) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;

    } catch (error) {
      console.error('Request error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Make upload request (OAuth 1.0a)
   */
  async makeUploadRequest(method, url, data = {}) {
    try {
      const token = {
        key: this.accessToken,
        secret: this.accessSecret
      };

      const requestData = {
        url: url,
        method: method,
        data: data
      };

      const authHeader = this.oauth.toHeader(
        this.oauth.authorize(requestData, token)
      );

      const response = await axios({
        method: method,
        url: url,
        headers: {
          ...authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams(data).toString()
      });

      return response.data;

    } catch (error) {
      console.error('Upload request error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Format tweet text with hashtags
   */
  formatTweet(text, hashtags) {
    let formatted = text || '';

    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags.map(tag =>
        tag.startsWith('#') ? tag : `#${tag}`
      ).join(' ');

      formatted += '\n\n' + hashtagString;
    }

    // Twitter limit is 280 characters
    return formatted.substring(0, 280);
  }
}

export default TwitterAPI;
