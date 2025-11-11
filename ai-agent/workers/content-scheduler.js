#!/usr/bin/env node

/**
 * ⏰ CONTENT GENERATION SCHEDULER
 * Generiert 3x täglich automatisch Content und fügt ihn zur Queue hinzu
 *
 * Schedule:
 * - 09:00 Uhr - Morning Post
 * - 14:00 Uhr - Afternoon Post
 * - 19:00 Uhr - Evening Post
 *
 * Features:
 * - Automatic content generation
 * - Queue integration
 * - Telegram notifications
 * - Error handling & logging
 */

require('dotenv').config({ path: '.env.local' });
const { getQueue } = require('../core/content-queue');
const { TelegramBot } = require('../telegram-bot');

const SCHEDULE_TIMES = [
  { hour: 9, minute: 0, name: 'Morning' },
  { hour: 14, minute: 0, name: 'Afternoon' },
  { hour: 19, minute: 0, name: 'Evening' },
];

const CHECK_INTERVAL = 60000; // Check every minute

class ContentScheduler {
  constructor() {
    this.queue = getQueue();
    this.bot = null;
    this.running = false;
    this.lastGeneration = {};
    this.stats = {
      started_at: new Date().toISOString(),
      generations: 0,
      errors: 0,
      last_generation: null,
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
      console.log('⚠️  Scheduler already running!');
      return;
    }

    this.running = true;

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║           ⏰ CONTENT SCHEDULER STARTED                         ║');
    console.log('║           Automatic 3x Daily Content Generation                ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📅 Schedule:');
    SCHEDULE_TIMES.forEach(time => {
      console.log(`   ${time.name}: ${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`);
    });

    console.log(`\n🔄 Check interval: ${CHECK_INTERVAL / 1000}s`);
    console.log(`📱 Telegram notifications: ${this.bot ? 'Enabled' : 'Disabled'}`);
    console.log('\n🚀 Scheduler ready!\n');

    // Main loop
    while (this.running) {
      try {
        await this.checkSchedule();
      } catch (error) {
        console.error('❌ Scheduler error:', error.message);
        this.stats.errors++;
      }

      await this.sleep(CHECK_INTERVAL);
    }
  }

  async stop() {
    console.log('\n⏸️  Stopping Scheduler...');
    this.running = false;
  }

  // ===== SCHEDULING =====

  async checkSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (const scheduleTime of SCHEDULE_TIMES) {
      if (
        currentHour === scheduleTime.hour &&
        currentMinute === scheduleTime.minute
      ) {
        // Check if already generated this hour today
        const today = now.toISOString().split('T')[0];
        const key = `${today}-${scheduleTime.hour}`;

        if (this.lastGeneration[key]) {
          // Already generated this slot today
          continue;
        }

        // Generate content!
        console.log(`\n⏰ ${scheduleTime.name} generation triggered!`);

        try {
          await this.generateContent(scheduleTime.name);
          this.lastGeneration[key] = new Date().toISOString();
        } catch (error) {
          console.error(`❌ Generation failed:`, error.message);
          this.stats.errors++;
        }
      }
    }

