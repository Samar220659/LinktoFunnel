// Pinterest API Integration - Real Implementation
import axios from 'axios';

export class PinterestAPI {
  constructor(credentials) {
    this.accessToken = credentials?.access_token || process.env.PINTEREST_ACCESS_TOKEN;
    this.baseURL = 'https://api.pinterest.com/v5';
  }

  /**
   * Post Pin to Pinterest
   */
  async post(content, options = {}) {
    const {
      image_url,
      video_url,
      title,
      description,
      link,
      board_id,
      hashtags = []
    } = content;

    try {
      console.log('📤 Posting to Pinterest...');

      // Get default board if not specified
      const targetBoardId = board_id || await this.getDefaultBoard();

      // Create pin
      const pinData = {
        board_id: targetBoardId,
        title: title || content.caption?.substring(0, 100),
        description: this.formatDescription(description || content.caption, hashtags),
        link: link || content.affiliate_link,
        media_source: {}
      };

      // Add media (image or video)
      if (video_url) {
        pinData.media_source.source_type = 'video_url';
        pinData.media_source.url = video_url;
      } else if (image_url || content.media_url) {
        pinData.media_source.source_type = 'image_url';
        pinData.media_source.url = image_url || content.media_url;
      } else if (content.keyframes && content.keyframes.length > 0) {
        pinData.media_source.source_type = 'image_url';
        pinData.media_source.url = content.keyframes[0];
      }

      const response = await axios.post(
        `${this.baseURL}/pins`,
        pinData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const pin = response.data;
      console.log(`✅ Pinterest: Pin created (${pin.id})`);

      return {
        success: true,
        post_id: pin.id,
        url: `https://www.pinterest.com/pin/${pin.id}/`,
        platform: 'pinterest'
      };

    } catch (error) {
      console.error('Pinterest post error:', error.response?.data || error.message);
      throw new Error(`Pinterest post failed: ${error.message}`);
    }
  }

  /**
   * Get analytics for a pin
   */
  async getAnalytics(pinId) {
    try {
      // Get pin details
      const pinResponse = await axios.get(
        `${this.baseURL}/pins/${pinId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const pin = pinResponse.data;

      // Get pin analytics
      const analyticsResponse = await axios.get(
        `${this.baseURL}/pins/${pinId}/analytics`,
        {
          params: {
            start_date: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            metric_types: 'IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK'
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const metrics = analyticsResponse.data.all;

      return {
        platform: 'pinterest',
        post_id: pinId,
        impressions: metrics?.IMPRESSION || 0,
        saves: metrics?.SAVE || 0,
        clicks: metrics?.PIN_CLICK || 0,
        outbound_clicks: metrics?.OUTBOUND_CLICK || 0,
        engagement_rate: metrics?.IMPRESSION > 0
          ? (metrics?.SAVE + metrics?.PIN_CLICK) / metrics?.IMPRESSION
          : 0,
        url: `https://www.pinterest.com/pin/${pinId}/`,
        created_at: pin.created_at
      };

    } catch (error) {
      console.error('Pinterest analytics error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a board
   */
  async createBoard(name, description = '', privacy = 'PUBLIC') {
    try {
      const response = await axios.post(
        `${this.baseURL}/boards`,
        {
          name: name,
          description: description,
          privacy: privacy
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Create board error:', error);
      throw error;
    }
  }

  /**
   * List boards
   */
  async listBoards() {
    try {
      const response = await axios.get(
        `${this.baseURL}/boards`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data.items;
    } catch (error) {
      console.error('List boards error:', error);
      throw error;
    }
  }

  /**
   * Get default board
   */
  async getDefaultBoard() {
    try {
      const boards = await this.listBoards();

      if (boards.length === 0) {
        // Create default board
        const newBoard = await this.createBoard('Affiliate Products', 'My favorite product recommendations');
        return newBoard.id;
      }

      // Return first board
      return boards[0].id;
    } catch (error) {
      console.error('Get default board error:', error);
      throw error;
    }
  }

  /**
   * Get user info
   */
  async getUserInfo() {
    try {
      const response = await axios.get(
        `${this.baseURL}/user_account`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const user = response.data;

      return {
        id: user.username,
        username: user.username,
        profile_image: user.profile_image,
        followers: user.follower_count,
        following: user.following_count,
        pins: user.pin_count,
        boards: user.board_count
      };

    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  /**
   * Delete pin
   */
  async deletePin(pinId) {
    try {
      await axios.delete(
        `${this.baseURL}/pins/${pinId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Delete pin error:', error);
      throw error;
    }
  }

  /**
   * Search pins
   */
  async searchPins(query, limit = 25) {
    try {
      const response = await axios.get(
        `${this.baseURL}/search/pins`,
        {
          params: {
            query: query,
            limit: limit
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data.items;
    } catch (error) {
      console.error('Search pins error:', error);
      throw error;
    }
  }

  /**
   * Get trending pins
   */
  async getTrendingPins(category = null) {
    try {
      const params = { limit: 50 };
      if (category) params.category = category;

      const response = await axios.get(
        `${this.baseURL}/search/pins`,
        {
          params,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data.items;
    } catch (error) {
      console.error('Get trending pins error:', error);
      throw error;
    }
  }

  /**
   * Format description with hashtags
   */
  formatDescription(description, hashtags) {
    let formatted = description || '';

    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags.map(tag =>
        tag.startsWith('#') ? tag : `#${tag}`
      ).join(' ');

      formatted += '\n\n' + hashtagString;
    }

    // Pinterest description max 500 characters
    return formatted.substring(0, 500);
  }

  /**
   * OAuth: Get authorization URL
   */
  getAuthorizationUrl(redirectUri, state) {
    const csrfState = state || Math.random().toString(36).substring(2);
    const scope = 'boards:read,boards:write,pins:read,pins:write,user_accounts:read';

    const url = new URL('https://www.pinterest.com/oauth/');
    url.searchParams.append('client_id', process.env.PINTEREST_CLIENT_ID);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', csrfState);

    return { url: url.toString(), state: csrfState };
  }

  /**
   * OAuth: Exchange code for access token
   */
  async exchangeCodeForToken(code, redirectUri) {
    try {
      const response = await axios.post(
        'https://api.pinterest.com/v5/oauth/token',
        {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri
        },
        {
          auth: {
            username: process.env.PINTEREST_CLIENT_ID,
            password: process.env.PINTEREST_CLIENT_SECRET
          },
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
        'https://api.pinterest.com/v5/oauth/token',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        {
          auth: {
            username: process.env.PINTEREST_CLIENT_ID,
            password: process.env.PINTEREST_CLIENT_SECRET
          },
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
}

export default PinterestAPI;
