// 🔐 API KEY MANAGEMENT SYSTEM
// Secure, centralized API key management with Supabase Vault integration

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.MASTER_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

class APIKeyManager {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.useVault = !!this.supabaseServiceKey;
    this.localCachePath = path.join(process.cwd(), '.api-keys.encrypted');
    this.cache = new Map();

    if (this.useVault && this.supabaseUrl) {
      this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
      console.log('🔐 API Key Manager: Using Supabase Vault');
    } else {
      console.log('🔐 API Key Manager: Using local storage (fallback)');
    }
  }

  // ===== ENCRYPTION UTILITIES =====

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // ===== SUPABASE VAULT OPERATIONS =====

  async setKeyInVault(keyName, keyValue) {
    if (!this.useVault) {
      throw new Error('Supabase Vault not available. Using local storage.');
    }

    try {
      // Store in Supabase secrets table (custom implementation)
      const { data, error } = await this.supabase
        .from('api_secrets')
        .upsert({
          key_name: keyName,
          key_value: this.encrypt(keyValue),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key_name'
        });

      if (error) throw error;

      // Update cache
      this.cache.set(keyName, keyValue);

      console.log(`✅ API Key "${keyName}" stored securely in Supabase Vault`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to store key in Vault:`, error.message);
      // Fallback to local storage
      return this.setKeyLocally(keyName, keyValue);
    }
  }

  async getKeyFromVault(keyName) {
    if (!this.useVault) {
      return this.getKeyLocally(keyName);
    }

    // Check cache first
    if (this.cache.has(keyName)) {
      return this.cache.get(keyName);
    }

    try {
      const { data, error } = await this.supabase
        .from('api_secrets')
        .select('key_value')
        .eq('key_name', keyName)
        .single();

      if (error) throw error;

      if (!data) {
        console.warn(`⚠️  API Key "${keyName}" not found in Vault, trying local...`);
        return this.getKeyLocally(keyName);
      }

      const decryptedValue = this.decrypt(data.key_value);
      this.cache.set(keyName, decryptedValue);

      return decryptedValue;
    } catch (error) {
      console.warn(`⚠️  Vault fetch failed for "${keyName}":`, error.message);
      return this.getKeyLocally(keyName);
    }
  }

  // ===== LOCAL STORAGE OPERATIONS (FALLBACK) =====

  async setKeyLocally(keyName, keyValue) {
    try {
      let storage = {};

      // Load existing storage
      try {
        const encrypted = await fs.readFile(this.localCachePath, 'utf8');
        const decrypted = this.decrypt(JSON.parse(encrypted));
        storage = JSON.parse(decrypted);
      } catch (err) {
        // File doesn't exist yet, start fresh
      }

      storage[keyName] = keyValue;

      const encrypted = this.encrypt(JSON.stringify(storage));
      await fs.writeFile(this.localCachePath, JSON.stringify(encrypted), 'utf8');

      // Update cache
      this.cache.set(keyName, keyValue);

      console.log(`✅ API Key "${keyName}" stored locally (encrypted)`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to store key locally:`, error.message);
      return false;
    }
  }

  async getKeyLocally(keyName) {
    // Check cache first
    if (this.cache.has(keyName)) {
      return this.cache.get(keyName);
    }

    try {
      const encrypted = await fs.readFile(this.localCachePath, 'utf8');
      const decrypted = this.decrypt(JSON.parse(encrypted));
      const storage = JSON.parse(decrypted);

      const value = storage[keyName];
      if (value) {
        this.cache.set(keyName, value);
      }

      return value || null;
    } catch (error) {
      // File doesn't exist or can't be read
      return null;
    }
  }

  // ===== PUBLIC API =====

  async setKey(keyName, keyValue) {
    if (this.useVault) {
      return this.setKeyInVault(keyName, keyValue);
    } else {
      return this.setKeyLocally(keyName, keyValue);
    }
  }

  async getKey(keyName, fallbackValue = null) {
    // 1. Check environment variables first (highest priority)
    const envValue = process.env[keyName];
    if (envValue) {
      return envValue;
    }

    // 2. Check vault/local storage
    const storedValue = this.useVault
      ? await this.getKeyFromVault(keyName)
      : await this.getKeyLocally(keyName);

    if (storedValue) {
      return storedValue;
    }

    // 3. Return fallback value
    if (fallbackValue) {
      console.warn(`⚠️  Using fallback value for "${keyName}"`);
      return fallbackValue;
    }

    console.warn(`⚠️  API Key "${keyName}" not found`);
    return null;
  }

  async getAllKeys() {
    const keys = {};
    const keyNames = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SCRAPINGBEE_API_KEY',
      'OPENAI_API_KEY',
      'GEMINI_API_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'DIGISTORE24_API_KEY',
      'GETRESPONSE_API_KEY',
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_CHAT_ID',
      'TIKTOK_ACCESS_TOKEN',
      'INSTAGRAM_ACCESS_TOKEN',
      'YOUTUBE_API_KEY',
      'PINTEREST_ACCESS_TOKEN',
      'TWITTER_API_KEY',
      'LINKEDIN_ACCESS_TOKEN'
    ];

    for (const keyName of keyNames) {
      const value = await this.getKey(keyName);
      keys[keyName] = value ? '***' + value.slice(-4) : '(not set)';
    }

    return keys;
  }

  async deleteKey(keyName) {
    if (this.useVault) {
      try {
        const { error } = await this.supabase
          .from('api_secrets')
          .delete()
          .eq('key_name', keyName);

        if (error) throw error;
        this.cache.delete(keyName);
        console.log(`🗑️  Deleted key "${keyName}" from Vault`);
        return true;
      } catch (error) {
        console.error(`❌ Failed to delete key from Vault:`, error.message);
        return false;
      }
    } else {
      // Delete from local storage
      try {
        const encrypted = await fs.readFile(this.localCachePath, 'utf8');
        const decrypted = this.decrypt(JSON.parse(encrypted));
        const storage = JSON.parse(decrypted);

        delete storage[keyName];

        const newEncrypted = this.encrypt(JSON.stringify(storage));
        await fs.writeFile(this.localCachePath, JSON.stringify(newEncrypted), 'utf8');

        this.cache.delete(keyName);
        console.log(`🗑️  Deleted key "${keyName}" locally`);
        return true;
      } catch (error) {
        console.error(`❌ Failed to delete key locally:`, error.message);
        return false;
      }
    }
  }

  // ===== BULK OPERATIONS =====

  async importFromEnv(envFilePath = '.env.local') {
    try {
      const envContent = await fs.readFile(path.join(process.cwd(), envFilePath), 'utf8');
      const lines = envContent.split('\n');
      let imported = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').trim();

          if (value && value !== 'your_api_key_here' && !value.includes('_here')) {
            await this.setKey(key.trim(), value);
            imported++;
          }
        }
      }

      console.log(`✅ Imported ${imported} API keys from ${envFilePath}`);
      return imported;
    } catch (error) {
      console.error(`❌ Failed to import from .env:`, error.message);
      return 0;
    }
  }

  async exportToEnv(envFilePath = '.env.local') {
    try {
      const keys = await this.getAllKeys();
      const lines = [];

      lines.push('# API Keys - Generated by API Key Manager');
      lines.push('# Generated at: ' + new Date().toISOString());
      lines.push('');

      for (const [key, maskedValue] of Object.entries(keys)) {
        const actualValue = await this.getKey(key);
        if (actualValue) {
          lines.push(`${key}=${actualValue}`);
        }
      }

      await fs.writeFile(path.join(process.cwd(), envFilePath), lines.join('\n'), 'utf8');
      console.log(`✅ Exported API keys to ${envFilePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to export to .env:`, error.message);
      return false;
    }
  }

  // ===== STATUS & HEALTH CHECK =====

  async healthCheck() {
    const status = {
      vaultAvailable: this.useVault,
      localStorageAvailable: true,
      cacheSize: this.cache.size,
      encryptionEnabled: true,
      keysConfigured: []
    };

    const criticalKeys = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GEMINI_API_KEY'
    ];

    for (const keyName of criticalKeys) {
      const value = await this.getKey(keyName);
      status.keysConfigured.push({
        key: keyName,
        configured: !!value,
        source: process.env[keyName] ? 'env' : 'storage'
      });
    }

    return status;
  }
}

// Singleton instance
const apiKeyManager = new APIKeyManager();

export default apiKeyManager;

// ===== CONVENIENCE EXPORTS =====

export const getKey = (keyName, fallback = null) => apiKeyManager.getKey(keyName, fallback);
export const setKey = (keyName, keyValue) => apiKeyManager.setKey(keyName, keyValue);
export const getAllKeys = () => apiKeyManager.getAllKeys();
export const healthCheck = () => apiKeyManager.healthCheck();
export const importFromEnv = (path) => apiKeyManager.importFromEnv(path);
export const exportToEnv = (path) => apiKeyManager.exportToEnv(path);
