#!/usr/bin/env node

/**
 * 🏥 HEALTH MONITORING SCRIPT
 *
 * Monitors the health of the LinktoFunnel service
 * Can be run as a cron job for continuous monitoring
 *
 * Usage:
 *   node scripts/monitor-health.js
 *
 * Cron example (check every 5 minutes):
 *   */5 * * * * cd ~/LinktoFunnel && node scripts/monitor-health.js
 */

const https = require('https');
const http = require('http');

// Configuration
const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:3000';
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK; // Optional: Telegram, Slack, Discord
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;

    const req = lib.get(url, { timeout: 10000 }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data),
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Send alert via Telegram
 */
async function sendTelegramAlert(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram alert');
    }
  } catch (error) {
    console.error('Telegram alert error:', error.message);
  }
}

/**
 * Check service health
 */
async function checkHealth() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    overall: 'unknown',
  };

  console.log('\n🏥 Health Check Starting...\n');
  console.log('═'.repeat(60));

  // 1. Basic liveness check
  console.log('\n1️⃣  Checking liveness...');
  try {
    const response = await makeRequest(`${SERVICE_URL}/api/health`);

    if (response.statusCode === 200) {
      console.log('   ✅ Service is alive');
      console.log(`   ⏱️  Uptime: ${response.body.uptime}`);
      results.checks.liveness = { status: 'ok', ...response.body };
    } else {
      console.log(`   ❌ Service returned ${response.statusCode}`);
      results.checks.liveness = { status: 'error', statusCode: response.statusCode };
    }
  } catch (error) {
    console.log(`   ❌ Service not reachable: ${error.message}`);
    results.checks.liveness = { status: 'error', error: error.message };
  }

  // 2. Readiness check
  console.log('\n2️⃣  Checking readiness...');
  try {
    const response = await makeRequest(`${SERVICE_URL}/api/health/ready`);

    if (response.statusCode === 200) {
      console.log('   ✅ Service is ready to accept traffic');
      results.checks.readiness = { status: 'ready', ...response.body };
    } else {
      console.log(`   ⚠️  Service not ready: ${response.body.message || 'Unknown'}`);
      results.checks.readiness = {
        status: 'not_ready',
        statusCode: response.statusCode,
        ...response.body,
      };
    }
  } catch (error) {
    console.log(`   ❌ Readiness check failed: ${error.message}`);
    results.checks.readiness = { status: 'error', error: error.message };
  }

  // 3. Full health check
  console.log('\n3️⃣  Checking full system health...');
  try {
    const response = await makeRequest(`${SERVICE_URL}/api/health/full`);

    if (response.statusCode === 200) {
      console.log('   ✅ All systems healthy');

      const { system, database, external_apis } = response.body;

      console.log(`\n   📊 System Info:`);
      console.log(`      Memory: ${system.memory.heapUsed}MB / ${system.memory.heapTotal}MB`);
      console.log(`      Uptime: ${Math.floor(system.uptime / 60)} minutes`);

      console.log(`\n   💾 Database: ${database.status}`);

      console.log(`\n   🔌 External APIs:`);
      Object.entries(external_apis).forEach(([name, info]) => {
        console.log(`      ${name}: ${info.configured ? '✅' : '⚠️ '} ${info.status}`);
      });

      results.checks.full = { status: 'healthy', ...response.body };
    } else {
      console.log(`   ⚠️  System degraded`);
      results.checks.full = {
        status: 'degraded',
        statusCode: response.statusCode,
        ...response.body,
      };
    }
  } catch (error) {
    console.log(`   ❌ Full health check failed: ${error.message}`);
    results.checks.full = { status: 'error', error: error.message };
  }

  // Determine overall status
  if (results.checks.liveness?.status === 'ok' && results.checks.readiness?.status === 'ready') {
    results.overall = 'healthy';
    console.log('\n═'.repeat(60));
    console.log('✅ Overall Status: HEALTHY\n');
  } else {
    results.overall = 'unhealthy';
    console.log('\n═'.repeat(60));
    console.log('❌ Overall Status: UNHEALTHY\n');

    // Send alert
    const alertMessage = `
🚨 <b>Health Check Alert</b>

Service: LinktoFunnel
Status: UNHEALTHY
Time: ${new Date().toLocaleString('de-DE')}

Details:
${JSON.stringify(results.checks, null, 2)}
    `;

    await sendTelegramAlert(alertMessage);
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  try {
    const results = await checkHealth();

    // Exit with appropriate code
    process.exit(results.overall === 'healthy' ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Monitoring failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkHealth };
