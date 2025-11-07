// Instagram API Integration - Real Implementation (via Facebook Graph API)
import axios from 'axios';

export class InstagramAPI {
  constructor(credentials) {
    this.accessToken = credentials?.access_token || process.env.INSTAGRAM_ACCESS_TOKEN;
    this.accountId = credentials?.account_id || process.env.INSTAGRAM_ACCOUNT_ID;
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Post Reel to Instagram
   */
  async post(content, options = {}) {
    const {
      video_url,
      caption,
      hashtags = [],
      share_to_feed = true,
      location_id = null
    } = content;

    try {
      console.log('📤 Uploading to Instagram...');

      // Step 1: Create media container
      const containerResponse = await this.createMediaContainer({
        video_url: video_url || content.media_url,
        caption: this.formatCaption(caption, hashtags),
        share_to_feed,
        location_id
      });

      const containerId = containerResponse.id;
      console.log(`✅ Instagram: Container created (${containerId})`);

      // Step 2: Wait for video processing
      await this.waitForProcessing(containerId);
      console.log('✅ Instagram: Video processed');

      // Step 3: Publish the Reel
      const publishResponse = await this.publishMedia(containerId);
      const mediaId = publishResponse.id;
      console.log(`✅ Instagram: Reel published (${mediaId})`);

      // Get permalink
      const permalink = await this.getMediaPermalink(mediaId);

      return {
        success: true,
        post_id: mediaId,
        url: permalink,
        container_id: containerId,
        platform: 'instagram'
      };

    } catch (error) {
      console.error('Instagram upload error:', error.response?.data || error.message);
      throw new Error(`Instagram upload failed: ${error.message}`);
    }
  }

  /**
   * Create media container
   */
  async createMediaContainer(options) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.accountId}/media`,
        {
          media_type: 'REELS',
          video_url: options.video_url,
          caption: options.caption,
          share_to_feed: options.share_to_feed,
          ...(options.location_id && { location_id: options.location_id })
        },
        {
          params: { access_token: this.accessToken }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Create container error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Wait for video processing
   */
  async waitForProcessing(containerId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(
          `${this.baseURL}/${containerId}`,
          {
            params: {
              fields: 'status_code',
              access_token: this.accessToken
            }
          }
        );

        const statusCode = response.data.status_code;

        if (statusCode === 'FINISHED') {
          return true;
        } else if (statusCode === 'ERROR') {
          throw new Error('Video processing failed');
        }

        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        if (i === maxAttempts - 1) {
          throw new Error('Video processing timeout');
        }
      }
    }

    throw new Error('Video processing timeout');
  }

  /**
   * Publish media
   */
  async publishMedia(containerId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.accountId}/media_publish`,
        {
          creation_id: containerId
        },
        {
          params: { access_token: this.accessToken }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Publish media error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Get media permalink
   */
  async getMediaPermalink(mediaId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${mediaId}`,
        {
          params: {
            fields: 'permalink',
            access_token: this.accessToken
          }
        }
      );

      return response.data.permalink;
    } catch (error) {
      console.error('Get permalink error:', error);
      return `https://www.instagram.com/p/${mediaId}/`;
    }
  }

