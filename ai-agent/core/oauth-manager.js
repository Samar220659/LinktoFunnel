// OAuth Manager - Unified OAuth 2.0 Authentication for Social Media Platforms
import { createClient } from '@supabase/supabase-js';
import { TikTokAPI } from '../integrations/platforms/tiktok.js';
import { InstagramAPI } from '../integrations/platforms/instagram.js';
import { YouTubeAPI } from '../integrations/platforms/youtube.js';
import { PinterestAPI } from '../integrations/platforms/pinterest.js';
import crypto from 'crypto';

export class OAuthManager {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    this.platformAPIs = {
      tiktok: TikTokAPI,
      instagram: InstagramAPI,
      youtube: YouTubeAPI,
      pinterest: PinterestAPI
    };

    // OAuth configuration for each platform
    this.oauthConfig = {
      tiktok: {
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        scope: 'user.info.basic,video.upload,video.publish',
        clientId: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET
      },
      instagram: {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        scope: 'user_profile,user_media,instagram_basic',
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET
      },
      youtube: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET
      },
      pinterest: {
        authUrl: 'https://www.pinterest.com/oauth/',
        tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
        scope: 'boards:read,boards:write,pins:read,pins:write,user_accounts:read',
        clientId: process.env.PINTEREST_CLIENT_ID,
        clientSecret: process.env.PINTEREST_CLIENT_SECRET
      }
    };
  }

  /**
   * Generate authorization URL for a platform
   */
  async getAuthorizationUrl(platform, redirectUri, userId = null) {
    const config = this.oauthConfig[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    // Generate CSRF state token
    const state = this.generateState();

    // Store state in database for verification
    await this.supabase.from('oauth_states').insert({
      state,
      platform,
      user_id: userId,
      redirect_uri: redirectUri,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    });

    // Build authorization URL
    const url = new URL(config.authUrl);
    url.searchParams.append('client_id', config.clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', config.scope);
    url.searchParams.append('state', state);

    // Platform-specific parameters
    if (platform === 'youtube') {
      url.searchParams.append('access_type', 'offline');
      url.searchParams.append('prompt', 'consent');
    }

    return {
      url: url.toString(),
      state
    };
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(platform, code, state, redirectUri) {
    try {
      // Verify state
      const isValidState = await this.verifyState(state, platform);
      if (!isValidState) {
        throw new Error('Invalid state parameter');
      }

      // Get state data
      const { data: stateData } = await this.supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .eq('platform', platform)
        .single();

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(platform, code, redirectUri);

      // Store credentials in database
      const credentials = await this.storeCredentials({
        platform,
        user_id: stateData.user_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        token_type: tokens.token_type,
        scope: tokens.scope
      });

      // Delete used state
      await this.supabase
        .from('oauth_states')
        .delete()
        .eq('state', state);

      return {
        success: true,
        credentials,
        platform
      };

    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(platform, code, redirectUri) {
    const config = this.oauthConfig[platform];

    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    // Platform-specific implementation
    switch (platform) {
      case 'tiktok':
        return await this.exchangeTikTokCode(code, redirectUri);

      case 'instagram':
        return await this.exchangeInstagramCode(code, redirectUri);

      case 'youtube':
        return await this.exchangeYouTubeCode(code, redirectUri);

      case 'pinterest':
        return await this.exchangePinterestCode(code, redirectUri);

      default:
        throw new Error(`Platform ${platform} not implemented`);
    }
  }

  /**
   * TikTok token exchange
   */
  async exchangeTikTokCode(code, redirectUri) {
    const config = this.oauthConfig.tiktok;

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_key: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`TikTok token exchange failed: ${data.error_description}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope
    };
  }

  /**
   * Instagram token exchange (via Facebook)
   */
  async exchangeInstagramCode(code, redirectUri) {
    const config = this.oauthConfig.instagram;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${config.clientId}&` +
      `client_secret=${config.clientSecret}&` +
      `grant_type=authorization_code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`Instagram token exchange failed: ${data.error.message}`);
    }

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${config.clientId}&` +
      `client_secret=${config.clientSecret}&` +
      `fb_exchange_token=${data.access_token}`
    );

    const longLivedData = await longLivedResponse.json();

    return {
      access_token: longLivedData.access_token,
      token_type: longLivedData.token_type,
      expires_in: longLivedData.expires_in
    };
  }

  /**
   * YouTube token exchange
   */
  async exchangeYouTubeCode(code, redirectUri) {
    const config = this.oauthConfig.youtube;

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube token exchange failed: ${data.error_description}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope
    };
  }

  /**
   * Pinterest token exchange
   */
  async exchangePinterestCode(code, redirectUri) {
    const config = this.oauthConfig.pinterest;

    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Pinterest token exchange failed: ${data.error_description}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(platform, refreshToken) {
    const config = this.oauthConfig[platform];

    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    let response;

    switch (platform) {
      case 'tiktok':
        response = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_key: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          })
        });
        break;

      case 'youtube':
        response = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          })
        });
        break;

      case 'pinterest':
        const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
        response = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          })
        });
        break;

      default:
        throw new Error(`Token refresh not implemented for ${platform}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Token refresh failed: ${data.error_description}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_in: data.expires_in
    };
  }

  /**
   * Store credentials in database
   */
  async storeCredentials(data) {
    try {
      const { data: existing } = await this.supabase
        .from('social_media_credentials')
        .select('id')
        .eq('platform', data.platform)
        .eq('user_id', data.user_id || 'default')
        .single();

      if (existing) {
        // Update existing credentials
        const { data: updated, error } = await this.supabase
          .from('social_media_credentials')
          .update({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            token_type: data.token_type,
            scope: data.scope,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        // Insert new credentials
        const { data: created, error } = await this.supabase
          .from('social_media_credentials')
          .insert({
            platform: data.platform,
            user_id: data.user_id || 'default',
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            token_type: data.token_type,
            scope: data.scope,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    } catch (error) {
      console.error('Store credentials error:', error);
      throw error;
    }
  }

  /**
   * Get credentials for a platform
   */
  async getCredentials(platform, userId = 'default') {
    try {
      const { data, error } = await this.supabase
        .from('social_media_credentials')
        .select('*')
        .eq('platform', platform)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Check if token expired
      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          // Token expired, refresh it
          console.log(`Token expired for ${platform}, refreshing...`);
          const newTokens = await this.refreshAccessToken(platform, data.refresh_token);

          // Update stored credentials
          await this.storeCredentials({
            platform,
            user_id: userId,
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token,
            expires_at: newTokens.expires_in
              ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
              : null
          });

          return {
            ...data,
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token
          };
        }
      }

      return data;
    } catch (error) {
      console.error(`Get credentials error for ${platform}:`, error);
      return null;
    }
  }

  /**
   * Delete credentials
   */
  async deleteCredentials(platform, userId = 'default') {
    try {
      await this.supabase
        .from('social_media_credentials')
        .delete()
        .eq('platform', platform)
        .eq('user_id', userId);

      return { success: true };
    } catch (error) {
      console.error('Delete credentials error:', error);
      throw error;
    }
  }

  /**
   * Generate random state token
   */
  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify state token
   */
  async verifyState(state, platform) {
    try {
      const { data, error } = await this.supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .eq('platform', platform)
        .single();

      if (error || !data) return false;

      // Check if expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        // Delete expired state
        await this.supabase
          .from('oauth_states')
          .delete()
          .eq('state', state);

        return false;
      }

      return true;
    } catch (error) {
      console.error('Verify state error:', error);
      return false;
    }
  }

  /**
   * Check if platform is authenticated
   */
  async isAuthenticated(platform, userId = 'default') {
    const credentials = await this.getCredentials(platform, userId);
    return credentials !== null && credentials.access_token !== null;
  }

  /**
   * Get all authenticated platforms for a user
   */
  async getAuthenticatedPlatforms(userId = 'default') {
    try {
      const { data, error } = await this.supabase
        .from('social_media_credentials')
        .select('platform, created_at, updated_at')
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(cred => ({
        platform: cred.platform,
        authenticated_at: cred.created_at,
        last_updated: cred.updated_at
      }));
    } catch (error) {
      console.error('Get authenticated platforms error:', error);
      return [];
    }
  }
}

export default OAuthManager;
