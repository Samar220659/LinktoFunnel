// TikTok API Integration - Real Implementation
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { Readable } from 'stream';

export class TikTokAPI {
  constructor(credentials) {
    this.accessToken = credentials?.access_token || process.env.TIKTOK_ACCESS_TOKEN;
    this.clientKey = process.env.TIKTOK_CLIENT_KEY;
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    this.baseURL = 'https://open.tiktokapis.com/v2';
  }

  /**
   * Post video to TikTok
   */
  async post(content, options = {}) {
    const {
      video_url,
      caption,
      hashtags = [],
      privacy_level = 'PUBLIC_TO_EVERYONE',
      disable_duet = false,
      disable_comment = false,
      disable_stitch = false
    } = content;

    try {
      console.log('📤 Uploading to TikTok...');

      // Step 1: Download video
      const videoBuffer = await this.downloadVideo(video_url || content.media_url);
      const videoSize = videoBuffer.length;

      // Step 2: Initialize upload
      const initResponse = await axios.post(
        `${this.baseURL}/post/publish/video/init/`,
        {
          post_info: {
            title: this.formatCaption(caption, hashtags),
            privacy_level: privacy_level,
            disable_duet: disable_duet,
            disable_comment: disable_comment,
            disable_stitch: disable_stitch,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: videoSize, // Single chunk upload
            total_chunk_count: 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      const { publish_id, upload_url } = initResponse.data.data;
      console.log(`✅ TikTok: Upload initialized (ID: ${publish_id})`);

      // Step 3: Upload video chunks
      await this.uploadVideoChunks(upload_url, videoBuffer);
      console.log('✅ TikTok: Video uploaded');

      // Step 4: Check publish status
      const publishStatus = await this.checkPublishStatus(publish_id);
      console.log(`✅ TikTok: Video published (${publishStatus.status})`);

      return {
        success: true,
        post_id: publish_id,
        url: publishStatus.share_url || `https://www.tiktok.com/@me/video/${publish_id}`,
        status: publishStatus.status,
        platform: 'tiktok'
      };

    } catch (error) {
      console.error('TikTok upload error:', error.response?.data || error.message);
      throw new Error(`TikTok upload failed: ${error.message}`);
    }
  }

  /**
   * Get analytics for a TikTok video
   */
  async getAnalytics(videoId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/video/query/`,
        {
          filters: {
            video_ids: [videoId]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const video = response.data.data.videos[0];

      return {
        platform: 'tiktok',
        post_id: videoId,
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        saves: video.save_count || 0,
        engagement_rate: video.view_count > 0
          ? (video.like_count + video.comment_count + video.share_count) / video.view_count
          : 0,
        url: video.share_url,
        created_at: video.create_time
      };

    } catch (error) {
      console.error('TikTok analytics error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Check publish status
   */
  async checkPublishStatus(publishId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.post(
          `${this.baseURL}/post/publish/status/fetch/`,
          {
            publish_id: publishId
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const status = response.data.data;

        if (status.status === 'PUBLISH_COMPLETE') {
          return status;
        } else if (status.status === 'FAILED') {
          throw new Error(`Publish failed: ${status.fail_reason}`);
        }

        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        if (i === maxAttempts - 1) throw error;
      }
    }

    throw new Error('Publish status check timeout');
  }

  /**
   * Upload video chunks
   */
  async uploadVideoChunks(uploadUrl, videoBuffer) {
    try {
      await axios.put(uploadUrl, videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoBuffer.length
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    } catch (error) {
      console.error('Upload chunks error:', error);
      throw error;
    }
  }

  /**
   * Download video from URL
   */
  async downloadVideo(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Video download error:', error);
      throw error;
    }
  }

  /**
   * Format caption with hashtags
   */
  formatCaption(caption, hashtags) {
    let formatted = caption || '';

    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags.map(tag =>
        tag.startsWith('#') ? tag : `#${tag}`
      ).join(' ');

      formatted += '\n\n' + hashtagString;
    }

    // TikTok caption limit is 2200 characters
    return formatted.substring(0, 2200);
  }

  /**
   * OAuth: Get authorization URL
   */
  getAuthorizationUrl(redirectUri, state) {
    const csrfState = state || Math.random().toString(36).substring(2);
    const scope = 'user.info.basic,video.upload,video.publish';

    const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
    url.searchParams.append('client_key', this.clientKey);
    url.searchParams.append('scope', scope);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', csrfState);

    return { url: url.toString(), state: csrfState };
  }

  /**
   * OAuth: Exchange code for access token
   */
  async exchangeCodeForToken(code, redirectUri) {
    try {
      const response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        {
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type
      };
    } catch (error) {
      console.error('Token exchange error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * OAuth: Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        {
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get user info
   */
  async getUserInfo() {
    try {
      const response = await axios.get(
        `${this.baseURL}/user/info/`,
        {
          params: {
            fields: 'open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,follower_count,following_count,likes_count,video_count'
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data.data.user;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  /**
   * List user's videos
   */
  async listVideos(cursor = 0, maxCount = 20) {
    try {
      const response = await axios.post(
        `${this.baseURL}/video/list/`,
        {
          max_count: maxCount,
          cursor: cursor
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        videos: response.data.data.videos,
        cursor: response.data.data.cursor,
        has_more: response.data.data.has_more
      };
    } catch (error) {
      console.error('List videos error:', error);
      throw error;
    }
  }
}

export default TikTokAPI;
