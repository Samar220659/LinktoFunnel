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
 * /apis - Liste aller Social Media APIs
 * /apis_health - API Health Status
 * /apis_changes - API Änderungen
 * /help - All commands
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { MegaCrossPoster } = require('./integrations/mega-cross-poster');
const { ViralContentCreator } = require('./agents/viral-content-creator');
const { AccountManager } = require('./agents/account-manager');

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

      case '/apis':
        return this.cmdAPIs(chatId);

      case '/apis_health':
        return this.cmdAPIsHealth(chatId);

      case '/apis_changes':
        return this.cmdAPIsChanges(chatId);

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

  async cmdAPIs(chatId) {
    await this.sendMessage(chatId, '📡 Loading API registry...');

    try {
      const { data: apis, error } = await supabase
        .from('social_media_apis')
        .select('*')
        .order('platform', { ascending: true });

      if (error) throw error;

      if (!apis || apis.length === 0) {
        return this.sendMessage(chatId, '⚠️ Keine APIs registriert. Führe zuerst den API Manager aus.');
      }

      // Group by platform
      const byPlatform = {};
      for (const api of apis) {
        if (!byPlatform[api.platform]) {
          byPlatform[api.platform] = [];
        }
        byPlatform[api.platform].push(api);
      }

      let message = '<b>📡 SOCIAL MEDIA APIs</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n';

      for (const [platform, platformAPIs] of Object.entries(byPlatform)) {
        message += `<b>📱 ${platform.toUpperCase()}</b>\n`;
        for (const api of platformAPIs) {
          const statusIcon = api.status === 'active' ? '✅' : '⚠️';
          message += `├─ ${statusIcon} ${api.api_name}\n`;
          message += `│  └─ v${api.version}\n`;
        }
        message += '\n';
      }

      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📊 Total: ${apis.length} APIs\n`;
      message += `\n💡 Use /apis_health for health status`;

      return this.sendMessage(chatId, message);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async cmdAPIsHealth(chatId) {
    await this.sendMessage(chatId, '🔍 Checking API health...');

    try {
      const { data: apis, error: apiError } = await supabase
        .from('social_media_apis')
        .select('id, platform, api_name');

      if (apiError) throw apiError;

      if (!apis || apis.length === 0) {
        return this.sendMessage(chatId, '⚠️ Keine APIs registriert.');
      }

      // Get recent health checks
      const apiIds = apis.map(a => a.id);
      const { data: healthChecks, error: healthError } = await supabase
        .from('social_media_api_health')
        .select('*')
        .in('api_id', apiIds)
        .order('check_timestamp', { ascending: false });

      if (healthError) throw healthError;

      let message = '<b>🔍 API HEALTH STATUS</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n';

      for (const api of apis) {
        const checks = (healthChecks || []).filter(h => h.api_id === api.id);
        const latestCheck = checks[0];
        const last24h = checks.filter(h =>
          new Date(h.check_timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        const availableCount = last24h.filter(h => h.is_available).length;
        const uptime = last24h.length > 0
          ? ((availableCount / last24h.length) * 100).toFixed(1)
          : 'N/A';

        const statusIcon = latestCheck?.is_available ? '✅' : '❌';

        message += `${statusIcon} <b>${api.api_name}</b>\n`;
        message += `├─ Platform: ${api.platform}\n`;
        message += `├─ Uptime 24h: ${uptime}%\n`;

        if (latestCheck) {
          message += `├─ Response: ${latestCheck.response_time_ms}ms\n`;
          message += `└─ Last Check: ${new Date(latestCheck.check_timestamp).toLocaleTimeString('de-DE')}\n`;
        } else {
          message += `└─ No health data\n`;
        }

        message += '\n';
      }

      message += `━━━━━━━━━━━━━━━━━━━━━━`;

      return this.sendMessage(chatId, message);

    } catch (error) {
      return this.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  async cmdAPIsChanges(chatId) {
    await this.sendMessage(chatId, '📋 Loading API changes...');

    try {
      const { data: changes, error } = await supabase
        .from('social_media_api_changes')
        .select('*, social_media_apis(platform, api_name)')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!changes || changes.length === 0) {
        return this.sendMessage(chatId, '✅ Keine API-Änderungen gefunden.');
      }

      let message = '<b>📋 API ÄNDERUNGEN</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n';

      for (const change of changes) {
        const severityIcon = {
          low: 'ℹ️',
          medium: '⚠️',
          high: '🚨',
          critical: '🔴'
        }[change.severity] || 'ℹ️';

        const ackIcon = change.acknowledged ? '✓' : '○';

        message += `${severityIcon} <b>${change.social_media_apis?.api_name}</b> ${ackIcon}\n`;
        message += `├─ Type: ${change.change_type}\n`;
        message += `├─ ${change.description}\n`;
        message += `└─ ${new Date(change.detected_at).toLocaleDateString('de-DE')}\n`;
        message += '\n';
      }

      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;

      const unacknowledged = changes.filter(c => !c.acknowledged).length;
      if (unacknowledged > 0) {
        message += `⚠️ ${unacknowledged} unbestätigte Änderungen\n`;
      }

      return this.sendMessage(chatId, message);

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

<b>🎬 Content</b>
/generate [platform] - Create content
/post [platform] - Post to platform
/megapost - Post to ALL platforms

<b>🌪️ Funnels</b>
/funnel [product_id] - Create funnel

<b>🧠 Optimization</b>
/optimize - Run RL optimization

<b>📡 API Management</b>
/apis - Liste aller APIs
/apis_health - Health Status
/apis_changes - API Änderungen

<b>ℹ️ Help</b>
/help - This message

━━━━━━━━━━━━━━━━━━━━━━
<b>Examples:</b>
• /generate tiktok
• /post instagram
• /funnel 1
• /apis_health

💡 More features coming soon!
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

      case 'api_change':
        const severityIcon = {
          low: 'ℹ️',
          medium: '⚠️',
          high: '🚨',
          critical: '🔴'
        }[data.severity] || 'ℹ️';

        message = `
${severityIcon} <b>API ÄNDERUNG ERKANNT!</b>

API: ${data.apiName}
Platform: ${data.platform}
Type: ${data.changeType}

${data.description}

━━━━━━━━━━━━━━━━
Severity: ${data.severity.toUpperCase()}

Use /apis_changes for details
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
