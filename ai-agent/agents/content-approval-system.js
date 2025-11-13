#!/usr/bin/env node

/**
 * ✅ CONTENT APPROVAL & AUTONOMOUS POSTING SYSTEM
 *
 * WORKFLOW:
 * 1. Agent generiert Content automatisch
 * 2. Content wird in Queue gestellt
 * 3. User bekommt Telegram Notification
 * 4. User approved via /approve <id>
 * 5. Agent postet AUTOMATISCH auf alle Plattformen
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const QUEUE_DIR = path.join(__dirname, '../.approval_queue');
const APPROVED_DIR = path.join(__dirname, '../.approved_content');
const POSTED_DIR = path.join(__dirname, '../.posted_content');

// Ensure directories exist
[QUEUE_DIR, APPROVED_DIR, POSTED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

class ContentApprovalSystem {

  // ===== QUEUE CONTENT FOR APPROVAL =====

  async queueContent(contentData) {
    const contentId = `content_${Date.now()}`;
    const queueFile = path.join(QUEUE_DIR, `${contentId}.json`);

    const queueItem = {
      id: contentId,
      content: contentData.content,
      platforms: contentData.platforms || ['tiktok', 'instagram', 'youtube'],
      productId: contentData.productId,
      affiliateLink: contentData.affiliateLink,
      createdAt: new Date().toISOString(),
      status: 'pending_approval'
    };

    fs.writeFileSync(queueFile, JSON.stringify(queueItem, null, 2));

    console.log(`✅ Content in Queue: ${contentId}`);

    // Save to database
    await supabase
      .from('content_queue')
      .insert({
        content_id: contentId,
        content: contentData.content,
        platforms: queueItem.platforms,
        status: 'pending_approval',
        product_id: contentData.productId
      });

    return queueItem;
  }

  // ===== GET PENDING CONTENT =====

  getPendingContent() {
    const files = fs.readdirSync(QUEUE_DIR);
    const pending = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = JSON.parse(
          fs.readFileSync(path.join(QUEUE_DIR, file), 'utf8')
        );
        pending.push(content);
      }
    }

    return pending.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  // ===== APPROVE CONTENT =====

  async approveContent(contentId) {
    const queueFile = path.join(QUEUE_DIR, `${contentId}.json`);

    if (!fs.existsSync(queueFile)) {
      throw new Error(`Content ${contentId} nicht gefunden`);
    }

    const content = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    content.status = 'approved';
    content.approvedAt = new Date().toISOString();

    // Move to approved folder
    const approvedFile = path.join(APPROVED_DIR, `${contentId}.json`);
    fs.writeFileSync(approvedFile, JSON.stringify(content, null, 2));
    fs.unlinkSync(queueFile);

    // Update database
    await supabase
      .from('content_queue')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('content_id', contentId);

    console.log(`✅ Content approved: ${contentId}`);

    // TRIGGER AUTONOMOUS POSTING
    await this.postContentAutonomously(content);

    return content;
  }

  // ===== REJECT CONTENT =====

  async rejectContent(contentId, reason = '') {
    const queueFile = path.join(QUEUE_DIR, `${contentId}.json`);

    if (!fs.existsSync(queueFile)) {
      throw new Error(`Content ${contentId} nicht gefunden`);
    }

    fs.unlinkSync(queueFile);

    // Update database
    await supabase
      .from('content_queue')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('content_id', contentId);

    console.log(`❌ Content rejected: ${contentId}`);

    return { success: true, message: 'Content abgelehnt' };
  }

  // ===== AUTONOMOUS POSTING AFTER APPROVAL =====

  async postContentAutonomously(content) {
    console.log(`\n🚀 AUTONOMOUS POSTING GESTARTET für: ${content.id}`);
    console.log(`📱 Platforms: ${content.platforms.join(', ')}\n`);

    const results = {
      contentId: content.id,
      platforms: {},
      timestamp: new Date().toISOString()
    };

    // Import unified poster
    const { UnifiedSocialPoster } = require('../../lib/social-media/unified-poster');
    const poster = new UnifiedSocialPoster();

    // Post to each platform
    for (const platform of content.platforms) {
      try {
        console.log(`   📤 Posting auf ${platform.toUpperCase()}...`);

        const postData = {
          caption: content.content,
          videoUrl: content.videoUrl || null,
          affiliateLink: content.affiliateLink
        };

        let result;

        switch(platform) {
          case 'tiktok':
            result = await poster.postToTikTok(postData);
            break;
          case 'instagram':
            result = await poster.postToInstagram(postData);
            break;
          case 'youtube':
            result = await poster.postToYouTube(postData);
            break;
          default:
            console.log(`   ⚠️  Platform ${platform} nicht unterstützt`);
            continue;
        }

        results.platforms[platform] = {
          success: true,
          postId: result.postId || result.id,
          url: result.url
        };

        console.log(`   ✅ ${platform}: Posted! ID: ${result.postId || result.id}`);

      } catch (error) {
        console.log(`   ❌ ${platform}: ${error.message}`);
        results.platforms[platform] = {
          success: false,
          error: error.message
        };
      }
    }

    // Move to posted folder
    content.postingResults = results;
    content.status = 'posted';
    content.postedAt = new Date().toISOString();

    const postedFile = path.join(POSTED_DIR, `${content.id}.json`);
    fs.writeFileSync(postedFile, JSON.stringify(content, null, 2));

    // Remove from approved folder
    const approvedFile = path.join(APPROVED_DIR, `${content.id}.json`);
    if (fs.existsSync(approvedFile)) {
      fs.unlinkSync(approvedFile);
    }

    // Update database
    await supabase
      .from('content_queue')
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
        posting_results: results
      })
      .eq('content_id', content.id);

    console.log(`\n✅ AUTONOMOUS POSTING ABGESCHLOSSEN!`);
    console.log(`   Erfolgreich: ${Object.values(results.platforms).filter(r => r.success).length}/${content.platforms.length}\n`);

    return results;
  }

  // ===== GET POSTED CONTENT STATS =====

  async getStats() {
    const pending = this.getPendingContent().length;
    const approved = fs.readdirSync(APPROVED_DIR).filter(f => f.endsWith('.json')).length;
    const posted = fs.readdirSync(POSTED_DIR).filter(f => f.endsWith('.json')).length;

    return {
      pending,
      approved,
      posted,
      total: pending + approved + posted
    };
  }
}

// ===== CLI COMMANDS =====

async function main() {
  const system = new ContentApprovalSystem();
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  switch(command) {

    case 'queue':
      // Queue new content for approval
      const content = {
        content: arg1,
        platforms: arg2 ? arg2.split(',') : ['tiktok', 'instagram'],
        productId: 'test-product',
        affiliateLink: 'https://example.com'
      };
      const queued = await system.queueContent(content);
      console.log(`✅ Content queued: ${queued.id}`);
      break;

    case 'pending':
      // List pending content
      const pending = system.getPendingContent();
      console.log(`\n📋 PENDING APPROVAL (${pending.length}):\n`);
      pending.forEach((item, i) => {
        console.log(`${i + 1}. ID: ${item.id}`);
        console.log(`   Content: ${item.content.substring(0, 100)}...`);
        console.log(`   Platforms: ${item.platforms.join(', ')}`);
        console.log(`   Created: ${new Date(item.createdAt).toLocaleString('de-DE')}\n`);
      });
      break;

    case 'approve':
      // Approve content
      if (!arg1) {
        console.log('❌ Usage: approve <content_id>');
        process.exit(1);
      }
      await system.approveContent(arg1);
      console.log(`✅ Content approved und wird AUTOMATISCH gepostet!`);
      break;

    case 'reject':
      // Reject content
      if (!arg1) {
        console.log('❌ Usage: reject <content_id> [reason]');
        process.exit(1);
      }
      await system.rejectContent(arg1, arg2 || 'Nicht approved');
      console.log(`❌ Content rejected: ${arg1}`);
      break;

    case 'stats':
      // Show stats
      const stats = await system.getStats();
      console.log('\n📊 CONTENT STATS:\n');
      console.log(`   ⏳ Pending: ${stats.pending}`);
      console.log(`   ✅ Approved: ${stats.approved}`);
      console.log(`   📤 Posted: ${stats.posted}`);
      console.log(`   📊 Total: ${stats.total}\n`);
      break;

    default:
      console.log(`
🎯 CONTENT APPROVAL SYSTEM

Usage:
  node content-approval-system.js <command> [args]

Commands:
  queue <content> [platforms]   - Queue content for approval
  pending                       - List pending content
  approve <content_id>          - Approve & auto-post content
  reject <content_id> [reason]  - Reject content
  stats                         - Show statistics

Examples:
  node content-approval-system.js pending
  node content-approval-system.js approve content_1699999999999
  node content-approval-system.js stats
      `);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { ContentApprovalSystem };
