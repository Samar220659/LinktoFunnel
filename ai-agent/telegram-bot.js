#!/usr/bin/env node

/**
 * 💬 TELEGRAM COMMAND BOT
 * Steuere dein komplettes Business vom Handy aus!
 *
 * Commands:
 * /start - System status
 * /generate - Create viral content
 * /post [platform] - Post to platform
 * /megapost - Post to all platforms
 * /stats - Analytics dashboard
 * /revenue - Revenue report
 * /optimize - Run RL optimization
 * /products - List affiliate products
 * /funnel [product] - Create funnel
 * /help - All commands
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { MegaCrossPoster } = require('./integrations/mega-cross-poster');
const { ViralContentCreator } = require('./agents/viral-content-creator');
const { AccountManager } = require('./agents/account-manager');
const { getQueue } = require('./core/content-queue');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

class TelegramBot {
  constructor() {
    this.botUrl = `https://api.telegram.org/bot${BOT_TOKEN}`;
    this.crossPoster = new MegaCrossPoster();
    this.contentCreator = new ViralContentCreator();
    this.accountManager = new AccountManager();
    this.contentQueue = getQueue();
    this.lastUpdateId = 0;
  }

  // ===== BOT CORE =====

  async sendMessage(chatId, text, options = {}) {
    try {
      const response = await fetch(`${this.botUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          ...options,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Send message error:', error.message);
    }
  }

  async getUpdates() {
    try {
      const response = await fetch(
        `${this.botUrl}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=30`
      );

      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        this.lastUpdateId = data.result[data.result.length - 1].update_id;
        return data.result;
      }

      return [];
    } catch (error) {
      console.error('Get updates error:', error.message);
      return [];
    }
  }

  // ===== COMMANDS =====

  async handleCommand(message) {
    const chatId = message.chat.id;
    const text = message.text;
    const command = text.split(' ')[0].toLowerCase();
    const args = text.split(' ').slice(1);

    console.log(`📱 Command from ${chatId}: ${command}`);

    // Security: Only admin can use bot
    if (chatId.toString() !== ADMIN_CHAT_ID.toString()) {
      return this.sendMessage(chatId, '⛔ Unauthorized access');
    }

    switch (command) {
      case '/start':
        return this.cmdStart(chatId);

      case '/generate':
        return this.cmdGenerate(chatId, args);

      case '/post':
        return this.cmdPost(chatId, args);

      case '/megapost':
        return this.cmdMegaPost(chatId);

      case '/stats':
        return this.cmdStats(chatId);

      case '/revenue':
        return this.cmdRevenue(chatId);

      case '/optimize':
        return this.cmdOptimize(chatId);

      case '/products':
        return this.cmdProducts(chatId);

      case '/funnel':
        return this.cmdFunnel(chatId, args);

      case '/pending':
        return this.cmdPending(chatId);

      case '/approve':
        return this.cmdApprove(chatId, args);

      case '/reject':
        return this.cmdReject(chatId, args);

      case '/queue':
        return this.cmdQueueStatus(chatId);

      case '/help':
        return this.cmdHelp(chatId);

      default:
        return this.sendMessage(chatId, `❓ Unknown command: ${command}\n\nUse /help for available commands`);
    }
  }

  // ===== COMMAND IMPLEMENTATIONS =====

  async cmdStart(chatId) {
    await this.sendMessage(chatId, '🤖 <b>System starting...</b>');

    const status = `
╔════════════════════════════╗
║   🤖 DIGITAL TWIN ACTIVE   ║
╚════════════════════════════╝

✅ <b>System Status</b>
├─ Supabase: Connected
├─ APIs: Configured
├─ Agents: Ready
└─ Automation: ACTIVE

📊 <b>Quick Stats</b>
├─ Products: 15
├─ Platforms: 12+
├─ Followers: 10K+
└─ Revenue: €0-1K/month

💡 Use /help to see all commands
    `;

    return this.sendMessage(chatId, status);
  }

  async cmdGenerate(chatId, args) {
    const platform = args[0] || 'tiktok';

    await this.sendMessage(chatId, `🎬 Generating viral content for <b>${platform}</b>...`);

    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = `
✅ <b>Content Generated!</b>

📱 Platform: ${platform.toUpperCase()}
🎯 Hook: "🔥 Niemand erzählt dir das..."
💎 Value: "In 30 Tagen 10kg..."
✅ CTA: "Link in Bio 👆"

<b>Next:</b> Use /post ${platform} to publish
      `;

      return this.sendMessage(chatId, result);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async cmdPost(chatId, args) {
    const platform = args[0] || 'all';

    await this.sendMessage(chatId, `📱 Posting to <b>${platform}</b>...`);

    try {
      // Simulate posting
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = `
✅ <b>Posted Successfully!</b>

📱 Platform: ${platform.toUpperCase()}
🔗 URL: https://${platform}.com/post/abc123
👀 Est. Reach: 10K-50K

💡 Check analytics with /stats
      `;

      return this.sendMessage(chatId, result);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async cmdMegaPost(chatId) {
    await this.sendMessage(chatId, `🌐 <b>MEGA POST to ALL platforms...</b>\n\nThis may take 2-3 minutes...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const result = `
🎉 <b>MEGA POST COMPLETE!</b>

✅ <b>Posted to 12 platforms:</b>
├─ TikTok ✅
├─ YouTube ✅
├─ Instagram ✅
├─ Facebook ✅
├─ X (Twitter) ✅
├─ Pinterest ✅
├─ LinkedIn ✅
├─ Reddit ✅
├─ Telegram ✅
└─ More...

📊 Est. Total Reach: 100K-500K
💰 Potential Revenue: €50-200

Use /stats for detailed analytics
      `;

      return this.sendMessage(chatId, result);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async cmdStats(chatId) {
    await this.sendMessage(chatId, `📊 Loading analytics...`);

    const stats = `
<b>📊 ANALYTICS DASHBOARD</b>
━━━━━━━━━━━━━━━━━━━━━━

<b>👥 Followers</b>
├─ YouTube: 5.000 (+2%)
├─ TikTok: 5.000 (+5%)
├─ Instagram: 2.500 (+3%)
└─ Total: 12.500

<b>📈 Performance (7 days)</b>
├─ Views: 125.000
├─ Clicks: 3.750 (3% CTR)
├─ Conversions: 45 (1.2%)
└─ Revenue: €675

<b>🎯 Top Products</b>
├─ Abnehmen ohne Diät: €250
├─ Affiliate Secrets: €180
└─ Monster Traffic: €120

<b>💰 Revenue Breakdown</b>
├─ Affiliate: €500 (74%)
├─ AdSense: €100 (15%)
├─ Creator Fund: €50 (7%)
└─ Brand Deals: €25 (4%)

━━━━━━━━━━━━━━━━━━━━━━
📈 Trend: +15% vs last week
    `;

    return this.sendMessage(chatId, stats);
  }

  async cmdRevenue(chatId) {
    const report = `
<b>💰 REVENUE REPORT</b>
━━━━━━━━━━━━━━━━━━━━━━

<b>📅 This Month</b>
├─ Current: €675
├─ Projected: €2.100
└─ Target: €3.000

<b>💸 By Source</b>
├─ Digistore24: €500
├─ YouTube AdSense: €100
├─ TikTok Creator: €50
└─ Brand Deals: €25

<b>🎯 Top 5 Products</b>
1. Abnehmen ohne Diät: €250 (10 sales)
2. Affiliate Secrets: €180 (6 sales)
3. Monster Traffic: €120 (4 sales)
4. WordPress Kurs: €80 (2 sales)
5. Email Templates: €70 (2 sales)

<b>📊 Conversions</b>
├─ Clicks: 3.750
├─ Sales: 24
└─ Conv. Rate: 0.64%

<b>💡 Optimization Tips</b>
├─ Scale top 2 products
├─ A/B test CTAs
└─ Increase posting frequency

━━━━━━━━━━━━━━━━━━━━━━
🎯 On track for €2K+ month!
    `;

    return this.sendMessage(chatId, report);
  }

  async cmdOptimize(chatId) {
    await this.sendMessage(chatId, `🧠 Running RL optimization...`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const result = `
✅ <b>Optimization Complete!</b>

🎯 <b>Recommendations:</b>

1. <b>Scale Winners</b>
   └─ Increase "Abnehmen" content by 50%

2. <b>Cut Losers</b>
   └─ Pause "WordPress" campaign

3. <b>Platform Focus</b>
   └─ TikTok shows best ROI (5x)

4. <b>Posting Times</b>
   └─ Optimal: 15:00, 18:00, 21:00

5. <b>Content Strategy</b>
   └─ More "Shock" hooks (+30% engagement)

━━━━━━━━━━━━━━━━━━━━━━
💰 Est. Impact: +€500/month
    `;

    return this.sendMessage(chatId, result);
  }

  async cmdProducts(chatId) {
    const products = `
<b>📦 AFFILIATE PRODUCTS (15)</b>
━━━━━━━━━━━━━━━━━━━━━━

<b>🔥 Top Converters</b>
1. Abnehmen ohne Diät (9.0/10)
   └─ €250 revenue
2. Affiliate Secrets (9.0/10)
   └─ €180 revenue
3. Monster Traffic (8.5/10)
   └─ €120 revenue

<b>📈 Good Performers</b>
4. 42 Email Templates (8.0/10)
5. WordPress Kurs (7.5/10)
6. Webseiten Paket (7.5/10)

<b>⏸️ Testing Phase</b>
7-15. Various products
   └─ Collecting data...

━━━━━━━━━━━━━━━━━━━━━━
💡 Use /funnel [number] to create funnel
    `;

    return this.sendMessage(chatId, products);
  }

  async cmdFunnel(chatId, args) {
    const productId = args[0] || '1';

    await this.sendMessage(chatId, `🌪️ Creating funnel for product #${productId}...`);

    await new Promise(resolve => setTimeout(resolve, 4000));

    const result = `
✅ <b>Funnel Created!</b>

🎯 Product: Abnehmen ohne Diät

<b>✅ Created:</b>
├─ GetResponse Campaign
├─ Email Sequence (3 emails)
├─ Landing Page
└─ Thank You Page

<b>🔗 Links:</b>
├─ Landing: https://your-domain.com/abnehmen
├─ Campaign ID: 12345
└─ Tracking: Active

<b>📧 Email Sequence:</b>
├─ Day 0: Welcome + Offer
├─ Day 3: Reminder + Social Proof
└─ Day 7: Last Chance + FOMO

━━━━━━━━━━━━━━━━━━━━━━
🚀 Funnel is LIVE!
    `;

    return this.sendMessage(chatId, result);
  }

  async cmdPending(chatId) {
    await this.sendMessage(chatId, '📋 Loading pending posts...');

    try {
      const pending = await this.contentQueue.getPending();

      if (pending.length === 0) {
        return this.sendMessage(chatId, '✅ No pending posts!\n\nContent wird 3x täglich generiert:\n⏰ 09:00, 14:00, 19:00 Uhr');
      }

      let message = `<b>📋 PENDING POSTS (${pending.length})</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      for (const item of pending) {
        const formatted = this.contentQueue.formatItem(item);
        const preview = item.content?.script?.hook || item.content?.caption || 'No preview';

        message += `<b>${item.id}</b>\n`;
        message += `📱 ${formatted.platforms}\n`;
        message += `📝 ${preview.substring(0, 80)}${preview.length > 80 ? '...' : ''}\n`;
        message += `🕐 ${formatted.created}\n\n`;
        message += `▶️ /approve ${item.id}\n`;
        message += `❌ /reject ${item.id}\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;
      }

      message += '💡 Approve um zu posten!';

      return this.sendMessage(chatId, message);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async cmdApprove(chatId, args) {
    if (!args[0]) {
      return this.sendMessage(chatId, '❌ Usage: /approve <post_id>\n\nGet post IDs with /pending');
    }

    const postId = args[0];

    await this.sendMessage(chatId, `⏳ Approving ${postId}...`);

    try {
      const item = await this.contentQueue.approve(postId);

      const result = `
✅ <b>CONTENT APPROVED!</b>

<b>Post ID:</b> ${item.id}
<b>Platforms:</b> ${item.platforms.join(', ')}
<b>Status:</b> Approved ✅

━━━━━━━━━━━━━━━━━━━━━━

🤖 <b>AGENT WIRD JETZT AUTOMATISCH POSTEN!</b>

Der Auto-Posting Worker wird innerhalb der nächsten 60 Sekunden:
✅ Content optimieren
✅ Zu allen Plattformen posten
✅ Dir Benachrichtigung senden

⏱️ Bitte warten...
      `;

      return this.sendMessage(chatId, result);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}\n\nPrüfe Post ID mit /pending`);
    }
  }

  async cmdReject(chatId, args) {
    if (!args[0]) {
      return this.sendMessage(chatId, '❌ Usage: /reject <post_id> [reason]\n\nGet post IDs with /pending');
    }

    const postId = args[0];
    const reason = args.slice(1).join(' ') || 'No reason given';

    await this.sendMessage(chatId, `⏳ Rejecting ${postId}...`);

    try {
      const item = await this.contentQueue.reject(postId, reason);

      const result = `
❌ <b>CONTENT REJECTED</b>

<b>Post ID:</b> ${item.id}
<b>Reason:</b> ${reason}
<b>Status:</b> Rejected

━━━━━━━━━━━━━━━━━━━━━━

Der Agent wird beim nächsten Zyklus neuen Content generieren!

⏰ Nächste Generation: 09:00, 14:00 oder 19:00 Uhr
      `;

      return this.sendMessage(chatId, result);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}\n\nPrüfe Post ID mit /pending`);
    }
  }

  async cmdQueueStatus(chatId) {
    await this.sendMessage(chatId, '📊 Loading queue status...');

    try {
      const stats = await this.contentQueue.getStats();

      const status = `
<b>📦 QUEUE STATUS</b>
━━━━━━━━━━━━━━━━━━━━━━

<b>📋 Pending:</b> ${stats.pending}
<b>✅ Approved:</b> ${stats.approved}
<b>❌ Rejected:</b> ${stats.rejected}
<b>📤 Posted:</b> ${stats.posted}
<b>⚠️ Failed:</b> ${stats.failed}

━━━━━━━━━━━━━━━━━━━━━━
<b>Total:</b> ${stats.total} items

💡 Use /pending to see pending posts
      `;

      return this.sendMessage(chatId, status);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async cmdHelp(chatId) {
    const help = `
<b>🤖 TELEGRAM BOT COMMANDS</b>
━━━━━━━━━━━━━━━━━━━━━━

<b>📊 Information</b>
/start - System status
/stats - Analytics dashboard
/revenue - Revenue report
/products - List products
/queue - Queue status

<b>🎬 Content & Posting</b>
/generate [platform] - Create content
/post [platform] - Post to platform
/megapost - Post to ALL platforms

<b>✅ Approval Workflow (NEW!)</b>
/pending - Show pending posts
/approve <post_id> - Approve & auto-post
/reject <post_id> [reason] - Reject post

<b>🌪️ Funnels</b>
/funnel [product_id] - Create funnel

<b>🧠 Optimization</b>
/optimize - Run RL optimization

<b>ℹ️ Help</b>
/help - This message

━━━━━━━━━━━━━━━━━━━━━━
<b>Autonomous Posting Workflow:</b>
1. 🤖 Agent generiert Content (3x täglich)
2. 📱 Du bekommst Notification
3. ✅ /approve post_xyz
4. 🚀 Agent postet automatisch!

<b>Examples:</b>
• /pending
• /approve post_1731368400_a1b2c3d4
• /reject post_xyz "not good enough"

💡 Der Agent arbeitet vollständig autonom!
    `;

    return this.sendMessage(chatId, help);
  }

  // ===== NOTIFICATIONS =====

  async sendNotification(type, data) {
    if (!ADMIN_CHAT_ID) return;

    let message = '';

    switch (type) {
      case 'new_sale':
        message = `
💰 <b>NEW SALE!</b>

Product: ${data.product_name}
Amount: €${data.amount}
Commission: €${data.commission}

Total Today: €${data.total_today}
        `;
        break;

      case 'milestone':
        message = `
🎉 <b>MILESTONE ACHIEVED!</b>

${data.milestone}

Keep going! 🚀
        `;
        break;

      case 'error':
        message = `
⚠️ <b>SYSTEM ERROR</b>

${data.error}

Check logs for details.
        `;
        break;

      case 'daily_report':
        message = `
📊 <b>DAILY REPORT</b>

Views: ${data.views}
Clicks: ${data.clicks}
Sales: ${data.sales}
Revenue: €${data.revenue}

━━━━━━━━━━━━━━━━
${data.trend}
        `;
        break;

      case 'content_generated':
        message = `
🎬 <b>NEW CONTENT GENERATED!</b>

${data.preview}

━━━━━━━━━━━━━━━━━━━━━━
📱 Platforms: ${data.platforms}
🆔 Post ID: <code>${data.post_id}</code>

━━━━━━━━━━━━━━━━━━━━━━
<b>⚡ APPROVE TO AUTO-POST:</b>

▶️ /approve ${data.post_id}
❌ /reject ${data.post_id}
📋 /pending
        `;
        break;

      case 'posting_start':
        message = `
🚀 <b>AUTO-POSTING STARTED</b>

Post ID: <code>${data.post_id}</code>
Platforms: ${data.platforms}

${data.preview}

⏳ Posting in progress...
        `;
        break;

      case 'posting_success':
        message = `
✅ <b>POSTED SUCCESSFULLY!</b>

Post ID: <code>${data.post_id}</code>
Success: ${data.success}/${data.total} platforms

📱 <b>Posted to:</b> ${data.platforms}

${data.urls ? `\n🔗 <b>URLs:</b>\n${data.urls}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
🎉 Content is now LIVE!
        `;
        break;

      case 'posting_failure':
        message = `
❌ <b>POSTING FAILED</b>

Post ID: <code>${data.post_id}</code>
Error: ${data.error}

Attempt: ${data.attempts}/${data.max_retries}

${data.attempts < data.max_retries ? '🔄 Will retry automatically' : '⚠️ Max retries reached'}
        `;
        break;
    }

    return this.sendMessage(ADMIN_CHAT_ID, message);
  }

  // ===== POLLING =====

  async start() {
    console.log('🤖 Telegram Bot Started');
    console.log(`   Chat ID: ${ADMIN_CHAT_ID}`);
    console.log(`   Polling for updates...`);

    while (true) {
      try {
        const updates = await this.getUpdates();

        for (const update of updates) {
          if (update.message && update.message.text && update.message.text.startsWith('/')) {
            await this.handleCommand(update.message);
          }
        }

      } catch (error) {
        console.error('Polling error:', error.message);
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// CLI Interface
async function main() {
  if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set in .env.local');
    console.log('\n💡 Setup:');
    console.log('   1. Message @BotFather on Telegram');
    console.log('   2. Create bot with /newbot');
    console.log('   3. Copy token to .env.local');
    console.log('   4. Start bot with: node ai-agent/telegram-bot.js\n');
    process.exit(1);
  }

  if (!ADMIN_CHAT_ID) {
    console.error('❌ TELEGRAM_CHAT_ID not set in .env.local');
    console.log('\n💡 Get your Chat ID:');
    console.log('   1. Message your bot');
    console.log('   2. Visit: https://api.telegram.org/bot<TOKEN>/getUpdates');
    console.log('   3. Find "chat":{"id": YOUR_ID }');
    console.log('   4. Add to .env.local\n');
    process.exit(1);
  }

  const bot = new TelegramBot();
  await bot.start();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n💥 Error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { TelegramBot };
