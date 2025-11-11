#!/usr/bin/env node

/**
 * 🤖 AUTO-POSTING WORKER
 * Postet approved Content automatisch zu allen Plattformen
 *
 * Features:
 * - Polls for approved content
 * - Posts to all platforms automatically
 * - Error handling & retry logic
 * - Notifications on success/failure
 * - Runs continuously in background
 */

require('dotenv').config({ path: '.env.local' });
const { getQueue } = require('../core/content-queue');
const { CrossPoster } = require('../agents/cross-poster');
const { TelegramBot } = require('../telegram-bot');

const POLL_INTERVAL = 30000; // Check every 30 seconds
const MAX_RETRIES = 3;

class AutoPoster {
  constructor() {
    this.queue = getQueue();
    this.crossPoster = new CrossPoster();
    this.bot = null;
    this.running = false;
    this.stats = {
      started_at: new Date().toISOString(),
      posts_completed: 0,
      posts_failed: 0,
      last_post: null,
    };

    // Try to initialize bot for notifications
    try {
      if (process.env.TELEGRAM_BOT_TOKEN) {
        this.bot = new TelegramBot();
      }
    } catch (error) {
      console.warn('⚠️  Telegram notifications disabled:', error.message);
    }
  }

  // ===== MAIN LOOP =====

  async start() {
    if (this.running) {
      console.log('⚠️  Auto-Poster already running!');
      return;
    }

    this.running = true;

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║           🤖 AUTO-POSTING WORKER STARTED                       ║');
    console.log('║           Autonomous Content Posting Engine                    ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`⏰ Polling every ${POLL_INTERVAL / 1000}s for approved content`);
    console.log(`🔄 Max retries: ${MAX_RETRIES}`);
    console.log(`📱 Telegram notifications: ${this.bot ? 'Enabled' : 'Disabled'}`);
    console.log('\n🚀 Ready to auto-post! Waiting for approved content...\n');

    // Main loop
    while (this.running) {
      try {
        await this.processApprovedContent();
      } catch (error) {
        console.error('❌ Worker error:', error.message);
        console.error('   Stack:', error.stack);

        // Notify about worker error
        await this.notifyError(error);
      }

      // Wait before next poll
      await this.sleep(POLL_INTERVAL);
    }
  }

  async stop() {
    console.log('\n⏸️  Stopping Auto-Poster...');
    this.running = false;
  }

  // ===== PROCESSING =====

  async processApprovedContent() {
    const approved = await this.queue.getApproved();

    if (approved.length === 0) {
      // No approved content - just wait
      return;
    }

    console.log(`\n📦 Found ${approved.length} approved item(s) to post!`);

    for (const item of approved) {
      try {
        await this.postItem(item);
      } catch (error) {
        console.error(`❌ Failed to post item ${item.id}:`, error.message);
      }

      // Rate limiting between posts
      await this.sleep(5000);
    }
  }

  async postItem(item) {
    console.log(`\n▶️  Processing: ${item.id}`);
    console.log(`   Platforms: ${item.platforms.join(', ')}`);
    console.log(`   Attempts: ${item.attempts || 0}/${MAX_RETRIES}`);

    // Notify start
    await this.notifyPostingStart(item);

    try {
      // Post to all platforms
      const results = await this.crossPoster.crossPost(
        {
          id: item.id,
          product_name: item.content?.productName || 'Affiliate Product',
          video_url: item.content?.videoUrl || 'https://placeholder.com/video.mp4',
          image_url: item.content?.imageUrl || 'https://placeholder.com/image.jpg',
          affiliate_link: item.content?.affiliateLink || '',
          script: item.content?.script || {
            hook: item.content?.caption || 'Check this out!',
            value: item.content?.description || '',
            cta: 'Link in Bio!',
            hashtags: item.content?.hashtags || ['viral', 'trending']
          }
        },
        item.platforms
      );

      // Check results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        // At least some platforms succeeded
        await this.queue.markAsPosted(item.id, results);

        this.stats.posts_completed++;
        this.stats.last_post = new Date().toISOString();

        console.log(`✅ Posted successfully: ${item.id}`);
        console.log(`   Success: ${successCount}/${results.length} platforms`);

        // Notify success
        await this.notifyPostingSuccess(item, results);

        return true;

      } else {
        // All platforms failed
        throw new Error(`All ${failCount} platforms failed`);
      }

    } catch (error) {
      console.error(`❌ Posting failed: ${error.message}`);

      // Mark as failed (will retry if under MAX_RETRIES)
      await this.queue.markAsFailed(item.id, error);

      this.stats.posts_failed++;

      // Notify failure
      await this.notifyPostingFailure(item, error);

      return false;
    }
  }

