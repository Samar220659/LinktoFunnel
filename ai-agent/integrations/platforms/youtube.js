// YouTube API Integration - Real Implementation
import { google } from 'googleapis';
import fs from 'fs';
import axios from 'axios';
import path from 'path';

export class YouTubeAPI {
  constructor(credentials) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/youtube/callback'
    );

    // Set credentials if provided
    if (credentials?.access_token) {
      this.oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date
      });
    }

    // Initialize YouTube API client
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  /**
   * Post Short to YouTube
   */
  async post(content, options = {}) {
    const {
      video_url,
      title,
      description,
      hashtags = [],
      category = '22', // People & Blogs
      privacy = 'public',
      tags = []
    } = content;

    try {
      console.log('📤 Uploading to YouTube...');

      // Download video to temp file
      const videoPath = await this.downloadVideo(video_url || content.media_url);

      // Format description with hashtags
      const fullDescription = this.formatDescription(description, hashtags);

      // Prepare metadata
      const metadata = {
        snippet: {
          title: this.formatTitle(title || content.caption),
          description: fullDescription,
          tags: [...tags, ...hashtags, 'Shorts'],
          categoryId: category
        },
        status: {
          privacyStatus: privacy,
          selfDeclaredMadeForKids: false,
          madeForKids: false
        }
      };

      // Upload video
      const uploadResponse = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: metadata,
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      // Clean up temp file
      fs.unlinkSync(videoPath);

      const videoId = uploadResponse.data.id;
      console.log(`✅ YouTube: Short uploaded (${videoId})`);

      return {
        success: true,
        post_id: videoId,
        url: `https://youtube.com/shorts/${videoId}`,
        video_id: videoId,
        platform: 'youtube'
      };

    } catch (error) {
      console.error('YouTube upload error:', error.message);
      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }

  /**
   * Get analytics for a video
   */
  async getAnalytics(videoId) {
    try {
      // Get video statistics
      const statsResponse = await this.youtube.videos.list({
        part: ['statistics', 'snippet', 'contentDetails'],
        id: [videoId]
      });

      const video = statsResponse.data.items[0];

      if (!video) {
        throw new Error(`Video ${videoId} not found`);
      }

      const stats = video.statistics;

      return {
        platform: 'youtube',
        post_id: videoId,
        views: parseInt(stats.viewCount) || 0,
        likes: parseInt(stats.likeCount) || 0,
        comments: parseInt(stats.commentCount) || 0,
        favorites: parseInt(stats.favoriteCount) || 0,
        engagement_rate: stats.viewCount > 0
          ? (parseInt(stats.likeCount) + parseInt(stats.commentCount)) / parseInt(stats.viewCount)
          : 0,
        url: `https://youtube.com/shorts/${videoId}`,
        created_at: video.snippet.publishedAt,
        duration: video.contentDetails.duration
      };

    } catch (error) {
      console.error('YouTube analytics error:', error.message);
      throw error;
    }
  }

  /**
   * Get channel analytics
   */
  async getChannelAnalytics() {
    try {
      // Get channel info
      const channelResponse = await this.youtube.channels.list({
        part: ['statistics', 'snippet'],
        mine: true
      });

      const channel = channelResponse.data.items[0];

      if (!channel) {
        throw new Error('Channel not found');
      }

      const stats = channel.statistics;

      return {
        channel_id: channel.id,
        title: channel.snippet.title,
        subscribers: parseInt(stats.subscriberCount) || 0,
        total_views: parseInt(stats.viewCount) || 0,
        total_videos: parseInt(stats.videoCount) || 0,
        description: channel.snippet.description,
        created_at: channel.snippet.publishedAt
      };

    } catch (error) {
      console.error('Get channel analytics error:', error);
      throw error;
    }
  }

  /**
   * Upload full video (not Short)
   */
  async uploadVideo(options) {
    const {
      video_url,
      title,
      description,
      tags = [],
      category = '22',
      privacy = 'public',
      thumbnail_url = null
    } = options;

    try {
      // Download video
      const videoPath = await this.downloadVideo(video_url);

      // Upload video
      const uploadResponse = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: category
          },
          status: {
            privacyStatus: privacy,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      const videoId = uploadResponse.data.id;

      // Upload thumbnail if provided
      if (thumbnail_url) {
        await this.setThumbnail(videoId, thumbnail_url);
      }

      // Clean up
      fs.unlinkSync(videoPath);

      return {
        success: true,
        video_id: videoId,
        url: `https://youtube.com/watch?v=${videoId}`,
        platform: 'youtube'
      };

    } catch (error) {
      console.error('YouTube video upload error:', error);
      throw error;
    }
  }

  /**
   * Set custom thumbnail
   */
  async setThumbnail(videoId, thumbnailUrl) {
    try {
      const thumbnailPath = await this.downloadVideo(thumbnailUrl);

      await this.youtube.thumbnails.set({
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath)
        }
      });

      fs.unlinkSync(thumbnailPath);

      return { success: true };
    } catch (error) {
      console.error('Set thumbnail error:', error);
      throw error;
    }
  }

  /**
   * Get video comments
   */
  async getComments(videoId, maxResults = 100) {
    try {
      const response = await this.youtube.commentThreads.list({
        part: ['snippet'],
        videoId,
        maxResults,
        order: 'relevance'
      });

      return response.data.items.map(item => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        likes: item.snippet.topLevelComment.snippet.likeCount,
        published_at: item.snippet.topLevelComment.snippet.publishedAt
      }));

    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  }

  /**
   * Reply to comment
   */
  async replyToComment(commentId, text) {
    try {
      const response = await this.youtube.comments.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            parentId: commentId,
            textOriginal: text
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Reply to comment error:', error);
      throw error;
    }
  }

  /**
   * Search videos
   */
  async searchVideos(query, maxResults = 10) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults
      });

      return response.data.items.map(item => ({
        video_id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        published_at: item.snippet.publishedAt
      }));

    } catch (error) {
      console.error('Search videos error:', error);
      throw error;
    }
  }

  /**
   * List channel videos
   */
  async listChannelVideos(maxResults = 50) {
    try {
      // Get channel ID
      const channelResponse = await this.youtube.channels.list({
        part: ['contentDetails'],
        mine: true
      });

      const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

      // Get videos from uploads playlist
      const playlistResponse = await this.youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults
      });

      return playlistResponse.data.items.map(item => ({
        video_id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        published_at: item.snippet.publishedAt
      }));

    } catch (error) {
      console.error('List channel videos error:', error);
      throw error;
    }
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId) {
    try {
      await this.youtube.videos.delete({
        id: videoId
      });

      return { success: true };
    } catch (error) {
      console.error('Delete video error:', error);
      throw error;
    }
  }

  /**
   * Update video metadata
   */
  async updateVideo(videoId, updates) {
    try {
      // Get current video data
      const currentVideo = await this.youtube.videos.list({
        part: ['snippet', 'status'],
        id: [videoId]
      });

      const video = currentVideo.data.items[0];

      // Merge updates
      const updatedSnippet = {
        ...video.snippet,
        ...updates.snippet
      };

      const updatedStatus = {
        ...video.status,
        ...updates.status
      };

      // Update video
      const response = await this.youtube.videos.update({
        part: ['snippet', 'status'],
        requestBody: {
          id: videoId,
          snippet: updatedSnippet,
          status: updatedStatus
        }
      });

      return response.data;
    } catch (error) {
      console.error('Update video error:', error);
      throw error;
    }
  }

  /**
   * Download video to temp file
   */
  async downloadVideo(url) {
    try {
      const tempPath = path.join('/tmp', `video-${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempPath);

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(tempPath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Download video error:', error);
      throw error;
    }
  }

  /**
   * Format title for YouTube
   */
  formatTitle(title) {
    // YouTube title max 100 characters
    let formatted = title || 'Untitled';

    // Add #Shorts hashtag if not present
    if (!formatted.includes('#Shorts')) {
      formatted += ' #Shorts';
    }

    return formatted.substring(0, 100);
  }

  /**
   * Format description with hashtags
   */
  formatDescription(description, hashtags) {
    let formatted = description || '';

    // Add #Shorts if not present
    if (!formatted.includes('#Shorts')) {
      formatted += '\n\n#Shorts';
    }

    // Add hashtags
    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags.map(tag =>
        tag.startsWith('#') ? tag : `#${tag}`
      ).join(' ');

      formatted += '\n' + hashtagString;
    }

    // YouTube description max 5000 characters
    return formatted.substring(0, 5000);
  }

  /**
   * OAuth: Get authorization URL
   */
  getAuthorizationUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * OAuth: Exchange code for tokens
   */
  async exchangeCodeForTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type
      };
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * OAuth: Refresh access token
   */
  async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);

      return {
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }
}

export default YouTubeAPI;
