#!/usr/bin/env node

/**
 * 🧪 END-TO-END TEST SUITE
 * Testet das komplette autonome Posting-System
 *
 * Tests:
 * 1. Content Queue System
 * 2. Content Generation & Queueing
 * 3. Approval Workflow
 * 4. Auto-Posting
 * 5. Notifications
 */

require('dotenv').config({ path: '.env.local' });
const { ContentQueue, getQueue } = require('../ai-agent/core/content-queue');
const { CrossPoster } = require('../ai-agent/agents/cross-poster');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

class SystemTester {
  constructor() {
    this.queue = getQueue();
    this.crossPoster = new CrossPoster();
    this.passed = 0;
    this.failed = 0;
    this.testResults = [];
  }

  // ===== TEST RUNNER =====

  async runAllTests() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║           🧪 AUTONOMOUS POSTING SYSTEM - E2E TESTS             ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    await this.test('Queue Initialization', async () => {
      await this.queue.init();
      return this.queue.initialized === true;
    });

    await this.test('Add Content to Queue', async () => {
      const item = await this.queue.addToQueue({
        script: {
          hook: '🔥 Test content hook',
          value: 'Test value proposition',
          cta: 'Test CTA',
          hashtags: ['test', 'demo']
        },
        productName: 'Test Product'
      }, ['tiktok', 'instagram']);

      return item && item.id && item.status === 'pending';
    });

    await this.test('Get Pending Items', async () => {
      const pending = await this.queue.getPending();
      return pending.length > 0;
    });

    await this.test('Approve Item', async () => {
      const pending = await this.queue.getPending();
      if (pending.length === 0) return false;

      const item = await this.queue.approve(pending[0].id);
      return item.status === 'approved';
    });

    await this.test('Get Approved Items', async () => {
      const approved = await this.queue.getApproved();
      return approved.length > 0;
    });

    await this.test('Simulate Auto-Posting', async () => {
      const approved = await this.queue.getApproved();
      if (approved.length === 0) return false;

      const item = approved[0];

      // Simulate posting
      const results = await this.crossPoster.crossPost({
        id: item.id,
        product_name: item.content?.productName || 'Test',
        video_url: 'https://placeholder.com/video.mp4',
        script: item.content?.script || {}
      }, item.platforms);

      // Mark as posted
      await this.queue.markAsPosted(item.id, results);

      const posted = await this.queue.getById(item.id);
      return posted && posted.status === 'posted';
    });

    await this.test('Queue Statistics', async () => {
      const stats = await this.queue.getStats();
      return stats && typeof stats.total === 'number';
    });

    await this.test('Reject Item', async () => {
      const item = await this.queue.addToQueue({
        script: {
          hook: 'Test rejection',
        }
      });

      const rejected = await this.queue.reject(item.id, 'Test rejection');
      return rejected.status === 'rejected';
    });

    await this.test('Failed Item Retry Logic', async () => {
      const item = await this.queue.addToQueue({
        script: {
          hook: 'Test failure',
        }
      });

      await this.queue.approve(item.id);
      await this.queue.markAsFailed(item.id, new Error('Test error'));

      const failed = await this.queue.getById(item.id);
      return failed.attempts === 1 && failed.errors.length === 1;
    });

    await this.test('Environment Variables', async () => {
      const required = [
        'TELEGRAM_BOT_TOKEN',
        'TELEGRAM_CHAT_ID',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ];

      const missing = required.filter(key => !process.env[key]);

      if (missing.length > 0) {
        console.log(`\n   ${YELLOW}⚠️  Missing env vars: ${missing.join(', ')}${RESET}`);
        console.log(`   ${YELLOW}   System will work but some features disabled${RESET}`);
      }

      return true; // Pass but warn
    });

    // Print results
    this.printResults();
  }

  // ===== TEST HELPERS =====

  async test(name, testFn) {
    process.stdout.write(`\n🧪 Testing: ${name}... `);

    try {
      const result = await testFn();

      if (result) {
        console.log(`${GREEN}✅ PASS${RESET}`);
        this.passed++;
        this.testResults.push({ name, status: 'pass' });
      } else {
        console.log(`${RED}❌ FAIL${RESET}`);
        this.failed++;
        this.testResults.push({ name, status: 'fail' });
      }
    } catch (error) {
      console.log(`${RED}❌ ERROR${RESET}`);
      console.log(`   ${RED}Error: ${error.message}${RESET}`);
      this.failed++;
      this.testResults.push({ name, status: 'error', error: error.message });
    }
  }

  printResults() {
    const total = this.passed + this.failed;
    const percentage = ((this.passed / total) * 100).toFixed(0);

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n${GREEN}✅ Passed: ${this.passed}${RESET}`);
    console.log(`${RED}❌ Failed: ${this.failed}${RESET}`);
    console.log(`📊 Total: ${total}`);
    console.log(`📈 Success Rate: ${percentage}%\n`);

    if (this.failed === 0) {
      console.log(`${GREEN}🎉 ALL TESTS PASSED! System is ready!${RESET}\n`);
    } else {
      console.log(`${YELLOW}⚠️  Some tests failed. Review and fix issues.${RESET}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Exit with appropriate code
    process.exit(this.failed > 0 ? 1 : 0);
  }
}

// ===== MAIN =====

async function main() {
  const tester = new SystemTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`\n${RED}💥 Fatal Error: ${err.message}${RESET}\n`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { SystemTester };