  /**
   * Get analytics for a post
   */
  async getAnalytics(mediaId) {
    try {
      // Get media insights
      const insightsResponse = await axios.get(
        `${this.baseURL}/${mediaId}/insights`,
        {
          params: {
            metric: 'impressions,reach,likes,comments,shares,saves,video_views,plays,total_interactions',
            access_token: this.accessToken
          }
        }
      );

      // Get basic media info
      const mediaResponse = await axios.get(
        `${this.baseURL}/${mediaId}`,
        {
          params: {
            fields: 'like_count,comments_count,media_url,permalink,timestamp',
            access_token: this.accessToken
          }
        }
      );

      const insights = insightsResponse.data.data;
      const media = mediaResponse.data;

      // Parse insights
      const getMetricValue = (name) => {
        const metric = insights.find(i => i.name === name);
        return metric?.values?.[0]?.value || 0;
      };

      const impressions = getMetricValue('impressions');
      const reach = getMetricValue('reach');
      const views = getMetricValue('video_views') || getMetricValue('plays');
      const likes = media.like_count || 0;
      const comments = media.comments_count || 0;
      const shares = getMetricValue('shares');
      const saves = getMetricValue('saves');

      return {
        platform: 'instagram',
        post_id: mediaId,
        impressions,
        reach,
        views,
        likes,
        comments,
        shares,
        saves,
        engagement_rate: impressions > 0
          ? (likes + comments + shares + saves) / impressions
          : 0,
        url: media.permalink,
        created_at: media.timestamp
      };

    } catch (error) {
      console.error('Instagram analytics error:', error.response?.data || error.message);
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

    // Instagram caption limit is 2200 characters
    return formatted.substring(0, 2200);
  }

  /**
   * Get user info
   */
  async getUserInfo() {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.accountId}`,
        {
          params: {
            fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url',
            access_token: this.accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  /**
   * Get user media (posts)
   */
  async getUserMedia(limit = 25) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.accountId}/media`,
        {
          params: {
            fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count',
            limit,
            access_token: this.accessToken
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Get user media error:', error);
      throw error;
    }
  }

  /**
   * Get account insights (requires Business Account)
   */
  async getAccountInsights(period = 'day', since, until) {
    try {
      const params = {
        metric: 'impressions,reach,profile_views,follower_count,email_contacts,phone_call_clicks,text_message_clicks,get_directions_clicks,website_clicks',
        period,
        access_token: this.accessToken
      };

      if (since) params.since = since;
      if (until) params.until = until;

      const response = await axios.get(
        `${this.baseURL}/${this.accountId}/insights`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      console.error('Get account insights error:', error);
      throw error;
    }
  }

  /**
   * Post a regular photo (not Reel)
   */
  async postPhoto(options) {
    const {
      image_url,
      caption,
      hashtags = [],
      location_id = null
    } = options;

    try {
      // Step 1: Create photo container
      const containerResponse = await axios.post(
        `${this.baseURL}/${this.accountId}/media`,
        {
          image_url: image_url,
          caption: this.formatCaption(caption, hashtags),
          ...(location_id && { location_id })
        },
        {
          params: { access_token: this.accessToken }
        }
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish
      const publishResponse = await axios.post(
        `${this.baseURL}/${this.accountId}/media_publish`,
        {
          creation_id: containerId
        },
        {
          params: { access_token: this.accessToken }
        }
      );

      const mediaId = publishResponse.data.id;
      const permalink = await this.getMediaPermalink(mediaId);

      return {
        success: true,
        post_id: mediaId,
        url: permalink,
        container_id: containerId,
        platform: 'instagram'
      };

    } catch (error) {
      console.error('Instagram photo upload error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Post a carousel (multiple images/videos)
   */
  async postCarousel(options) {
    const {
      media_items, // Array of { type: 'IMAGE' | 'VIDEO', url: string }
      caption,
      hashtags = [],
      location_id = null
    } = options;

    try {
      // Step 1: Create containers for each media item
      const containerIds = [];

      for (const item of media_items) {
        const containerResponse = await axios.post(
          `${this.baseURL}/${this.accountId}/media`,
          {
            [item.type === 'IMAGE' ? 'image_url' : 'video_url']: item.url,
            is_carousel_item: true
          },
          {
            params: { access_token: this.accessToken }
          }
        );

        containerIds.push(containerResponse.data.id);

        // Wait for video processing if needed
        if (item.type === 'VIDEO') {
          await this.waitForProcessing(containerResponse.data.id);
        }
      }

      // Step 2: Create carousel container
      const carouselResponse = await axios.post(
        `${this.baseURL}/${this.accountId}/media`,
        {
          media_type: 'CAROUSEL',
          children: containerIds,
          caption: this.formatCaption(caption, hashtags),
          ...(location_id && { location_id })
        },
        {
          params: { access_token: this.accessToken }
        }
      );

      const carouselContainerId = carouselResponse.data.id;

      // Step 3: Publish carousel
      const publishResponse = await axios.post(
        `${this.baseURL}/${this.accountId}/media_publish`,
        {
          creation_id: carouselContainerId
        },
        {
          params: { access_token: this.accessToken }
        }
      );

      const mediaId = publishResponse.data.id;
      const permalink = await this.getMediaPermalink(mediaId);

      return {
        success: true,
        post_id: mediaId,
        url: permalink,
        container_id: carouselContainerId,
        platform: 'instagram'
      };

    } catch (error) {
      console.error('Instagram carousel upload error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Delete a media item
   */
  async deleteMedia(mediaId) {
    try {
      await axios.delete(
        `${this.baseURL}/${mediaId}`,
        {
          params: { access_token: this.accessToken }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Delete media error:', error);
      throw error;
    }
  }

  /**
   * Reply to a comment
   */
  async replyToComment(commentId, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${commentId}/replies`,
        {
          message
        },
        {
          params: { access_token: this.accessToken }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Reply to comment error:', error);
      throw error;
    }
  }

  /**
   * Get comments on a media
   */
  async getComments(mediaId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${mediaId}/comments`,
        {
          params: {
            fields: 'id,text,username,timestamp,like_count',
            access_token: this.accessToken
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  }
}

export default InstagramAPI;
