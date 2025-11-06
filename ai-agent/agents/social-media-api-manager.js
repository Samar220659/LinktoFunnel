#!/usr/bin/env node

/**
 * 🔐 SOCIAL MEDIA API MANAGER AGENT
 *
 * Funktionen:
 * - Sammelt und verwaltet APIs von sozialen Netzwerken
 * - Überwacht API-Änderungen (Versionen, Endpoints, Deprecations)
 * - Hohes Sicherheitslevel mit Verschlüsselung
 * - Direkte Verifizierung bei Anbietern
 * - Benachrichtigungen bei Änderungen
 *
 * Unterstützte Plattformen:
 * - TikTok (Creator API, Business API)
 * - Instagram (Graph API)
 * - YouTube (Data API v3)
 * - Pinterest (API v5)
 * - Twitter/X (API v2)
 * - LinkedIn (Marketing API)
 * - Facebook (Graph API)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// ===== SOCIAL MEDIA API DEFINITIONS =====

const SOCIAL_MEDIA_APIS = {
  tiktok: {
    name: 'TikTok',
    apis: [
      {
        name: 'TikTok Creator API',
        baseUrl: 'https://open.tiktokapis.com/v2',
        version: '2.0',
        docsUrl: 'https://developers.tiktok.com/doc/creator-api-overview',
        authType: 'OAuth2',
        endpoints: [
          { path: '/oauth/token/', method: 'POST', purpose: 'Get access token' },
          { path: '/post/publish/video/init/', method: 'POST', purpose: 'Initialize video upload' },
          { path: '/post/publish/status/fetch/', method: 'POST', purpose: 'Check publish status' },
          { path: '/user/info/', method: 'GET', purpose: 'Get user profile' },
        ],
        rateLimit: { requests: 1000, period: '24h' },
        checkUrl: 'https://developers.tiktok.com/doc/creator-api-changelog',
      },
      {
        name: 'TikTok Business API',
        baseUrl: 'https://business-api.tiktok.com/open_api/v1.3',
        version: '1.3',
        docsUrl: 'https://business-api.tiktok.com/portal/docs',
        authType: 'Access Token',
        endpoints: [
          { path: '/advertiser/list/', method: 'GET', purpose: 'List advertisers' },
          { path: '/campaign/list/', method: 'GET', purpose: 'List campaigns' },
        ],
        rateLimit: { requests: 10000, period: '24h' },
        checkUrl: 'https://business-api.tiktok.com/portal/docs?id=1739939095321601',
      }
    ]
  },
  instagram: {
    name: 'Instagram',
    apis: [
      {
        name: 'Instagram Graph API',
        baseUrl: 'https://graph.instagram.com',
        version: 'v19.0',
        docsUrl: 'https://developers.facebook.com/docs/instagram-api',
        authType: 'OAuth2',
        endpoints: [
          { path: '/me', method: 'GET', purpose: 'Get user profile' },
          { path: '/me/media', method: 'POST', purpose: 'Create media' },
          { path: '/me/media_publish', method: 'POST', purpose: 'Publish media' },
          { path: '/{media-id}/insights', method: 'GET', purpose: 'Get media insights' },
        ],
        rateLimit: { requests: 200, period: '1h' },
        checkUrl: 'https://developers.facebook.com/docs/graph-api/changelog',
      }
    ]
  },
  youtube: {
    name: 'YouTube',
    apis: [
      {
        name: 'YouTube Data API v3',
        baseUrl: 'https://www.googleapis.com/youtube/v3',
        version: '3.0',
        docsUrl: 'https://developers.google.com/youtube/v3',
        authType: 'OAuth2',
        endpoints: [
          { path: '/videos', method: 'POST', purpose: 'Upload video' },
          { path: '/videos', method: 'GET', purpose: 'Get video details' },
          { path: '/channels', method: 'GET', purpose: 'Get channel info' },
          { path: '/search', method: 'GET', purpose: 'Search videos' },
        ],
        rateLimit: { requests: 10000, period: '24h' },
        checkUrl: 'https://developers.google.com/youtube/v3/revision_history',
      }
    ]
  },
  pinterest: {
    name: 'Pinterest',
    apis: [
      {
        name: 'Pinterest API v5',
        baseUrl: 'https://api.pinterest.com/v5',
        version: '5.0',
        docsUrl: 'https://developers.pinterest.com/docs/api/v5',
        authType: 'OAuth2',
        endpoints: [
          { path: '/pins', method: 'POST', purpose: 'Create pin' },
          { path: '/boards', method: 'GET', purpose: 'List boards' },
          { path: '/user_account', method: 'GET', purpose: 'Get user info' },
          { path: '/pins/{pin_id}/analytics', method: 'GET', purpose: 'Get pin analytics' },
        ],
        rateLimit: { requests: 1000, period: '24h' },
        checkUrl: 'https://developers.pinterest.com/docs/api/v5/changelog',
      }
    ]
  },
  twitter: {
    name: 'Twitter/X',
    apis: [
      {
        name: 'Twitter API v2',
        baseUrl: 'https://api.twitter.com/2',
        version: '2.0',
        docsUrl: 'https://developer.twitter.com/en/docs/twitter-api',
        authType: 'OAuth2',
        endpoints: [
          { path: '/tweets', method: 'POST', purpose: 'Create tweet' },
          { path: '/users/me', method: 'GET', purpose: 'Get user info' },
          { path: '/tweets/{id}', method: 'GET', purpose: 'Get tweet details' },
          { path: '/tweets/{id}/metrics', method: 'GET', purpose: 'Get tweet metrics' },
        ],
        rateLimit: { requests: 300, period: '15m' },
        checkUrl: 'https://developer.twitter.com/en/docs/twitter-api/migrate/whats-new',
      }
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    apis: [
      {
        name: 'LinkedIn Marketing API',
        baseUrl: 'https://api.linkedin.com/v2',
        version: '2.0',
        docsUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing',
        authType: 'OAuth2',
        endpoints: [
          { path: '/ugcPosts', method: 'POST', purpose: 'Create post' },
          { path: '/me', method: 'GET', purpose: 'Get user profile' },
          { path: '/shares', method: 'POST', purpose: 'Share content' },
        ],
        rateLimit: { requests: 500, period: '24h' },
        checkUrl: 'https://learn.microsoft.com/en-us/linkedin/marketing/versioning',
      }
    ]
  },
  facebook: {
    name: 'Facebook',
    apis: [
      {
        name: 'Facebook Graph API',
        baseUrl: 'https://graph.facebook.com',
        version: 'v19.0',
        docsUrl: 'https://developers.facebook.com/docs/graph-api',
        authType: 'OAuth2',
        endpoints: [
          { path: '/me', method: 'GET', purpose: 'Get user info' },
          { path: '/me/feed', method: 'POST', purpose: 'Create post' },
          { path: '/{page-id}/feed', method: 'POST', purpose: 'Post to page' },
          { path: '/{post-id}/insights', method: 'GET', purpose: 'Get post insights' },
        ],
        rateLimit: { requests: 200, period: '1h' },
        checkUrl: 'https://developers.facebook.com/docs/graph-api/changelog',
      }
    ]
  }
};

// ===== ENCRYPTION UTILITIES =====

class SecureStorage {
  constructor() {
    // Use environment variable for encryption key, or generate one
    this.encryptionKey = process.env.API_ENCRYPTION_KEY || crypto.randomBytes(32);
    this.algorithm = 'aes-256-gcm';
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      log(`❌ Encryption failed: ${error.message}`, 'red');
      throw error;
    }
  }

  decrypt(encryptedData) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        Buffer.from(encryptedData.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      log(`❌ Decryption failed: ${error.message}`, 'red');
      throw error;
    }
  }
}

// ===== SOCIAL MEDIA API MANAGER =====

class SocialMediaAPIManager {
  constructor() {
    this.secureStorage = new SecureStorage();
    this.changeDetected = false;
    this.changes = [];
  }

  async initialize() {
    log('🔐 Initializing Social Media API Manager...', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    // Check if API registry table exists
    try {
      const { data, error } = await supabase
        .from('social_media_apis')
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        log('⚠️  API registry not found. Creating schema...', 'yellow');
        await this.createSchema();
      } else if (error) {
        log(`❌ Database error: ${error.message}`, 'red');
      } else {
        log('✅ API registry connected', 'green');
      }
    } catch (err) {
      log(`❌ Connection error: ${err.message}`, 'red');
    }

    log('✅ Social Media API Manager initialized', 'green');
  }

  async createSchema() {
    const schema = `
-- Social Media APIs Registry
CREATE TABLE IF NOT EXISTS social_media_apis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  api_name TEXT NOT NULL,
  base_url TEXT,
  version TEXT,
  docs_url TEXT,
  auth_type TEXT,
  endpoints JSONB,
  rate_limit JSONB,
  check_url TEXT,
  last_checked TIMESTAMP,
  status TEXT DEFAULT 'active', -- active, deprecated, changed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, api_name)
);

-- API Keys (Encrypted)
CREATE TABLE IF NOT EXISTS social_media_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id UUID REFERENCES social_media_apis(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  encryption_auth_tag TEXT NOT NULL,
  permissions JSONB,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Change Log
CREATE TABLE IF NOT EXISTS social_media_api_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id UUID REFERENCES social_media_apis(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- version_update, endpoint_added, endpoint_removed, deprecated, rate_limit_change
  old_value JSONB,
  new_value JSONB,
  severity TEXT, -- low, medium, high, critical
  description TEXT,
  detected_at TIMESTAMP DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  acknowledged BOOLEAN DEFAULT FALSE
);

-- API Health Monitoring
CREATE TABLE IF NOT EXISTS social_media_api_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_id UUID REFERENCES social_media_apis(id) ON DELETE CASCADE,
  check_timestamp TIMESTAMP DEFAULT NOW(),
  response_time_ms INTEGER,
  status_code INTEGER,
  is_available BOOLEAN,
  error_message TEXT,
  rate_limit_remaining INTEGER,
  rate_limit_reset TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_platform ON social_media_apis(platform);
CREATE INDEX IF NOT EXISTS idx_api_status ON social_media_apis(status);
CREATE INDEX IF NOT EXISTS idx_changes_notified ON social_media_api_changes(notified);
CREATE INDEX IF NOT EXISTS idx_health_timestamp ON social_media_api_health(check_timestamp);
    `;

    log('📝 Schema SQL generated', 'blue');
    log('💾 Save this to Supabase SQL editor:', 'yellow');
    console.log(schema);

    return schema;
  }

  async syncAPIsToDatabase() {
    log('\n📡 Syncing API definitions to database...', 'cyan');

    let syncedCount = 0;
    let updatedCount = 0;

    for (const [platformKey, platformData] of Object.entries(SOCIAL_MEDIA_APIS)) {
      for (const api of platformData.apis) {
        try {
          // Check if API already exists
          const { data: existing, error: selectError } = await supabase
            .from('social_media_apis')
            .select('*')
            .eq('platform', platformKey)
            .eq('api_name', api.name)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            throw selectError;
          }

          const apiData = {
            platform: platformKey,
            api_name: api.name,
            base_url: api.baseUrl,
            version: api.version,
            docs_url: api.docsUrl,
            auth_type: api.authType,
            endpoints: api.endpoints,
            rate_limit: api.rateLimit,
            check_url: api.checkUrl,
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            // Check for changes
            const hasChanges = this.detectAPIChanges(existing, api);

            if (hasChanges) {
              // Update existing API
              const { error: updateError } = await supabase
                .from('social_media_apis')
                .update(apiData)
                .eq('id', existing.id);

              if (updateError) throw updateError;

              log(`   ✓ Updated: ${api.name}`, 'yellow');
              updatedCount++;
            } else {
              log(`   • No changes: ${api.name}`, 'blue');
            }
          } else {
            // Insert new API
            const { error: insertError } = await supabase
              .from('social_media_apis')
              .insert(apiData);

            if (insertError) throw insertError;

            log(`   ✓ Added: ${api.name}`, 'green');
            syncedCount++;
          }
        } catch (err) {
          log(`   ✗ Error syncing ${api.name}: ${err.message}`, 'red');
        }
      }
    }

    log(`\n✅ Sync complete: ${syncedCount} new, ${updatedCount} updated`, 'green');
  }

  detectAPIChanges(existingAPI, newAPI) {
    let hasChanges = false;

    // Check version change
    if (existingAPI.version !== newAPI.version) {
      this.logChange(existingAPI.id, 'version_update', {
        old: existingAPI.version,
        new: newAPI.version,
        severity: 'high',
        description: `API version updated from ${existingAPI.version} to ${newAPI.version}`
      });
      hasChanges = true;
    }

    // Check base URL change
    if (existingAPI.base_url !== newAPI.baseUrl) {
      this.logChange(existingAPI.id, 'base_url_change', {
        old: existingAPI.base_url,
        new: newAPI.baseUrl,
        severity: 'critical',
        description: `Base URL changed from ${existingAPI.base_url} to ${newAPI.baseUrl}`
      });
      hasChanges = true;
    }

    // Check endpoints changes
    const oldEndpoints = JSON.stringify(existingAPI.endpoints || []);
    const newEndpoints = JSON.stringify(newAPI.endpoints || []);

    if (oldEndpoints !== newEndpoints) {
      this.logChange(existingAPI.id, 'endpoints_changed', {
        old: existingAPI.endpoints,
        new: newAPI.endpoints,
        severity: 'medium',
        description: 'API endpoints have been modified'
      });
      hasChanges = true;
    }

    // Check rate limit changes
    const oldRateLimit = JSON.stringify(existingAPI.rate_limit || {});
    const newRateLimit = JSON.stringify(newAPI.rateLimit || {});

    if (oldRateLimit !== newRateLimit) {
      this.logChange(existingAPI.id, 'rate_limit_change', {
        old: existingAPI.rate_limit,
        new: newAPI.rateLimit,
        severity: 'medium',
        description: 'Rate limits have been updated'
      });
      hasChanges = true;
    }

    return hasChanges;
  }

  async logChange(apiId, changeType, details) {
    this.changeDetected = true;
    this.changes.push({
      api_id: apiId,
      change_type: changeType,
      ...details
    });

    try {
      await supabase
        .from('social_media_api_changes')
        .insert({
          api_id: apiId,
          change_type: changeType,
          old_value: details.old,
          new_value: details.new,
          severity: details.severity,
          description: details.description,
        });
    } catch (err) {
      // Silently fail if table doesn't exist
    }
  }

  async storeAPIKey(apiId, keyName, keyValue, permissions = {}, expiresAt = null) {
    log(`🔐 Storing API key: ${keyName}...`, 'cyan');

    try {
      // Encrypt the API key
      const encrypted = this.secureStorage.encrypt(keyValue);

      // Store in database
      const { data, error } = await supabase
        .from('social_media_api_keys')
        .insert({
          api_id: apiId,
          key_name: keyName,
          encrypted_value: encrypted.encrypted,
          encryption_iv: encrypted.iv,
          encryption_auth_tag: encrypted.authTag,
          permissions: permissions,
          expires_at: expiresAt,
        });

      if (error) throw error;

      log(`✅ API key stored securely`, 'green');
      return true;
    } catch (err) {
      log(`❌ Failed to store API key: ${err.message}`, 'red');
      return false;
    }
  }

  async retrieveAPIKey(apiId, keyName) {
    try {
      const { data, error } = await supabase
        .from('social_media_api_keys')
        .select('*')
        .eq('api_id', apiId)
        .eq('key_name', keyName)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Decrypt the API key
      const decrypted = this.secureStorage.decrypt({
        encrypted: data.encrypted_value,
        iv: data.encryption_iv,
        authTag: data.encryption_auth_tag,
      });

      return decrypted;
    } catch (err) {
      log(`❌ Failed to retrieve API key: ${err.message}`, 'red');
      return null;
    }
  }

  async verifyAPIAvailability(platform, apiName) {
    log(`🔍 Verifying API availability: ${apiName}...`, 'cyan');

    try {
      // Get API details from database
      const { data: api, error } = await supabase
        .from('social_media_apis')
        .select('*')
        .eq('platform', platform)
        .eq('api_name', apiName)
        .single();

      if (error) throw error;
      if (!api) {
        log(`   ❌ API not found in registry`, 'red');
        return false;
      }

      // Make a test request to the API
      const startTime = Date.now();

      try {
        const response = await fetch(api.base_url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'LinktoFunnel-API-Monitor/1.0'
          }
        });

        const responseTime = Date.now() - startTime;
        const isAvailable = response.status < 500;

        // Log health check
        await supabase
          .from('social_media_api_health')
          .insert({
            api_id: api.id,
            response_time_ms: responseTime,
            status_code: response.status,
            is_available: isAvailable,
            error_message: !isAvailable ? `HTTP ${response.status}` : null,
          });

        if (isAvailable) {
          log(`   ✅ API available (${responseTime}ms)`, 'green');
        } else {
          log(`   ⚠️  API returned status ${response.status}`, 'yellow');
        }

        return isAvailable;
      } catch (fetchError) {
        // Log failed health check
        await supabase
          .from('social_media_api_health')
          .insert({
            api_id: api.id,
            is_available: false,
            error_message: fetchError.message,
          });

        log(`   ❌ API unreachable: ${fetchError.message}`, 'red');
        return false;
      }
    } catch (err) {
      log(`   ❌ Verification error: ${err.message}`, 'red');
      return false;
    }
  }

  async checkAllAPIs() {
    log('\n🔍 Checking all registered APIs...', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const results = {
      total: 0,
      available: 0,
      unavailable: 0,
      errors: 0,
    };

    for (const [platformKey, platformData] of Object.entries(SOCIAL_MEDIA_APIS)) {
      log(`\n📱 ${platformData.name}:`, 'bright');

      for (const api of platformData.apis) {
        results.total++;

        try {
          const isAvailable = await this.verifyAPIAvailability(platformKey, api.name);
          if (isAvailable) {
            results.available++;
          } else {
            results.unavailable++;
          }
        } catch (err) {
          results.errors++;
          log(`   ❌ Check failed: ${api.name}`, 'red');
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log(`📊 Results: ${results.available}/${results.total} APIs available`, 'bright');

    if (results.unavailable > 0) {
      log(`⚠️  ${results.unavailable} APIs unavailable`, 'yellow');
    }
    if (results.errors > 0) {
      log(`❌ ${results.errors} check errors`, 'red');
    }

    return results;
  }

  async getAPIStatus() {
    log('\n📊 API Status Overview:', 'cyan');

    try {
      const { data: apis, error } = await supabase
        .from('social_media_apis')
        .select('*');

      if (error) throw error;

      if (!apis || apis.length === 0) {
        log('   ℹ️  No APIs registered yet', 'blue');
        return;
      }

      // Group by platform
      const byPlatform = {};
      for (const api of apis) {
        if (!byPlatform[api.platform]) {
          byPlatform[api.platform] = [];
        }
        byPlatform[api.platform].push(api);
      }

      for (const [platform, platformAPIs] of Object.entries(byPlatform)) {
        log(`\n   📱 ${platform.toUpperCase()}:`, 'bright');
        for (const api of platformAPIs) {
          const statusIcon = api.status === 'active' ? '✅' : '⚠️';
          log(`      ${statusIcon} ${api.api_name} (v${api.version})`, 'cyan');
        }
      }

      log(`\n   Total: ${apis.length} APIs registered`, 'green');
    } catch (err) {
      log(`   ❌ Error fetching status: ${err.message}`, 'red');
    }
  }

  async getUnnotifiedChanges() {
    try {
      const { data: changes, error } = await supabase
        .from('social_media_api_changes')
        .select('*, social_media_apis(platform, api_name)')
        .eq('notified', false)
        .order('detected_at', { ascending: false });

      if (error) throw error;

      return changes || [];
    } catch (err) {
      log(`❌ Error fetching changes: ${err.message}`, 'red');
      return [];
    }
  }

  async sendChangeNotifications() {
    const changes = await this.getUnnotifiedChanges();

    if (changes.length === 0) {
      log('✅ No new changes to notify', 'green');
      return;
    }

    log(`\n🔔 ${changes.length} API changes detected:`, 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');

    for (const change of changes) {
      const severityIcon = {
        low: 'ℹ️',
        medium: '⚠️',
        high: '🚨',
        critical: '🔴'
      }[change.severity] || 'ℹ️';

      log(`\n${severityIcon} ${change.social_media_apis?.api_name}`, 'bright');
      log(`   Type: ${change.change_type}`, 'cyan');
      log(`   ${change.description}`, 'white');
      log(`   Detected: ${new Date(change.detected_at).toLocaleString()}`, 'blue');
    }

    // Mark as notified
    try {
      const changeIds = changes.map(c => c.id);
      await supabase
        .from('social_media_api_changes')
        .update({ notified: true })
        .in('id', changeIds);

      log('\n✅ All changes marked as notified', 'green');
    } catch (err) {
      log(`⚠️  Failed to mark changes as notified: ${err.message}`, 'yellow');
    }
  }

  async generateReport() {
    log('\n📋 API Management Report', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    await this.getAPIStatus();

    // Get recent changes
    const changes = await this.getUnnotifiedChanges();
    if (changes.length > 0) {
      log(`\n⚠️  ${changes.length} unnotified changes`, 'yellow');
    }

    // Get health summary
    try {
      const { data: healthChecks, error } = await supabase
        .from('social_media_api_health')
        .select('is_available')
        .gte('check_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!error && healthChecks) {
        const available = healthChecks.filter(h => h.is_available).length;
        const total = healthChecks.length;
        const uptime = total > 0 ? ((available / total) * 100).toFixed(2) : 0;

        log(`\n📊 24h Uptime: ${uptime}% (${available}/${total} checks)`, 'green');
      }
    } catch (err) {
      // Silently skip if health table doesn't exist
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const manager = new SocialMediaAPIManager();

  try {
    await manager.initialize();

    // Sync API definitions to database
    await manager.syncAPIsToDatabase();

    // Check all APIs availability
    await manager.checkAllAPIs();

    // Check for changes and notify
    await manager.sendChangeNotifications();

    // Generate report
    await manager.generateReport();

    log('\n🎉 Social Media API Manager completed!', 'green');

  } catch (error) {
    log(`\n💥 Critical error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SocialMediaAPIManager, SecureStorage };