    // Cleanup old generation tracking (keep only today)
    this.cleanupGenerationTracking();
  }

  // ===== CONTENT GENERATION =====

  async generateContent(timeName) {
    console.log(`\n🎬 Generating ${timeName} content...`);

    try {
      // Generate viral content
      const content = await this.createViralContent(timeName);

      // Add to queue for approval
      const queueItem = await this.queue.addToQueue(
        content,
        ['tiktok', 'instagram', 'youtube']
      );

      this.stats.generations++;
      this.stats.last_generation = new Date().toISOString();

      console.log(`✅ Content generated and queued: ${queueItem.id}`);

      // Notify user
      await this.notifyContentGenerated(queueItem);

      return queueItem;

    } catch (error) {
      console.error(`❌ Content generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Create viral content (simplified for now)
   * TODO: Replace with actual AI generation
   */
  async createViralContent(timeName) {
    // Templates für verschiedene Tageszeiten
    const templates = {
      Morning: {
        hooks: [
          '🌅 Guten Morgen! Wusstest du...',
          '☀️ Start your day with this...',
          '💪 Morgen Motivation:',
          '🔥 Das musst du heute wissen!',
        ],
        values: [
          'In nur 30 Minuten kannst du...',
          'Diese einfache Methode hilft dir...',
          'Tausende verdienen bereits damit...',
          'Das verschweigen dir die meisten...',
        ],
      },
      Afternoon: {
        hooks: [
          '⚡ Mittagspause? Perfekt für...',
          '🎯 Die Wahrheit über...',
          '💡 Quick Tip:',
          '🚀 In 5 Minuten verstehen:',
        ],
        values: [
          'So nutzt du deine Zeit optimal...',
          'Dieser Trick spart dir Stunden...',
          'Die meisten machen diesen Fehler...',
          'So einfach kann es sein...',
        ],
      },
      Evening: {
        hooks: [
          '🌙 Guten Abend! Heute noch...',
          '✨ Feierabend-Tipp:',
          '🎬 Das war heute viral:',
          '💰 Heute Geld verdient?',
        ],
        values: [
          'Morgen früh hast du schon...',
          'Über Nacht passiv verdienen...',
          'Während du schläfst läuft das...',
          'Setup einmal, profitiere dauerhaft...',
        ],
      },
    };

    const template = templates[timeName] || templates.Morning;

    const hook = template.hooks[Math.floor(Math.random() * template.hooks.length)];
    const value = template.values[Math.floor(Math.random() * template.values.length)];

    // Trending hashtags (vereinfacht)
    const hashtags = [
      'geldverdienen',
      'passiveseinkommen',
      'affiliatemarketing',
      'onlinebusiness',
      'finanzen',
      'erfolg',
      'motivation',
      'digistore24',
    ];

    // Shuffle and take 5
    const selectedHashtags = hashtags
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    return {
      script: {
        hook: hook,
        value: value,
        proof: '✅ Funktioniert wirklich!',
        cta: '🔗 Link in Bio!',
        hashtags: selectedHashtags,
      },
      productName: 'Affiliate Product',
      videoUrl: 'https://placeholder.com/video.mp4',
      imageUrl: 'https://placeholder.com/image.jpg',
      caption: `${hook}\n\n${value}`,
      description: value,
      affiliateLink: 'https://www.digistore24.com/...',
      generated_at: new Date().toISOString(),
      time_slot: timeName,
    };
  }

  // ===== NOTIFICATIONS =====

  async notifyContentGenerated(queueItem) {
    if (!this.bot) return;

    try {
      const preview = queueItem.content?.script?.hook || queueItem.content?.caption || 'New content';

      await this.bot.sendNotification('content_generated', {
        post_id: queueItem.id,
        preview: preview,
        platforms: queueItem.platforms.join(', '),
      });

      console.log('📱 User notified via Telegram');
    } catch (error) {
      console.warn('⚠️  Notification error:', error.message);
    }
  }

  // ===== UTILITIES =====

  cleanupGenerationTracking() {
    const today = new Date().toISOString().split('T')[0];

    // Remove old entries
    Object.keys(this.lastGeneration).forEach(key => {
      if (!key.startsWith(today)) {
        delete this.lastGeneration[key];
      }
    });
  }

  getNextScheduledTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (const time of SCHEDULE_TIMES) {
      if (time.hour > currentHour || (time.hour === currentHour && time.minute > currentMinute)) {
        return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')} (${time.name})`;
      }
    }

    // Next is tomorrow morning
    return `${String(SCHEDULE_TIMES[0].hour).padStart(2, '0')}:${String(SCHEDULE_TIMES[0].minute).padStart(2, '0')} (${SCHEDULE_TIMES[0].name}) tomorrow`;
  }

  getStatus() {
    const uptime = Date.now() - new Date(this.stats.started_at).getTime();
    const uptimeHours = (uptime / 1000 / 60 / 60).toFixed(2);

    return {
      running: this.running,
      uptime_hours: uptimeHours,
      next_scheduled: this.getNextScheduledTime(),
      stats: this.stats,
    };
  }

  async printStatus() {
    const status = this.getStatus();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CONTENT SCHEDULER STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🟢 Running: ${status.running ? 'YES' : 'NO'}`);
    console.log(`⏰ Uptime: ${status.uptime_hours} hours`);
    console.log(`⏭️  Next: ${status.next_scheduled}`);
    console.log(`📦 Generations: ${status.stats.generations}`);
    console.log(`❌ Errors: ${status.stats.errors}`);
    console.log(`🕐 Last: ${status.stats.last_generation || 'Never'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== MAIN =====

async function main() {
  const scheduler = new ContentScheduler();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Received SIGINT, shutting down gracefully...');
    await scheduler.stop();
    await scheduler.printStatus();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️  Received SIGTERM, shutting down gracefully...');
    await scheduler.stop();
    await scheduler.printStatus();
    process.exit(0);
  });

  // Print status every 30 minutes
  setInterval(() => {
    scheduler.printStatus();
  }, 30 * 60 * 1000);

  // Start scheduler
  await scheduler.start();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n💥 Fatal Error: ${err.message}\n`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { ContentScheduler };
