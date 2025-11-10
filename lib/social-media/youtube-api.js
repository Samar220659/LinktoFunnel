#!/usr/bin/env node

/**
 * 🎥 YOUTUBE API INTEGRATION
 * Real YouTube Shorts posting using YouTube Data API v3
 *
 * Features:
 * - Shorts upload
 * - Video metadata optimization
 * - Analytics retrieval
 * - Playlist management
 * - Comment management
 *
 * Requirements:
 * - Google Cloud Project
 * - YouTube Data API v3 enabled
 * - OAuth 2.0 credentials
 */

const fs = require('fs').promises;
const { google } = require('googleapis');

class YouTubeAPI {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.YOUTUBE_API_KEY;
    this.oauth2Client = null;
    this.youtube = null;

    if (config.credentials) {
      this.initializeOAuth(config.credentials);
    }
  }

  /**
   * Initialize OAuth2 client
   */
  initializeOAuth(credentials) {
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

    this.oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Set credentials if available
    if (credentials.tokens) {
      this.oauth2Client.setCredentials(credentials.tokens);
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl() {
    const SCOPES = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Upload a Short to YouTube
   */
  async uploadShort(videoPath, options = {}) {
    console.log('📤 Uploading Short to YouTube...');

    if (!this.youtube) {
      throw new Error('YouTube client not initialized. Call initializeOAuth first.');
    }

    try {
      const videoMetadata = {
        snippet: {
          title: options.title || 'My YouTube Short',
          description: this.formatDescription(options.description || '', options.hashtags || []),
          tags: options.tags || [],
          categoryId: options.categoryId || '22', // People & Blogs
          defaultLanguage: 'de',
          defaultAudioLanguage: 'de'
        },
        status: {
          privacyStatus: options.privacyStatus || 'public',
          selfDeclaredMadeForKids: false
        }
      };

      // Add #Shorts to title for YouTube Shorts recognition
      if (!videoMetadata.snippet.title.includes('#Shorts')) {
        videoMetadata.snippet.title += ' #Shorts';
      }

      const videoBuffer = await fs.readFile(videoPath);

      const response = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: videoMetadata,
        media: {
          body: require('stream').Readable.from(videoBuffer)
        }
      });

      const videoId = response.data.id;
      const videoUrl = `https://youtube.com/shorts/${videoId}`;

      console.log(`✅ Short uploaded successfully: ${videoUrl}`);

      return {
        videoId,
        videoUrl,
        data: response.data
      };

    } catch (error) {
      console.error('❌ YouTube upload failed:', error.message);
      throw error;
    }
  }

  /**
   * Update video metadata
   */
  async updateVideo(videoId, updates) {
    const response = await this.youtube.videos.update({
      part: ['snippet', 'status'],
      requestBody: {
        id: videoId,
        ...updates
      }
    });

    return response.data;
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId) {
    const response = await this.youtube.videos.list({
      part: ['statistics', 'snippet', 'contentDetails'],
      id: [videoId]
    });

    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];

    return {
      videoId,
      title: video.snippet.title,
      views: parseInt(video.statistics.viewCount) || 0,
      likes: parseInt(video.statistics.likeCount) || 0,
      comments: parseInt(video.statistics.commentCount) || 0,
      favorites: parseInt(video.statistics.favoriteCount) || 0,
      duration: video.contentDetails.duration,
      publishedAt: video.snippet.publishedAt
    };
  }

  /**
   * Get channel analytics
   */
  async getChannelAnalytics() {
    const response = await this.youtube.channels.list({
      part: ['statistics', 'snippet'],
      mine: true
    });

    if (response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = response.data.items[0];

    return {
      channelId: channel.id,
      channelName: channel.snippet.title,
      subscribers: parseInt(channel.statistics.subscriberCount) || 0,
      totalViews: parseInt(channel.statistics.viewCount) || 0,
      totalVideos: parseInt(channel.statistics.videoCount) || 0
    };
  }

  /**
   * Get channel's recent uploads
   */
  async getRecentUploads(maxResults = 10) {
    // First, get the uploads playlist ID
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
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.high.url
    }));
  }

  /**
   * Search for videos
   */
  async searchVideos(query, maxResults = 10) {
    const response = await this.youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults,
      order: 'viewCount'
    });

    return response.data.items;
  }

  /**
   * Optimize hashtags for YouTube
   */
  optimizeHashtags(baseHashtags, niche) {
    const nicheHashtags = {
      'affiliate-marketing': [
        'affiliatemarketing', 'makemoneyonline', 'passiveincome',
        'onlinebusiness', 'workfromhome', 'sidehustle'
      ],
      'health-fitness': [
        'fitness', 'health', 'workout', 'wellness',
        'fitnessmotivation', 'healthylifestyle'
      ],
      'personal-development': [
        'personaldevelopment', 'selfimprovement', 'mindset',
        'motivation', 'success', 'growthmindset'
      ],
      'default': [
        'shorts', 'viral', 'trending'
      ]
    };

    const shortsHashtags = ['shorts', 'youtubeshorts'];
    const relevantNiche = nicheHashtags[niche] || nicheHashtags.default;

    // YouTube allows 15 hashtags in description, but shows first 3 above title
    return [
      ...shortsHashtags,
      ...relevantNiche.slice(0, 5),
      ...baseHashtags.slice(0, 8)
    ].slice(0, 15);
  }

  /**
   * Format description with hashtags and links
   */
  formatDescription(text, hashtags, affiliateLink = null) {
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');

    let description = text;

    if (affiliateLink) {
      description += `\n\n🔗 Link: ${affiliateLink}`;
    }

    description += `\n\n${hashtagString}`;

    // Add standard elements
    description += `\n\n━━━━━━━━━━━━━━━━━━━━`;
    description += `\n\n👍 Like dieses Video wenn es dir gefallen hat!`;
    description += `\n💬 Kommentiere deine Meinung`;
    description += `\n🔔 Abonniere für mehr Content`;

    return description;
  }

  /**
   * Optimize title for YouTube SEO
   */
  optimizeTitle(baseTitle, keywords = []) {
    // Keep it under 60 characters for best visibility
    let title = baseTitle;

    // Add top keyword if space allows
    if (keywords.length > 0 && title.length < 50) {
      title = `${keywords[0]} | ${title}`;
    }

    // Ensure #Shorts tag
    if (!title.includes('#Shorts') && title.length < 50) {
      title += ' #Shorts';
    }

    return title.substring(0, 100); // YouTube max is 100 chars
  }

  /**
   * Get optimal upload times (DACH timezone)
   */
  getOptimalUploadTimes() {
    return {
      weekday: ['12:00', '15:00', '18:00', '20:00'], // Lunch, after work, evening
      weekend: ['10:00', '14:00', '19:00'] // Mid-morning, afternoon, evening
    };
  }

  /**
   * Calculate video engagement rate
   */
  calculateEngagement(analytics) {
    const { views, likes, comments } = analytics;
    if (views === 0) return 0;

    const engagementActions = likes + comments;
    return ((engagementActions / views) * 100).toFixed(2);
  }
}

