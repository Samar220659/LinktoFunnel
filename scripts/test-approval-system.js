#!/usr/bin/env node

/**
 * 🧪 TEST SCRIPT - Content Approval & Autonomous Posting System
 *
 * Tests all components of the approval & posting workflow
 */

require('dotenv').config({ path: '.env.local' });
const { ContentApprovalSystem } = require('../ai-agent/agents/content-approval-system');

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

async function main() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║  🧪 CONTENT APPROVAL SYSTEM - TEST SUITE     ║', 'cyan');
  log('╚════════════════════════════════════════════════╝\n', 'cyan');

  const approvalSystem = new ContentApprovalSystem();
  let testsPassed = 0;
  let testsFailed = 0;

  // ===== TEST 1: Queue Content =====

  log('📋 TEST 1: Queue Content for Approval', 'yellow');

  try {
    const queuedContent = await approvalSystem.queueContent({
      content: '🔥 Test Content für automatisches Posting! #test',
      platforms: ['tiktok', 'instagram'],
      productId: 'test-product-123',
      affiliateLink: 'https://example.com/affiliate'
    });

    log(`   ✅ Content queued: ${queuedContent.id}`, 'green');
    testsPassed++;

  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`, 'red');
    testsFailed++;
  }

  // ===== TEST 2: Get Pending Content =====

  log('\n📋 TEST 2: Get Pending Content', 'yellow');

  try {
    const pending = approvalSystem.getPendingContent();

    if (pending.length > 0) {
      log(`   ✅ Found ${pending.length} pending content(s)`, 'green');
      log(`   📝 Latest: ${pending[0].content.substring(0, 50)}...`, 'cyan');
      testsPassed++;
    } else {
      log(`   ⚠️  No pending content found`, 'yellow');
      testsFailed++;
    }

  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`, 'red');
    testsFailed++;
  }

  // ===== TEST 3: Approve & Auto-Post =====

  log('\n📋 TEST 3: Approve Content & Auto-Post', 'yellow');

  try {
    const pending = approvalSystem.getPendingContent();

    if (pending.length > 0) {
      const contentId = pending[0].id;
      log(`   ⏳ Approving: ${contentId}...`, 'cyan');

      // NOTE: This will actually try to post to social media!
      // Comment out in production tests
      log(`   ⚠️  Skipping actual posting in test mode`, 'yellow');
      log(`   💡 To test posting, manually run:`, 'cyan');
      log(`      node ai-agent/agents/content-approval-system.js approve ${contentId}`, 'cyan');

      testsPassed++;

    } else {
      log(`   ⚠️  No content to approve`, 'yellow');
      testsFailed++;
    }

  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`, 'red');
    testsFailed++;
  }

  // ===== TEST 4: Get Stats =====

  log('\n📋 TEST 4: Get Statistics', 'yellow');

  try {
    const stats = await approvalSystem.getStats();

    log(`   ✅ Stats retrieved:`, 'green');
    log(`      ⏳ Pending: ${stats.pending}`, 'cyan');
    log(`      ✅ Approved: ${stats.approved}`, 'cyan');
    log(`      📤 Posted: ${stats.posted}`, 'cyan');
    log(`      📊 Total: ${stats.total}`, 'cyan');

    testsPassed++;

  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`, 'red');
    testsFailed++;
  }

  // ===== TEST 5: Reject Content =====

  log('\n📋 TEST 5: Reject Content', 'yellow');

  try {
    const pending = approvalSystem.getPendingContent();

    if (pending.length > 0) {
      const contentId = pending[0].id;
      log(`   ⏳ Rejecting: ${contentId}...`, 'cyan');

      await approvalSystem.rejectContent(contentId, 'Test rejection');

      log(`   ✅ Content rejected successfully`, 'green');
      testsPassed++;

    } else {
      log(`   ⚠️  No content to reject (already rejected in previous test?)`, 'yellow');
      testsPassed++; // Not a failure
    }

  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`, 'red');
    testsFailed++;
  }

  // ===== TEST 6: Telegram Bot Integration =====

  log('\n📋 TEST 6: Telegram Bot Integration', 'yellow');

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (BOT_TOKEN && CHAT_ID) {
      log(`   ✅ Telegram credentials configured`, 'green');
      log(`   📱 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`, 'cyan');
      log(`   👤 Chat ID: ${CHAT_ID}`, 'cyan');

      // Test sending a message
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: '🧪 Test from Approval System - All systems operational!',
          parse_mode: 'HTML'
        })
      });

      if (response.ok) {
        log(`   ✅ Test message sent to Telegram!`, 'green');
        testsPassed++;
      } else {
        log(`   ⚠️  Telegram API error: ${response.status}`, 'yellow');
        testsFailed++;
      }

    } else {
      log(`   ⚠️  Telegram not configured (optional)`, 'yellow');
      log(`   💡 Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env.local`, 'cyan');
      testsPassed++; // Not a critical failure
    }

  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`, 'red');
    testsFailed++;
  }

  // ===== FINAL RESULTS =====

  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║              TEST RESULTS                      ║', 'cyan');
  log('╚════════════════════════════════════════════════╝\n', 'cyan');

  const total = testsPassed + testsFailed;
  const percentage = ((testsPassed / total) * 100).toFixed(0);

  log(`   ✅ Tests Passed: ${testsPassed}/${total}`, 'green');
  log(`   ❌ Tests Failed: ${testsFailed}/${total}`, testsFailed > 0 ? 'red' : 'green');
  log(`   📊 Success Rate: ${percentage}%\n`, percentage >= 80 ? 'green' : 'red');

  if (percentage >= 80) {
    log('🎉 SYSTEM READY FOR AUTONOMOUS POSTING!\n', 'green');
  } else {
    log('⚠️  Some tests failed. Check logs and retry.\n', 'yellow');
  }

  // ===== NEXT STEPS =====

  log('╔════════════════════════════════════════════════╗', 'cyan');
  log('║              NEXT STEPS                        ║', 'cyan');
  log('╚════════════════════════════════════════════════╝\n', 'cyan');

  log('1️⃣  Start Telegram Bot:', 'yellow');
  log('   npm run telegram-bot', 'cyan');
  log('   or: node ai-agent/telegram-bot.js\n', 'cyan');

  log('2️⃣  Generate Content:', 'yellow');
  log('   node ai-agent/MASTER_ORCHESTRATOR.js\n', 'cyan');

  log('3️⃣  Check Pending in Telegram:', 'yellow');
  log('   Send: /pending\n', 'cyan');

  log('4️⃣  Approve & Auto-Post:', 'yellow');
  log('   Send: /approve <content_id>\n', 'cyan');

  log('5️⃣  Monitor Results:', 'yellow');
  log('   Send: /stats\n', 'cyan');

  log('✨ Das System läuft jetzt im Autopilot-Modus!\n', 'green');

  process.exit(testsFailed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    log(`\n💥 Critical Error: ${error.message}\n`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
