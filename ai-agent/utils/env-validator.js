/**
 * 🔒 ENVIRONMENT VALIDATOR
 *
 * Validates all required environment variables before system starts.
 * Prevents cryptic errors deep in execution.
 *
 * Usage:
 *   const { validateEnvironment } = require('./utils/env-validator');
 *   validateEnvironment(); // Throws if validation fails
 */

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = {
  // Database
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',

  // AI APIs
  GEMINI_API_KEY: 'Google Gemini API key for content generation',

  // Business APIs
  DIGISTORE24_API_KEY: 'DigiStore24 API key for product data',

  // Communication
  TELEGRAM_BOT_TOKEN: 'Telegram bot token for notifications',
  TELEGRAM_CHAT_ID: 'Telegram chat ID for alerts',

  // Email Marketing
  GETRESPONSE_API_KEY: 'GetResponse API key for email automation',
};

/**
 * Optional but recommended environment variables
 */
const OPTIONAL_ENV_VARS = {
  // Social Media (at least one recommended)
  TIKTOK_ACCESS_TOKEN: 'TikTok API access token',
  INSTAGRAM_ACCESS_TOKEN: 'Instagram Graph API token',
  YOUTUBE_API_KEY: 'YouTube Data API key',
  PINTEREST_ACCESS_TOKEN: 'Pinterest API token',
  TWITTER_API_KEY: 'Twitter API key',
  LINKEDIN_ACCESS_TOKEN: 'LinkedIn API token',

  // Additional AI
  OPENAI_API_KEY: 'OpenAI API key (fallback)',
  ZAI_API_KEY: 'Z.AI Image Grounding API key',

  // Payment
  PAYPAL_CLIENT_ID: 'PayPal Client ID for webhook handling',
  PAYPAL_CLIENT_SECRET: 'PayPal Client Secret',

  // Analytics
  SCRAPINGBEE_API_KEY: 'ScrapingBee for web scraping',
};

/**
 * Validate environment variables
 * @param {boolean} strict - If true, throw on missing optional vars
 * @returns {object} Validation result
 */
function validateEnvironment(strict = false) {
  const missing = [];
  const warnings = [];
  const configured = [];

  console.log('\n🔍 Validating Environment Configuration...\n');

  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key] || process.env[key] === '' || process.env[key].includes('your_')) {
      missing.push({ key, description });
      console.error(`❌ MISSING REQUIRED: ${key}`);
      console.error(`   Description: ${description}\n`);
    } else {
      configured.push(key);
      console.log(`✅ ${key}: Configured`);
    }
  }

  // Check optional variables
  for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[key] || process.env[key] === '' || process.env[key].includes('your_')) {
      warnings.push({ key, description });
      if (strict) {
        console.warn(`⚠️  MISSING OPTIONAL: ${key}`);
        console.warn(`   Description: ${description}\n`);
      }
    } else {
      configured.push(key);
      console.log(`✅ ${key}: Configured`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Configured: ${configured.length}`);
  console.log(`   ❌ Missing Required: ${missing.length}`);
  console.log(`   ⚠️  Missing Optional: ${warnings.length}`);

  // Throw if required variables are missing
  if (missing.length > 0) {
    console.error(`\n💥 VALIDATION FAILED: ${missing.length} required environment variables are missing!`);
    console.error(`\n📋 Action Required:`);
    console.error(`   1. Copy .env.example to .env.local`);
    console.error(`   2. Fill in the missing variables listed above`);
    console.error(`   3. Restart the application\n`);

    throw new Error(
      `Environment validation failed: ${missing.length} required variables missing. ` +
      `Missing: ${missing.map(m => m.key).join(', ')}`
    );
  }

  // Warnings for optional but useful variables
  if (warnings.length > 0 && !strict) {
    console.warn(`\n⚠️  ${warnings.length} optional variables not configured.`);
    console.warn(`   Some features may be limited. Configure for full functionality.\n`);
  }

  console.log(`\n✅ Environment validation passed!\n`);

  return {
    success: true,
    configured: configured.length,
    missing: missing.length,
    warnings: warnings.length,
    configuredVars: configured,
    missingVars: missing.map(m => m.key),
    warningVars: warnings.map(w => w.key),
  };
}

/**
 * Get environment info (safe for logging - no secrets)
 */
function getEnvironmentInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  };
}

/**
 * Validate specific required variables (for modular checks)
 */
function validateRequired(...keys) {
  const missing = keys.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Required environment variables missing: ${missing.join(', ')}. ` +
      `Please configure in .env.local`
    );
  }

  return true;
}

module.exports = {
  validateEnvironment,
  validateRequired,
  getEnvironmentInfo,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS,
};