// ===== YOUTUBE CONTENT STRATEGY =====

class YouTubeStrategy {
  /**
   * Get video category IDs
   */
  getCategoryIds() {
    return {
      'Film & Animation': '1',
      'Autos & Vehicles': '2',
      'Music': '10',
      'Pets & Animals': '15',
      'Sports': '17',
      'Short Movies': '18',
      'Travel & Events': '19',
      'Gaming': '20',
      'Videoblogging': '21',
      'People & Blogs': '22',
      'Comedy': '23',
      'Entertainment': '24',
      'News & Politics': '25',
      'Howto & Style': '26',
      'Education': '27',
      'Science & Technology': '28',
      'Nonprofits & Activism': '29'
    };
  }

  /**
   * Suggest posting frequency based on channel size
   */
  getSuggestedFrequency(subscriberCount) {
    if (subscriberCount < 1000) return 1; // 1 Short per day
    if (subscriberCount < 10000) return 2; // 2 Shorts per day
    if (subscriberCount < 100000) return 3; // 3 Shorts per day
    return 5; // 5+ Shorts per day for large channels
  }

  /**
   * Analyze best performing content
   */
  analyzeBestContent(videos) {
    // Sort by views
    const sorted = videos.sort((a, b) => b.views - a.views);

    // Get top 10%
    const topPerformers = sorted.slice(0, Math.ceil(sorted.length * 0.1));

    // Find common patterns
    const patterns = {
      avgViews: topPerformers.reduce((sum, v) => sum + v.views, 0) / topPerformers.length,
      commonHashtags: this.findCommonHashtags(topPerformers),
      avgTitleLength: topPerformers.reduce((sum, v) => sum + v.title.length, 0) / topPerformers.length
    };

    return patterns;
  }

  findCommonHashtags(videos) {
    const hashtagCount = {};

    videos.forEach(video => {
      const hashtags = video.description.match(/#\w+/g) || [];
      hashtags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }
}

module.exports = {
  YouTubeAPI,
  YouTubeStrategy
};

// ===== CLI USAGE =====
if (require.main === module) {
  const youtube = new YouTubeAPI();

  // Example: Get channel analytics (requires OAuth)
  youtube.getChannelAnalytics()
    .then(analytics => {
      console.log('📊 YouTube Analytics:', analytics);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      console.log('⚠️  Make sure to initialize OAuth first');
    });
}