  // ===== NOTIFICATIONS =====

  async notifyPostingStart(item) {
    if (!this.bot) return;

    try {
      const preview = item.content?.script?.hook || item.content?.caption || 'Content';

      await this.bot.sendNotification('posting_start', {
        post_id: item.id,
        preview: preview.substring(0, 100),
        platforms: item.platforms.join(', '),
      });
    } catch (error) {
      console.warn('⚠️  Notification error:', error.message);
    }
  }

  async notifyPostingSuccess(item, results) {
    if (!this.bot) return;

    try {
      const successPlatforms = results
        .filter(r => r.success)
        .map(r => r.platform)
        .join(', ');

      const urls = results
        .filter(r => r.url)
        .map(r => `${r.platform}: ${r.url}`)
        .join('\n');

      await this.bot.sendNotification('posting_success', {
        post_id: item.id,
        platforms: successPlatforms,
        urls: urls || 'No URLs available',
        total: results.length,
        success: results.filter(r => r.success).length,
      });
    } catch (error) {
      console.warn('⚠️  Notification error:', error.message);
    }
  }

  async notifyPostingFailure(item, error) {
    if (!this.bot) return;

    try {
      await this.bot.sendNotification('posting_failure', {
        post_id: item.id,
        error: error.message,
        attempts: item.attempts || 0,
        max_retries: MAX_RETRIES,
      });
    } catch (err) {
      console.warn('⚠️  Notification error:', err.message);
    }
  }

  async notifyError(error) {
    if (!this.bot) return;

    try {
      await this.bot.sendNotification('error', {
        error: `Auto-Poster Worker: ${error.message}`,
      });
    } catch (err) {
      console.warn('⚠️  Notification error:', err.message);
    }
  }

  // ===== STATUS =====

  getStatus() {
    const uptime = Date.now() - new Date(this.stats.started_at).getTime();
    const uptimeHours = (uptime / 1000 / 60 / 60).toFixed(2);

    return {
      running: this.running,
      uptime_hours: uptimeHours,
      stats: this.stats,
    };
  }

  async printStatus() {
    const stats = await this.queue.getStats();
    const status = this.getStatus();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 AUTO-POSTER STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🟢 Running: ${status.running ? 'YES' : 'NO'}`);
    console.log(`⏰ Uptime: ${status.uptime_hours} hours`);
    console.log(`✅ Posts Completed: ${status.stats.posts_completed}`);
    console.log(`❌ Posts Failed: ${status.stats.posts_failed}`);
    console.log(`📋 Queue Pending: ${stats.pending}`);
    console.log(`🎯 Queue Approved: ${stats.approved}`);
    console.log(`📤 Total Posted: ${stats.posted}`);
    console.log(`🕐 Last Post: ${status.stats.last_post || 'Never'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // ===== UTILITIES =====

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== MAIN =====

async function main() {
  const poster = new AutoPoster();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Received SIGINT, shutting down gracefully...');
    await poster.stop();
    await poster.printStatus();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️  Received SIGTERM, shutting down gracefully...');
    await poster.stop();
    await poster.printStatus();
    process.exit(0);
  });

  // Print status every 5 minutes
  setInterval(() => {
    poster.printStatus();
  }, 5 * 60 * 1000);

  // Start worker
  await poster.start();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n💥 Fatal Error: ${err.message}\n`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { AutoPoster };
